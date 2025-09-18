import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface UseChatConnectionProps {
  chatRoomId: number;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (userId: number, isTyping: boolean) => void;
  onMessagesRead?: (userId: number, chatRoomId: number) => void;
  onChatHistory?: (messages: ChatMessage[]) => void;
  onError?: (error: string) => void;
}

interface SendMessageData {
  chatRoomId: number;
  receiverId: number;
  messageText: string;
  messageType?: string;
  metadata?: any;
}

export function useChatConnection({
  chatRoomId,
  onMessage,
  onTyping,
  onMessagesRead,
  onChatHistory,
  onError
}: UseChatConnectionProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setError(null);
      
      // Get session cookie for authentication
      const sessionCookie = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('connect.sid='));

      if (!sessionCookie) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat?userId=${user.id}&userRole=${user.role}&chatRoomId=${chatRoomId}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('💬 Chat WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Send ping to maintain connection
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'pong':
              // Connection keep-alive response
              break;
              
            case 'new_message':
              onMessage?.(data.message);
              break;
              
            case 'typing_status':
              onTyping?.(data.userId, data.isTyping);
              break;
              
            case 'messages_read':
              onMessagesRead?.(data.userId, data.chatRoomId);
              break;
              
            case 'chat_history':
              onChatHistory?.(data.messages);
              break;
              
            case 'chat_closed':
              setError('Chat session has ended');
              break;
              
            case 'error':
              setError(data.message || 'Chat error occurred');
              onError?.(data.message || 'Chat error occurred');
              break;
              
            default:
              console.warn('Unknown chat message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('💬 Chat WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          console.log(`💬 Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setError('Connection lost. Please refresh the page.');
        }
      };

      ws.onerror = (error) => {
        console.error('💬 Chat WebSocket error:', error);
        setError('Connection error occurred');
      };

    } catch (error) {
      console.error('Error creating chat WebSocket connection:', error);
      setError('Failed to connect to chat');
    }
  }, [user, chatRoomId, reconnectAttempts, onMessage, onTyping, onMessagesRead, onChatHistory, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setReconnectAttempts(0);
  }, []);

  const sendMessage = useCallback(async (messageData: SendMessageData | any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('Chat not connected');
    }

    try {
      // If it's a direct WebSocket message (like typing indicators)
      if (messageData.type) {
        wsRef.current.send(JSON.stringify(messageData));
        return;
      }

      // Otherwise, send via API and WebSocket will broadcast it
      const response = await fetch(`/api/chat/rooms/${chatRoomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [chatRoomId]);

  const markAsRead = useCallback(async () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read',
          chatRoomId
        }));
      }

      // Also mark via API
      await fetch(`/api/chat/rooms/${chatRoomId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatRoomId]);

  // Connect when hook is used
  useEffect(() => {
    if (user && chatRoomId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, chatRoomId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    error,
    sendMessage,
    markAsRead,
    reconnect: connect,
    disconnect
  };
}