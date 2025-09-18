import { WebSocketServer } from 'ws';
import { db } from '../db';
import { 
  notifications, 
  messageLogs, 
  users,
  type Notification,
  type InsertNotification,
  type InsertMessageLog
} from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

interface WebSocketConnection {
  userId: number;
  userRole: string;
  ws: any;
  lastPing: Date;
}

interface NotificationData {
  userId: number;
  userRole: string;
  type: string;
  title: string;
  message: string;
  orderId?: number;
  serviceType?: string;
  priority?: string;
  isActionRequired?: boolean;
  expiresAt?: Date;
  metadata?: any;
  relatedUserId?: number;
  customerInfo?: any;
  locationInfo?: any;
  orderDetails?: any;
}

class NotificationService {
  private wss: WebSocketServer | null = null;
  private connections = new Map<number, WebSocketConnection[]>();
  private pingInterval: NodeJS.Timeout | null = null;

  // Initialize WebSocket server for notifications
  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
    
    wss.on('connection', async (ws, req) => {
      try {
        // Extract session from cookie header
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
          ws.close(1008, 'Authentication required');
          return;
        }

        // Parse session cookie (this is a simplified approach - in production use proper session parsing)
        const sessionCookie = cookieHeader.split(';')
          .find(cookie => cookie.trim().startsWith('connect.sid='));
        
        if (!sessionCookie) {
          ws.close(1008, 'No session found');
          return;
        }

        // For now, get userId and userRole from query params but validate against session
        // In a full implementation, you'd decode the session cookie properly
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const userId = parseInt(url.searchParams.get('userId') || '0');
        const userRole = url.searchParams.get('userRole') || 'customer';
        
        if (!userId) {
          ws.close(1008, 'Invalid user ID');
          return;
        }

        // TODO: Validate userId against session in production
        // For now, we trust the session cookie exists and userId is provided

        // Add connection
        if (!this.connections.has(userId)) {
          this.connections.set(userId, []);
        }
        
        const connection: WebSocketConnection = {
          userId,
          userRole,
          ws,
          lastPing: new Date()
        };
        
        this.connections.get(userId)!.push(connection);
        
        console.log(`🔔 User ${userId} (${userRole}) connected for notifications`);

        // Handle messages from client (ping/pong, read confirmations)
        ws.on('message', async (message: string) => {
          try {
            const data = JSON.parse(message);
            
            if (data.type === 'ping') {
              connection.lastPing = new Date();
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            } else if (data.type === 'mark_read' && data.notificationId) {
              await this.markNotificationAsRead(userId, data.notificationId);
            } else if (data.type === 'take_action' && data.notificationId && data.action) {
              await this.takeNotificationAction(userId, data.notificationId, data.action);
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        });

        // Handle connection close
        ws.on('close', () => {
          this.removeConnection(userId, connection);
          console.log(`🔔 User ${userId} disconnected from notifications`);
        });

        // Handle connection error
        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
          this.removeConnection(userId, connection);
        });

        // Send pending notifications on connect
        this.sendPendingNotifications(userId);

      } catch (error) {
        console.error('Error setting up notification WebSocket connection:', error);
        ws.close(1011, 'Setup error');
      }
    });

    // Start ping interval to maintain connections
    this.startPingInterval();
    console.log('🔔 Notification WebSocket server initialized');
  }

  // Remove a specific connection
  private removeConnection(userId: number, connectionToRemove: WebSocketConnection) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const index = userConnections.indexOf(connectionToRemove);
      if (index !== -1) {
        userConnections.splice(index, 1);
      }
      
      if (userConnections.length === 0) {
        this.connections.delete(userId);
      }
    }
  }

  // Start ping interval to check connection health
  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const staleThreshold = 5 * 60 * 1000; // 5 minutes

      for (const [userId, connections] of Array.from(this.connections.entries())) {
        connections.forEach((connection: WebSocketConnection, index: number) => {
          const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();
          
          if (timeSinceLastPing > staleThreshold) {
            // Connection is stale, remove it
            console.log(`🔔 Removing stale connection for user ${userId}`);
            connection.ws.close();
            this.removeConnection(userId, connection);
          } else {
            // Send ping
            try {
              connection.ws.send(JSON.stringify({ type: 'ping', timestamp: now.toISOString() }));
            } catch (error) {
              console.error(`Error sending ping to user ${userId}:`, error);
              this.removeConnection(userId, connection);
            }
          }
        });
      }
    }, 60000); // Check every minute
  }

  // Send notification to specific user
  async sendNotification(data: NotificationData): Promise<Notification | null> {
    try {
      // Create notification in database
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          userRole: data.userRole as any,
          type: data.type as any,
          title: data.title,
          message: data.message,
          orderId: data.orderId,
          serviceType: data.serviceType as any,
          priority: (data.priority as any) || 'normal',
          isActionRequired: data.isActionRequired || false,
          expiresAt: data.expiresAt,
          sentVia: ['in_app'],
          metadata: data.metadata,
          relatedUserId: data.relatedUserId
        })
        .returning();

      // Create message log
      await db
        .insert(messageLogs)
        .values({
          userId: data.userId,
          userRole: data.userRole as any,
          recipientId: data.userId,
          recipientRole: data.userRole as any,
          messageType: 'notification',
          serviceType: data.serviceType as any,
          orderId: data.orderId,
          title: data.title,
          content: data.message,
          priority: (data.priority as any) || 'normal',
          deliveryMethods: ['in_app'],
          deliveryStatus: 'sent',
          metadata: data.metadata,
          customerInfo: data.customerInfo,
          locationInfo: data.locationInfo,
          orderDetails: data.orderDetails,
          responseRequired: data.isActionRequired || false,
          expiresAt: data.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });

      // Send via WebSocket if user is connected
      await this.sendNotificationViaWebSocket(data.userId, notification);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Send notification via WebSocket to connected clients
  private async sendNotificationViaWebSocket(userId: number, notification: Notification) {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.length === 0) {
      console.log(`🔔 No active connections for user ${userId}, notification queued`);
      return;
    }

    const notificationMessage = {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    };

    // Send to all connections for this user
    userConnections.forEach((connection, index) => {
      try {
        if (connection.ws.readyState === 1) { // WebSocket.OPEN
          connection.ws.send(JSON.stringify(notificationMessage));
          console.log(`🔔 Sent notification to user ${userId} connection ${index + 1}`);
        } else {
          // Connection is not open, remove it
          this.removeConnection(userId, connection);
        }
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        this.removeConnection(userId, connection);
      }
    });
  }

  // Send pending notifications to newly connected user
  private async sendPendingNotifications(userId: number) {
    try {
      // Get unread notifications for user
      const pendingNotifications = await db
        .select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(10); // Send latest 10 notifications

      if (pendingNotifications.length > 0) {
        console.log(`🔔 Sending ${pendingNotifications.length} pending notifications to user ${userId}`);
        
        for (const notification of pendingNotifications) {
          await this.sendNotificationViaWebSocket(userId, notification);
        }
      }
    } catch (error) {
      console.error(`Error sending pending notifications to user ${userId}:`, error);
    }
  }

  // Mark notification as read
  private async markNotificationAsRead(userId: number, notificationId: number) {
    try {
      await db
        .update(notifications)
        .set({ 
          isRead: true, 
          updatedAt: new Date() 
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Take action on notification
  private async takeNotificationAction(userId: number, notificationId: number, action: string) {
    try {
      await db
        .update(notifications)
        .set({ 
          actionTaken: action,
          actionTakenAt: new Date(),
          isRead: true,
          updatedAt: new Date() 
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));
    } catch (error) {
      console.error('Error taking notification action:', error);
    }
  }

  // Role-specific notification helpers
  async notifyRestaurantOrder(restaurantUserId: number, orderData: any) {
    return await this.sendNotification({
      userId: restaurantUserId,
      userRole: 'business',
      type: 'order_received',
      title: 'New Food Order!',
      message: `You have a new order for ${orderData.totalAmount}`,
      orderId: orderData.id,
      serviceType: 'food',
      priority: 'high',
      isActionRequired: true,
      customerInfo: orderData.customer,
      locationInfo: orderData.deliveryAddress,
      orderDetails: orderData
    });
  }

  async notifyGasVendorRequest(gasVendorUserId: number, requestData: any) {
    return await this.sendNotification({
      userId: gasVendorUserId,
      userRole: 'business',
      type: 'gas_request',
      title: 'Gas Cylinder Request!',
      message: `New gas cylinder delivery request from ${requestData.customerName}`,
      orderId: requestData.id,
      serviceType: 'gas',
      priority: 'high',
      isActionRequired: true,
      customerInfo: requestData.customer,
      locationInfo: requestData.deliveryAddress,
      orderDetails: requestData
    });
  }

  async notifyDriverBooking(driverId: number, bookingData: any) {
    return await this.sendNotification({
      userId: driverId,
      userRole: 'driver',
      type: 'ride_request',
      title: 'New Ride Request!',
      message: `Pickup from ${bookingData.pickupLocation} to ${bookingData.dropoffLocation}`,
      orderId: bookingData.id,
      serviceType: 'taxi',
      priority: 'urgent',
      isActionRequired: true,
      customerInfo: bookingData.customer,
      locationInfo: {
        pickup: bookingData.pickupLocation,
        dropoff: bookingData.dropoffLocation
      },
      orderDetails: bookingData
    });
  }

  async notifyCustomerStatusUpdate(customerId: number, orderData: any, status: string) {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed!',
      'preparing': 'Your order is being prepared',
      'ready': 'Your order is ready for pickup/delivery',
      'out_for_delivery': 'Your order is out for delivery',
      'delivered': 'Your order has been delivered!',
      'cancelled': 'Your order has been cancelled'
    };

    return await this.sendNotification({
      userId: customerId,
      userRole: 'customer',
      type: 'order_status_update',
      title: 'Order Status Update',
      message: statusMessages[status as keyof typeof statusMessages] || `Order status: ${status}`,
      orderId: orderData.id,
      serviceType: orderData.serviceType,
      priority: 'normal',
      orderDetails: orderData
    });
  }

  // Get active connection count for user
  getActiveConnections(userId: number): number {
    return this.connections.get(userId)?.length || 0;
  }

  // Get total active connections
  getTotalActiveConnections(): number {
    let total = 0;
    for (const connections of Array.from(this.connections.values())) {
      total += connections.length;
    }
    return total;
  }

  // Cleanup service
  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    // Close all connections
    for (const connections of Array.from(this.connections.values())) {
      connections.forEach((connection: WebSocketConnection) => {
        try {
          connection.ws.close();
        } catch (error) {
          console.error('Error closing WebSocket connection:', error);
        }
      });
    }
    
    this.connections.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;