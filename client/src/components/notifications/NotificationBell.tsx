import { useState, useEffect } from "react";
import { Bell, BellRing, X, Car, UtensilsCrossed, Package, CheckCircle, AlertCircle, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  isActionRequired: boolean;
  actionTaken?: string;
  createdAt: string;
  serviceType?: string;
  orderId?: number;
  metadata?: any;
}

interface NotificationStats {
  total: number;
  unread: number;
  actionRequired: number;
}

interface NotificationBellProps {
  userId?: number;
  userRole?: string;
  onSignInRequested?: () => void;
}

export default function NotificationBell({ userId, userRole, onSignInRequested }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const queryClient = useQueryClient();
  const isAuthenticated = !!userId;

  // Fetch notification statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/notifications/stats', userId],
    enabled: !!userId,
  });

  // Fetch notifications when panel opens
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['/api/notifications', userId],
    enabled: !!userId && isOpen,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => 
      apiRequest('/api/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
    },
  });

  // Take action on notification mutation
  const takeActionMutation = useMutation({
    mutationFn: async ({ notificationId, action }: { notificationId: number; action: string }) => 
      apiRequest(`/api/notifications/${notificationId}/action`, { method: 'PATCH', data: { action } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
    },
  });

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userId || !userRole) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}&userRole=${userRole}`;
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('🔔 Notification WebSocket connected');
          setWsConnected(true);
          
          // Start ping interval
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification') {
              // New notification received
              queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
              if (isOpen) {
                queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
              }
              
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification(data.data.title, {
                  body: data.data.message,
                  icon: '/favicon.ico',
                  tag: `notification-${data.data.id}`,
                });
              }
            } else if (data.type === 'pong') {
              // Handle pong response
              console.log('🔔 Received pong from notification server');
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log('🔔 Notification WebSocket disconnected:', event.code, event.reason);
          setWsConnected(false);
          clearInterval(pingInterval);
          
          // Attempt to reconnect after 3 seconds unless closed normally
          if (event.code !== 1000) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error('🔔 Notification WebSocket error:', error);
          setWsConnected(false);
        };

      } catch (error) {
        console.error('Error creating notification WebSocket:', error);
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
      if (ws) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, [userId, userRole, queryClient, isOpen]);

  // Request notification permissions
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const notifications = (notificationsData as any)?.notifications || [];
  const unreadCount = (stats as any)?.stats?.unread || 0;
  const hasActionRequired = ((stats as any)?.stats?.actionRequired || 0) > 0;

  // Show bell for all users - no early return

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleAction = (notificationId: number, action: string) => {
    takeActionMutation.mutate({ notificationId, action });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride_request':
      case 'delivery_request':
        return '🚗';
      case 'order_received':
        return '🛍️';
      case 'gas_request':
        return '🔥';
      case 'food':
        return '🍕';
      case 'parcel':
        return '📦';
      case 'payment_received':
        return '💰';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="notification-bell"
      >
        {hasActionRequired ? (
          <BellRing className="h-5 w-5 text-orange-600 animate-pulse" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600"
            data-testid="unread-count"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {!wsConnected && userId && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-gray-400 rounded-full" 
               title="Disconnected" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {wsConnected && isAuthenticated && (
                    <div className="h-2 w-2 bg-green-500 rounded-full" title="Connected" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs"
                      data-testid="mark-all-read"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {!isAuthenticated ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">Sign in for Notifications</p>
                    <p className="text-sm mb-4">Get real-time updates on your orders and rides</p>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={onSignInRequested}
                      data-testid="signin-prompt-button"
                    >
                      Sign In
                    </Button>
                  </div>
                ) : isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">We'll notify you when something happens</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm line-clamp-1">{notification.title}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <div className={`h-2 w-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                            
                            {notification.isActionRequired && !notification.actionTaken && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(notification.id, 'accepted');
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                  data-testid={`accept-${notification.id}`}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(notification.id, 'rejected');
                                  }}
                                  className="text-xs px-3 py-1"
                                  data-testid={`reject-${notification.id}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            
                            {notification.actionTaken && (
                              <div className="mt-2">
                                <Badge 
                                  variant={notification.actionTaken === 'accepted' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {notification.actionTaken === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}