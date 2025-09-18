import { WebSocketServer, WebSocket } from 'ws';
import { db } from '../db';
import { chatRooms, chatMessages, users } from '@shared/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import type { ChatRoom, ChatMessage, InsertChatRoom, InsertChatMessage } from '@shared/schema';

interface ChatConnection {
  userId: number;
  userRole: 'customer' | 'driver';
  ws: WebSocket;
  chatRoomId?: number;
  lastActivity: Date;
}

interface ChatMessageData {
  chatRoomId: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  messageType?: string;
  metadata?: any;
}

class ChatService {
  private wss: WebSocketServer | null = null;
  private connections = new Map<number, ChatConnection[]>();
  private chatRooms = new Map<number, Set<number>>(); // chatRoomId -> Set of userIds
  private pingInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server for chat
   */
  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
    
    wss.on('connection', async (ws, req) => {
      try {
        // SECURITY: Parse and validate session server-side - NEVER trust client-provided userId
        let sessionUser = null;
        
        try {
          // Use express-session parser to extract user from server-side session
          // Note: In production, implement proper session parsing with connect-pg-simple
          const cookieHeader = req.headers.cookie;
          if (!cookieHeader) {
            throw new Error('No session cookie');
          }

          // For now, we'll need to implement proper session parsing
          // This is a placeholder - in production use express-session middleware
          console.warn('🚨 SECURITY: Temporary session parsing - implement proper session validation');
          
          // Extract chatRoomId from query (only non-sensitive param we accept from client)
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const chatRoomId = parseInt(url.searchParams.get('chatRoomId') || '0');
          
          // TODO: Implement proper session parsing to get user from server-side session
          // For now, reject connection until proper auth is implemented
          throw new Error('Session validation not implemented - security requirement');
          
        } catch (authError) {
          console.error('🚨 Chat WebSocket authentication failed:', authError);
          ws.close(1008, 'Authentication failed');
          return;
        }

        const userId = sessionUser.id;
        const userRole = sessionUser.role;

        // Verify user has access to this chat room
        if (chatRoomId) {
          const hasAccess = await this.verifyUserAccess(userId, chatRoomId);
          if (!hasAccess) {
            ws.close(1008, 'Access denied to chat room');
            return;
          }
        }

        // Add connection
        if (!this.connections.has(userId)) {
          this.connections.set(userId, []);
        }
        
        const connection: ChatConnection = {
          userId,
          userRole,
          ws,
          chatRoomId: chatRoomId || undefined,
          lastActivity: new Date()
        };
        
        this.connections.get(userId)!.push(connection);
        
        // Add user to chat room
        if (chatRoomId) {
          if (!this.chatRooms.has(chatRoomId)) {
            this.chatRooms.set(chatRoomId, new Set());
          }
          this.chatRooms.get(chatRoomId)!.add(userId);
        }
        
        console.log(`💬 User ${userId} (${userRole}) connected to chat${chatRoomId ? ` room ${chatRoomId}` : ''}`);

        // Send initial data
        if (chatRoomId) {
          await this.sendChatHistory(userId, chatRoomId);
          await this.markMessagesAsRead(userId, chatRoomId);
        }

        // Handle messages from client
        ws.on('message', async (message: string) => {
          try {
            const data = JSON.parse(message);
            connection.lastActivity = new Date();
            
            switch (data.type) {
              case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                break;
                
              case 'send_message':
                await this.handleSendMessage(userId, data);
                break;
                
              case 'mark_read':
                await this.handleMarkRead(userId, data.chatRoomId);
                break;
                
              case 'typing_start':
                await this.handleTyping(userId, data.chatRoomId, true);
                break;
                
              case 'typing_stop':
                await this.handleTyping(userId, data.chatRoomId, false);
                break;
                
              default:
                console.warn('Unknown chat message type:', data.type);
            }
          } catch (error) {
            console.error('Error handling chat message:', error);
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Failed to process message' 
            }));
          }
        });

        ws.on('close', () => {
          console.log(`💬 User ${userId} disconnected from chat`);
          this.removeConnection(userId, ws);
          if (chatRoomId) {
            this.chatRooms.get(chatRoomId)?.delete(userId);
          }
        });

        ws.on('error', (error) => {
          console.error(`Chat WebSocket error for user ${userId}:`, error);
        });

      } catch (error) {
        console.error('Error setting up chat WebSocket connection:', error);
        ws.close(1011, 'Setup error');
      }
    });

    // Start ping interval
    this.startPingInterval();
    console.log('💬 Chat WebSocket server initialized');
  }

  /**
   * Create a new chat room for an order
   */
  async createChatRoom(orderData: InsertChatRoom): Promise<ChatRoom | null> {
    try {
      // Check if chat room already exists for this order
      const existingRoom = await db
        .select()
        .from(chatRooms)
        .where(and(
          eq(chatRooms.orderId, orderData.orderId),
          eq(chatRooms.serviceType, orderData.serviceType)
        ))
        .limit(1);

      if (existingRoom.length > 0) {
        console.log(`💬 Chat room already exists for order ${orderData.orderId}`);
        return existingRoom[0];
      }

      // Create new chat room
      const [newRoom] = await db
        .insert(chatRooms)
        .values(orderData)
        .returning();

      console.log(`💬 Created chat room ${newRoom.id} for order ${orderData.orderId}`);
      return newRoom;
    } catch (error) {
      console.error('Error creating chat room:', error);
      return null;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: ChatMessageData): Promise<ChatMessage | null> {
    try {
      // Verify chat room exists and users have access
      const room = await this.getChatRoom(messageData.chatRoomId);
      if (!room) {
        console.error('Chat room not found:', messageData.chatRoomId);
        return null;
      }

      // Verify sender has access
      const hasAccess = await this.verifyUserAccess(messageData.senderId, messageData.chatRoomId);
      if (!hasAccess) {
        console.error('User does not have access to chat room');
        return null;
      }

      // Insert message
      const [newMessage] = await db
        .insert(chatMessages)
        .values({
          ...messageData,
          createdAt: new Date()
        })
        .returning();

      // Send message to all connected users in the chat room
      await this.broadcastMessage(messageData.chatRoomId, {
        type: 'new_message',
        message: newMessage
      });

      console.log(`💬 Message sent in room ${messageData.chatRoomId}: ${messageData.messageText.substring(0, 50)}...`);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Get chat room by ID
   */
  async getChatRoom(chatRoomId: number): Promise<ChatRoom | null> {
    try {
      const [room] = await db
        .select()
        .from(chatRooms)
        .where(eq(chatRooms.id, chatRoomId))
        .limit(1);

      return room || null;
    } catch (error) {
      console.error('Error getting chat room:', error);
      return null;
    }
  }

  /**
   * Get chat room for an order
   */
  async getChatRoomForOrder(orderId: number, serviceType: string): Promise<ChatRoom | null> {
    try {
      const [room] = await db
        .select()
        .from(chatRooms)
        .where(and(
          eq(chatRooms.orderId, orderId),
          eq(chatRooms.serviceType, serviceType as any)
        ))
        .limit(1);

      return room || null;
    } catch (error) {
      console.error('Error getting chat room for order:', error);
      return null;
    }
  }

  /**
   * Get chat messages for a room
   */
  async getChatMessages(chatRoomId: number, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.chatRoomId, chatRoomId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit);

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(userId: number, chatRoomId: number): Promise<void> {
    try {
      await db
        .update(chatMessages)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(chatMessages.chatRoomId, chatRoomId),
          eq(chatMessages.receiverId, userId),
          eq(chatMessages.isRead, false)
        ));

      // Notify other participants about read status
      await this.broadcastMessage(chatRoomId, {
        type: 'messages_read',
        userId,
        chatRoomId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Handle send message request
   */
  private async handleSendMessage(senderId: number, data: any): Promise<void> {
    if (!data.chatRoomId || !data.receiverId || !data.messageText) {
      console.error('Invalid message data');
      return;
    }

    await this.sendMessage({
      chatRoomId: data.chatRoomId,
      senderId,
      receiverId: data.receiverId,
      messageText: data.messageText,
      messageType: data.messageType || 'text',
      metadata: data.metadata
    });
  }

  /**
   * Handle mark read request
   */
  private async handleMarkRead(userId: number, chatRoomId: number): Promise<void> {
    await this.markMessagesAsRead(userId, chatRoomId);
  }

  /**
   * Handle typing indicators
   */
  private async handleTyping(userId: number, chatRoomId: number, isTyping: boolean): Promise<void> {
    await this.broadcastMessage(chatRoomId, {
      type: 'typing_status',
      userId,
      isTyping
    }, userId); // Exclude sender
  }

  /**
   * Send chat history to a user
   */
  private async sendChatHistory(userId: number, chatRoomId: number): Promise<void> {
    const messages = await this.getChatMessages(chatRoomId);
    const userConnections = this.connections.get(userId) || [];
    
    for (const connection of userConnections) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify({
          type: 'chat_history',
          messages
        }));
      }
    }
  }

  /**
   * Broadcast message to all users in a chat room
   */
  private async broadcastMessage(chatRoomId: number, message: any, excludeUserId?: number): Promise<void> {
    const roomUsers = this.chatRooms.get(chatRoomId);
    if (!roomUsers) return;

    Array.from(roomUsers).forEach(userId => {
      if (excludeUserId && userId === excludeUserId) return;
      
      const userConnections = this.connections.get(userId) || [];
      for (const connection of userConnections) {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify(message));
        }
      }
    });
  }

  /**
   * Verify user has access to a chat room
   */
  private async verifyUserAccess(userId: number, chatRoomId: number): Promise<boolean> {
    try {
      const [room] = await db
        .select()
        .from(chatRooms)
        .where(and(
          eq(chatRooms.id, chatRoomId),
          or(
            eq(chatRooms.customerId, userId),
            eq(chatRooms.driverId, userId)
          )
        ))
        .limit(1);

      return !!room;
    } catch (error) {
      console.error('Error verifying user access:', error);
      return false;
    }
  }

  /**
   * Remove a connection
   */
  private removeConnection(userId: number, ws: WebSocket): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const index = userConnections.findIndex(conn => conn.ws === ws);
      if (index !== -1) {
        userConnections.splice(index, 1);
      }
      
      if (userConnections.length === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /**
   * Start ping interval to maintain connections
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      Array.from(this.connections.entries()).forEach(([userId, connections]) => {
        for (const connection of connections) {
          if (connection.ws.readyState === WebSocket.OPEN) {
            // Check for stale connections (no activity for 5 minutes)
            if (Date.now() - connection.lastActivity.getTime() > 5 * 60 * 1000) {
              console.log(`💬 Closing stale connection for user ${userId}`);
              connection.ws.close(1000, 'Stale connection');
            } else {
              connection.ws.ping();
            }
          }
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Get active chat rooms for a user
   */
  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    try {
      const rooms = await db
        .select()
        .from(chatRooms)
        .where(and(
          or(
            eq(chatRooms.customerId, userId),
            eq(chatRooms.driverId, userId)
          ),
          eq(chatRooms.isActive, true)
        ))
        .orderBy(desc(chatRooms.updatedAt));

      return rooms;
    } catch (error) {
      console.error('Error getting user chat rooms:', error);
      return [];
    }
  }

  /**
   * Close chat room
   */
  async closeChatRoom(chatRoomId: number): Promise<void> {
    try {
      await db
        .update(chatRooms)
        .set({ 
          isActive: false, 
          updatedAt: new Date() 
        })
        .where(eq(chatRooms.id, chatRoomId));

      // Notify all users in the room
      await this.broadcastMessage(chatRoomId, {
        type: 'chat_closed',
        chatRoomId
      });

      console.log(`💬 Chat room ${chatRoomId} closed`);
    } catch (error) {
      console.error('Error closing chat room:', error);
    }
  }
}

export const chatService = new ChatService();