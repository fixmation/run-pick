import { db } from '../db';
import { liveOrderRequests, driverNotifications, driverProfiles, users, driverConnections } from '@shared/schema';
import { eq, and, sql, isNull, lte, inArray, not } from 'drizzle-orm';
import { assignDriver, calculateDistance } from '../utils/businessLogic';
import WebSocket, { WebSocketServer } from 'ws';

export interface LiveOrderData {
  orderId: number;
  serviceType: 'taxi' | 'food' | 'parcel';
  customerId: number;
  customerName?: string;
  customerPhone?: string;
  pickupLocation: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLocation?: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  vehicleType?: string;
  estimatedFare?: number;
  estimatedDistance?: number;
  estimatedDuration?: number;
  priority?: number;
  maxRadius?: number;
  specialRequests?: string;
}

export class LiveOrderService {
  private static instance: LiveOrderService;
  private websocketServer: WebSocketServer | null = null;
  private driverConnections: Map<number, WebSocket> = new Map(); // driverId -> WebSocket
  private connectionIds: Map<string, number> = new Map(); // connectionId -> driverId
  private assignmentInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAssignmentProcessor();
  }

  static getInstance(): LiveOrderService {
    if (!LiveOrderService.instance) {
      LiveOrderService.instance = new LiveOrderService();
    }
    return LiveOrderService.instance;
  }

  /**
   * Set WebSocket server instance
   */
  setWebSocketServer(wss: WebSocketServer): void {
    this.websocketServer = wss;
    this.setupWebSocketHandlers();
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.websocketServer) return;

    this.websocketServer.on('connection', (ws: WebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const driverId = parseInt(url.searchParams.get('driverId') || '0');
      const connectionId = this.generateConnectionId();

      if (!driverId) {
        ws.close(4000, 'Invalid driver ID');
        return;
      }

      // Store connection
      this.driverConnections.set(driverId, ws);
      this.connectionIds.set(connectionId, driverId);

      // Update database connection record
      this.updateDriverConnection(driverId, connectionId, req);

      console.log(`🔌 Driver ${driverId} connected (${connectionId})`);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleDriverMessage(driverId, data, ws);
        } catch (error) {
          console.error('Error handling driver message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`🔌 Driver ${driverId} disconnected`);
        this.driverConnections.delete(driverId);
        this.connectionIds.delete(connectionId);
        this.updateDriverConnectionStatus(driverId, connectionId, false);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for driver ${driverId}:`, error);
      });

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on('pong', () => {
        this.updateLastPing(connectionId);
      });
    });
  }

  /**
   * Handle incoming messages from drivers
   */
  private async handleDriverMessage(driverId: number, data: any, ws: WebSocket): Promise<void> {
    switch (data.type) {
      case 'accept_order':
        await this.handleOrderAcceptance(driverId, data.notificationId, data.orderId, data.serviceType);
        break;
      
      case 'reject_order':
        await this.handleOrderRejection(driverId, data.notificationId, data.orderId, data.serviceType);
        break;
      
      case 'update_location':
        await this.updateDriverLocation(driverId, data.latitude, data.longitude);
        break;
      
      case 'status_change':
        await this.updateDriverStatus(driverId, data.status);
        break;
      
      case 'heartbeat':
        ws.send(JSON.stringify({ type: 'heartbeat_ack', timestamp: Date.now() }));
        break;
      
      default:
        console.warn(`Unknown message type from driver ${driverId}:`, data.type);
    }
  }

  /**
   * Create a new live order request for driver assignment
   */
  async createLiveOrder(orderData: LiveOrderData): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      // Create live order request
      const [liveOrder] = await db.insert(liveOrderRequests).values({
        orderId: orderData.orderId,
        serviceType: orderData.serviceType,
        customerId: orderData.customerId,
        pickupLatitude: orderData.pickupLatitude.toString(),
        pickupLongitude: orderData.pickupLongitude.toString(),
        dropoffLatitude: orderData.dropoffLatitude?.toString(),
        dropoffLongitude: orderData.dropoffLongitude?.toString(),
        vehicleType: orderData.vehicleType as any,
        maxRadius: (orderData.maxRadius || 10).toString(),
        currentRadius: "2.00", // Start with 2km radius
        priority: orderData.priority || 0,
        expiresAt,
      }).returning();

      console.log(`📋 Live order ${orderData.orderId} created for ${orderData.serviceType} service`);

      // Start immediate assignment process
      await this.assignOrderToNearestDrivers(liveOrder.id);
      
    } catch (error) {
      console.error('Error creating live order:', error);
      throw error;
    }
  }

  /**
   * Find and notify nearest available drivers
   */
  private async assignOrderToNearestDrivers(liveOrderId: number): Promise<void> {
    try {
      const [liveOrder] = await db
        .select()
        .from(liveOrderRequests)
        .where(eq(liveOrderRequests.id, liveOrderId))
        .limit(1);

      if (!liveOrder || liveOrder.status !== 'searching') {
        return;
      }

      const currentRadius = parseFloat(liveOrder.currentRadius);
      const pickupLat = parseFloat(liveOrder.pickupLatitude);
      const pickupLng = parseFloat(liveOrder.pickupLongitude);

      // Find available drivers within current radius
      const availableDrivers = await db
        .select({
          id: driverProfiles.id,
          userId: driverProfiles.userId,
          latitude: driverProfiles.currentLatitude,
          longitude: driverProfiles.currentLongitude,
          vehicleType: driverProfiles.vehicleType,
          rating: driverProfiles.rating,
          totalRides: driverProfiles.totalRides,
          name: users.name,
          phone: users.phone,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .where(
          and(
            eq(driverProfiles.isAvailable, true),
            eq(driverProfiles.isVerified, true),
            eq(driverProfiles.status, 'online'),
            eq(users.isActive, true),
            liveOrder.vehicleType ? eq(driverProfiles.vehicleType, liveOrder.vehicleType) : sql`1=1`,
            // Exclude already assigned/rejected drivers
            liveOrder.assignedDriverIds ? not(inArray(driverProfiles.userId, liveOrder.assignedDriverIds as number[])) : sql`1=1`,
            liveOrder.rejectedDriverIds ? not(inArray(driverProfiles.userId, liveOrder.rejectedDriverIds as number[])) : sql`1=1`
          )
        );

      if (availableDrivers.length === 0) {
        // Expand search radius if no drivers found
        await this.expandSearchRadius(liveOrderId);
        return;
      }

      // Calculate distances and filter by radius
      const driversWithDistance = availableDrivers
        .map(driver => ({
          ...driver,
          distance: driver.latitude && driver.longitude 
            ? calculateDistance(
                pickupLat,
                pickupLng,
                parseFloat(driver.latitude),
                parseFloat(driver.longitude)
              )
            : Infinity
        }))
        .filter(driver => driver.distance <= currentRadius)
        .sort((a, b) => {
          // Sort by distance first, then by rating
          if (a.distance !== b.distance) return a.distance - b.distance;
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        });

      if (driversWithDistance.length === 0) {
        // No drivers within current radius, expand it
        await this.expandSearchRadius(liveOrderId);
        return;
      }

      // Notify top 3 closest drivers simultaneously
      const driversToNotify = driversWithDistance.slice(0, 3);
      
      for (const driver of driversToNotify) {
        await this.sendOrderNotificationToDriver(driver, liveOrder);
      }

      // Update assigned driver IDs
      const assignedIds = [...(liveOrder.assignedDriverIds as number[] || []), ...driversToNotify.map(d => d.userId)];
      await db
        .update(liveOrderRequests)
        .set({
          assignedDriverIds: assignedIds,
          updatedAt: new Date(),
        })
        .where(eq(liveOrderRequests.id, liveOrderId));

      console.log(`📱 Notified ${driversToNotify.length} drivers for order ${liveOrder.orderId}`);

    } catch (error) {
      console.error('Error assigning order to drivers:', error);
    }
  }

  /**
   * Send order notification to specific driver
   */
  private async sendOrderNotificationToDriver(driver: any, liveOrder: any): Promise<void> {
    try {
      // Create notification in database
      const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute to respond

      const [notification] = await db.insert(driverNotifications).values({
        driverId: driver.userId,
        type: liveOrder.serviceType === 'taxi' ? 'ride_request' : 
              liveOrder.serviceType === 'food' ? 'food_order' : 'parcel_pickup',
        title: this.getNotificationTitle(liveOrder.serviceType),
        message: this.getNotificationMessage(liveOrder, driver.distance),
        orderId: liveOrder.orderId,
        serviceType: liveOrder.serviceType,
        priority: 'urgent',
        expiresAt,
        sentVia: 'websocket',
        metadata: {
          pickupLatitude: liveOrder.pickupLatitude,
          pickupLongitude: liveOrder.pickupLongitude,
          dropoffLatitude: liveOrder.dropoffLatitude,
          dropoffLongitude: liveOrder.dropoffLongitude,
          distance: driver.distance,
          estimatedFare: liveOrder.estimatedFare,
          estimatedDuration: liveOrder.estimatedDuration,
          customerName: liveOrder.customerName || 'Customer',
          customerPhone: liveOrder.customerPhone || '',
        },
      }).returning();

      // Send WebSocket notification if driver is connected
      const ws = this.driverConnections.get(driver.userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const notificationData = {
          type: 'new_order_request',
          notificationId: notification.id,
          orderId: liveOrder.orderId,
          serviceType: liveOrder.serviceType,
          title: notification.title,
          message: notification.message,
          distance: Math.round(driver.distance * 10) / 10, // Round to 1 decimal
          estimatedFare: liveOrder.estimatedFare,
          estimatedDuration: liveOrder.estimatedDuration,
          expiresAt: notification.expiresAt,
          metadata: notification.metadata,
          sound: 'notification_ring', // Trigger ringtone
          priority: 'urgent',
          timestamp: Date.now(),
        };

        ws.send(JSON.stringify(notificationData));
        console.log(`📲 Sent live notification to driver ${driver.userId} for order ${liveOrder.orderId}`);
      } else {
        console.log(`📵 Driver ${driver.userId} not connected, notification saved to database`);
      }

    } catch (error) {
      console.error('Error sending notification to driver:', error);
    }
  }

  /**
   * Handle driver accepting an order
   */
  private async handleOrderAcceptance(driverId: number, notificationId: number, orderId: number, serviceType: string): Promise<void> {
    try {
      // Update notification as accepted
      await db
        .update(driverNotifications)
        .set({
          isAccepted: true,
          acceptedAt: new Date(),
        })
        .where(eq(driverNotifications.id, notificationId));

      // Update live order request
      await db
        .update(liveOrderRequests)
        .set({
          status: 'accepted',
          acceptedDriverId: driverId,
          updatedAt: new Date(),
        })
        .where(eq(liveOrderRequests.orderId, orderId));

      // Update the actual order/booking with assigned driver
      await this.assignDriverToOrder(orderId, driverId, serviceType as any);

      // Cancel other notifications for this order
      await this.cancelOtherNotifications(orderId, notificationId);

      console.log(`✅ Driver ${driverId} accepted order ${orderId}`);

    } catch (error) {
      console.error('Error handling order acceptance:', error);
    }
  }

  /**
   * Handle driver rejecting an order
   */
  private async handleOrderRejection(driverId: number, notificationId: number, orderId: number, serviceType: string): Promise<void> {
    try {
      // Update notification as rejected
      await db
        .update(driverNotifications)
        .set({
          isRejected: true,
          rejectedAt: new Date(),
        })
        .where(eq(driverNotifications.id, notificationId));

      // Add driver to rejected list
      const [liveOrder] = await db
        .select()
        .from(liveOrderRequests)
        .where(eq(liveOrderRequests.orderId, orderId))
        .limit(1);

      if (liveOrder) {
        const rejectedIds = [...(liveOrder.rejectedDriverIds as number[] || []), driverId];
        await db
          .update(liveOrderRequests)
          .set({
            rejectedDriverIds: rejectedIds,
            updatedAt: new Date(),
          })
          .where(eq(liveOrderRequests.orderId, orderId));
      }

      console.log(`❌ Driver ${driverId} rejected order ${orderId}`);

      // Try to assign to other drivers
      if (liveOrder) {
        setTimeout(() => {
          this.assignOrderToNearestDrivers(liveOrder.id);
        }, 2000); // Wait 2 seconds before reassigning
      }

    } catch (error) {
      console.error('Error handling order rejection:', error);
    }
  }

  /**
   * Expand search radius for order
   */
  private async expandSearchRadius(liveOrderId: number): Promise<void> {
    try {
      const [liveOrder] = await db
        .select()
        .from(liveOrderRequests)
        .where(eq(liveOrderRequests.id, liveOrderId))
        .limit(1);

      if (!liveOrder) return;

      const currentRadius = parseFloat(liveOrder.currentRadius);
      const maxRadius = parseFloat(liveOrder.maxRadius);
      const newRadius = Math.min(currentRadius + 2, maxRadius); // Expand by 2km

      if (newRadius <= maxRadius) {
        await db
          .update(liveOrderRequests)
          .set({
            currentRadius: newRadius.toString(),
            updatedAt: new Date(),
          })
          .where(eq(liveOrderRequests.id, liveOrderId));

        console.log(`📡 Expanded search radius to ${newRadius}km for order ${liveOrder.orderId}`);

        // Try assignment again with expanded radius
        setTimeout(() => {
          this.assignOrderToNearestDrivers(liveOrderId);
        }, 3000);
      } else {
        // Max radius reached, mark as expired
        await db
          .update(liveOrderRequests)
          .set({
            status: 'expired',
            updatedAt: new Date(),
          })
          .where(eq(liveOrderRequests.id, liveOrderId));

        console.log(`⏰ Order ${liveOrder.orderId} expired - no drivers found within ${maxRadius}km`);
      }

    } catch (error) {
      console.error('Error expanding search radius:', error);
    }
  }

  /**
   * Start the background assignment processor
   */
  private startAssignmentProcessor(): void {
    this.assignmentInterval = setInterval(async () => {
      try {
        // Process expired notifications
        await this.cleanupExpiredNotifications();
        
        // Reassign unaccepted orders
        await this.reassignStaleOrders();
        
      } catch (error) {
        console.error('Error in assignment processor:', error);
      }
    }, 30000); // Run every 30 seconds

    console.log('🔄 Live order assignment processor started');
  }

  /**
   * Clean up expired notifications
   */
  private async cleanupExpiredNotifications(): Promise<void> {
    try {
      const expiredNotifications = await db
        .select()
        .from(driverNotifications)
        .where(
          and(
            lte(driverNotifications.expiresAt, new Date()),
            eq(driverNotifications.isAccepted, false),
            eq(driverNotifications.isRejected, false),
            inArray(driverNotifications.type, ['ride_request', 'food_order', 'parcel_pickup'])
          )
        );

      for (const notification of expiredNotifications) {
        await db
          .update(driverNotifications)
          .set({
            isRejected: true,
            rejectedAt: new Date(),
          })
          .where(eq(driverNotifications.id, notification.id));
      }

      if (expiredNotifications.length > 0) {
        console.log(`🧹 Cleaned up ${expiredNotifications.length} expired notifications`);
      }
    } catch (error) {
      // Graceful degradation - continue operation without database cleanup
      console.log('⚠️  Database unavailable for notification cleanup, continuing with in-memory operations...');
    }
  }

  /**
   * Reassign stale orders
   */
  private async reassignStaleOrders(): Promise<void> {
    try {
      const staleOrders = await db
        .select()
        .from(liveOrderRequests)
        .where(
          and(
            eq(liveOrderRequests.status, 'searching'),
            lte(liveOrderRequests.createdAt, new Date(Date.now() - 2 * 60 * 1000)) // Older than 2 minutes
          )
        );

      for (const order of staleOrders) {
        await this.assignOrderToNearestDrivers(order.id);
      }
    } catch (error) {
      // Graceful degradation - continue operation without database reassignment
      console.log('⚠️  Database unavailable for order reassignment, relying on real-time WebSocket notifications...');
    }
  }

  /**
   * Helper methods
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNotificationTitle(serviceType: string): string {
    switch (serviceType) {
      case 'taxi': return '🚗 New Ride Request';
      case 'food': return '🍔 New Food Delivery';
      case 'parcel': return '📦 New Parcel Pickup';
      default: return '🔔 New Order Request';
    }
  }

  private getNotificationMessage(liveOrder: any, distance: number): string {
    const distanceStr = `${Math.round(distance * 10) / 10}km away`;
    switch (liveOrder.serviceType) {
      case 'taxi':
        return `Pickup nearby - ${distanceStr}`;
      case 'food':
        return `Food delivery request - ${distanceStr}`;
      case 'parcel':
        return `Parcel pickup request - ${distanceStr}`;
      default:
        return `New service request - ${distanceStr}`;
    }
  }

  private async updateDriverConnection(driverId: number, connectionId: string, req: any): Promise<void> {
    try {
      await db.insert(driverConnections).values({
        driverId,
        connectionId,
        isActive: true,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.socket.remoteAddress || '',
      }).onConflictDoUpdate({
        target: driverConnections.connectionId,
        set: {
          isActive: true,
          lastPing: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating driver connection:', error);
    }
  }

  private async updateDriverConnectionStatus(driverId: number, connectionId: string, isActive: boolean): Promise<void> {
    try {
      await db
        .update(driverConnections)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(driverConnections.connectionId, connectionId));
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }

  private async updateLastPing(connectionId: string): Promise<void> {
    try {
      await db
        .update(driverConnections)
        .set({
          lastPing: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(driverConnections.connectionId, connectionId));
    } catch (error) {
      console.error('Error updating last ping:', error);
    }
  }

  private async updateDriverLocation(driverId: number, latitude: number, longitude: number): Promise<void> {
    try {
      await db
        .update(driverProfiles)
        .set({
          currentLatitude: latitude.toString(),
          currentLongitude: longitude.toString(),
          lastLocationUpdate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(driverProfiles.userId, driverId));
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  }

  private async updateDriverStatus(driverId: number, status: string): Promise<void> {
    try {
      await db
        .update(driverProfiles)
        .set({
          status: status as any,
          updatedAt: new Date(),
        })
        .where(eq(driverProfiles.userId, driverId));
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  }

  private async assignDriverToOrder(orderId: number, driverId: number, serviceType: 'taxi' | 'food' | 'parcel'): Promise<void> {
    try {
      const storage = await import('../storage');
      
      switch (serviceType) {
        case 'taxi':
          await storage.storage.updateTaxiBooking(orderId, {
            driverId,
            status: 'confirmed',
          });
          break;
        case 'food':
          await storage.storage.updateFoodOrder(orderId, {
            driverId,
            status: 'confirmed',
          } as any);
          break;
        case 'parcel':
          await storage.storage.updateParcelDelivery(orderId, {
            driverId,
            status: 'confirmed',
          } as any);
          break;
      }
    } catch (error) {
      console.error('Error assigning driver to order:', error);
    }
  }

  private async cancelOtherNotifications(orderId: number, acceptedNotificationId: number): Promise<void> {
    try {
      await db
        .update(driverNotifications)
        .set({
          isRejected: true,
          rejectedAt: new Date(),
        })
        .where(
          and(
            eq(driverNotifications.orderId, orderId),
            not(eq(driverNotifications.id, acceptedNotificationId)),
            eq(driverNotifications.isAccepted, false),
            eq(driverNotifications.isRejected, false)
          )
        );
    } catch (error) {
      console.error('Error cancelling other notifications:', error);
    }
  }

  /**
   * Get connected driver count
   */
  getConnectedDriverCount(): number {
    return this.driverConnections.size;
  }

  /**
   * Broadcast message to all connected drivers
   */
  broadcastToAllDrivers(message: any): void {
    const messageStr = JSON.stringify(message);
    this.driverConnections.forEach((ws, driverId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  /**
   * Send message to specific driver
   */
  sendToDriver(driverId: number, message: any): boolean {
    const ws = this.driverConnections.get(driverId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    if (this.assignmentInterval) {
      clearInterval(this.assignmentInterval);
      this.assignmentInterval = null;
    }

    // Close all WebSocket connections
    this.driverConnections.forEach((ws) => {
      ws.close();
    });
    
    this.driverConnections.clear();
    this.connectionIds.clear();

    console.log('🛑 Live order service shutdown');
  }
}

export default LiveOrderService.getInstance();