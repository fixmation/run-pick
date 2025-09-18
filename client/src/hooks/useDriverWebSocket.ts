import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { OrderNotification } from '@/components/driver/DriverNotificationPopup';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseDriverWebSocketReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastNotification: OrderNotification | null;
  sendMessage: (message: any) => void;
  acceptOrder: (notificationId: number, orderId: number, serviceType: string) => void;
  rejectOrder: (notificationId: number, orderId: number, serviceType: string) => void;
  updateLocation: (latitude: number, longitude: number) => void;
  updateStatus: (status: string) => void;
}

export const useDriverWebSocket = (): UseDriverWebSocketReturn => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastNotification, setLastNotification] = useState<OrderNotification | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0); // State to manage reconnect attempts

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || user.role !== 'driver') {
      setConnectionStatus('disconnected');
      return;
    }

    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      return; // Already connecting or connected
    }

    setConnectionStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/drivers?driverId=${user.id}`;

      console.log('🔌 Connecting to WebSocket:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0); // Reset attempts on successful connection

        // Start heartbeat
        startHeartbeat();

        // Send initial status
        sendMessage({
          type: 'status_change',
          status: 'online'
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        stopHeartbeat();

        // Attempt to reconnect unless it was a deliberate close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.current.onerror = (error) => {
        console.error('🔌 WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [isAuthenticated, user, reconnectAttempts]); // Added reconnectAttempts to dependency array

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (ws.current) {
      ws.current.close(1000, 'Deliberate disconnect');
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const nextAttempt = reconnectAttempts + 1;
    setReconnectAttempts(nextAttempt);
    const delay = reconnectDelay * Math.pow(2, nextAttempt - 1); // Exponential backoff

    console.log(`🔌 Scheduling reconnect attempt ${nextAttempt} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectAttempts]); // Added reconnectAttempts

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        sendMessage({
          type: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }, [sendMessage]); // Added sendMessage

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 WebSocket message received:', message.type, message);

    switch (message.type) {
      case 'new_order_request':
        // Show notification popup with ringtone
        const notification: OrderNotification = {
          notificationId: message.notificationId,
          orderId: message.orderId,
          serviceType: message.serviceType,
          title: message.title,
          message: message.message,
          distance: message.distance,
          estimatedFare: message.estimatedFare,
          estimatedDuration: message.estimatedDuration,
          expiresAt: message.expiresAt,
          metadata: message.metadata || {},
          sound: message.sound,
          priority: message.priority || 'normal',
          timestamp: message.timestamp || Date.now(),
        };
        setLastNotification(notification);
        break;

      case 'order_cancelled':
        // Clear notification if it matches
        setLastNotification(prev =>
          prev && prev.orderId === message.orderId ? null : prev
        );
        break;

      case 'heartbeat_ack':
        // Heartbeat acknowledged
        break;

      case 'status_update':
        console.log('Status update:', message);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, message not sent:', message);
    return false;
  }, []);

  const acceptOrder = useCallback((notificationId: number, orderId: number, serviceType: string) => {
    console.log(`✅ Accepting order ${orderId}`);
    sendMessage({
      type: 'accept_order',
      notificationId,
      orderId,
      serviceType,
      timestamp: Date.now()
    });

    // Clear the notification immediately
    setLastNotification(null);
  }, [sendMessage]);

  const rejectOrder = useCallback((notificationId: number, orderId: number, serviceType: string) => {
    console.log(`❌ Rejecting order ${orderId}`);
    sendMessage({
      type: 'reject_order',
      notificationId,
      orderId,
      serviceType,
      timestamp: Date.now()
    });

    // Clear the notification immediately
    setLastNotification(null);
  }, [sendMessage]);

  const updateLocation = useCallback((latitude: number, longitude: number) => {
    sendMessage({
      type: 'update_location',
      latitude,
      longitude,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  const updateStatus = useCallback((status: string) => {
    sendMessage({
      type: 'status_change',
      status,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  // Connect when component mounts and user is authenticated driver
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'driver') {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user && user.role === 'driver') {
        if (!isConnected && connectionStatus !== 'connecting') {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user, isConnected, connectionStatus, connect]);

  // Auto-update location if geolocation is available
  useEffect(() => {
    if (!isConnected) return;

    let locationWatchId: number | null = null;

    if ('geolocation' in navigator) {
      locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000, // 30 seconds
          timeout: 10000 // 10 seconds
        }
      );
    }

    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [isConnected, updateLocation]);

  return {
    isConnected,
    connectionStatus,
    lastNotification,
    sendMessage,
    acceptOrder,
    rejectOrder,
    updateLocation,
    updateStatus
  };
};