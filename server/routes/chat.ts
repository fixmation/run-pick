import { Router } from "express";
import { chatService } from "../services/chatService";
import { insertChatRoomSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get chat rooms for a user
router.get("/rooms", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const rooms = await chatService.getUserChatRooms(user.id);
    res.json(rooms);
  } catch (error) {
    console.error("Error getting chat rooms:", error);
    res.status(500).json({ error: "Failed to get chat rooms" });
  }
});

// Get chat room for a specific order
router.get("/room/:orderId/:serviceType", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const orderId = parseInt(req.params.orderId);
    const serviceType = req.params.serviceType;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const room = await chatService.getChatRoomForOrder(orderId, serviceType);
    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    // Verify user has access to this chat room
    if (room.customerId !== user.id && room.driverId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error getting chat room:", error);
    res.status(500).json({ error: "Failed to get chat room" });
  }
});

// Create a new chat room
router.post("/rooms", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = insertChatRoomSchema.parse(req.body);
    
    // Verify user is either customer or driver in this room
    if (validatedData.customerId !== user.id && validatedData.driverId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const room = await chatService.createChatRoom(validatedData);
    if (!room) {
      return res.status(500).json({ error: "Failed to create chat room" });
    }

    res.status(201).json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error creating chat room:", error);
    res.status(500).json({ error: "Failed to create chat room" });
  }
});

// Get messages for a chat room
router.get("/rooms/:chatRoomId/messages", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const chatRoomId = parseInt(req.params.chatRoomId);
    const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(chatRoomId)) {
      return res.status(400).json({ error: "Invalid chat room ID" });
    }

    // Verify user has access to this chat room
    const room = await chatService.getChatRoom(chatRoomId);
    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    if (room.customerId !== user.id && room.driverId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await chatService.getChatMessages(chatRoomId, limit);
    res.json(messages);
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ error: "Failed to get chat messages" });
  }
});

// Send a message
router.post("/rooms/:chatRoomId/messages", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const chatRoomId = parseInt(req.params.chatRoomId);
    if (isNaN(chatRoomId)) {
      return res.status(400).json({ error: "Invalid chat room ID" });
    }

    // Verify user has access to this chat room
    const room = await chatService.getChatRoom(chatRoomId);
    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    if (room.customerId !== user.id && room.driverId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Determine receiver
    const receiverId = room.customerId === user.id ? room.driverId : room.customerId;

    const messageData = {
      chatRoomId,
      senderId: user.id,
      receiverId,
      messageText: req.body.messageText,
      messageType: req.body.messageType || 'text',
      metadata: req.body.metadata
    };

    const validatedData = insertChatMessageSchema.parse(messageData);
    const message = await chatService.sendMessage(validatedData);
    
    if (!message) {
      return res.status(500).json({ error: "Failed to send message" });
    }

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages as read
router.patch("/rooms/:chatRoomId/read", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const chatRoomId = parseInt(req.params.chatRoomId);
    if (isNaN(chatRoomId)) {
      return res.status(400).json({ error: "Invalid chat room ID" });
    }

    // Verify user has access to this chat room
    const room = await chatService.getChatRoom(chatRoomId);
    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    if (room.customerId !== user.id && room.driverId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await chatService.markMessagesAsRead(user.id, chatRoomId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Close chat room
router.patch("/rooms/:chatRoomId/close", async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const chatRoomId = parseInt(req.params.chatRoomId);
    if (isNaN(chatRoomId)) {
      return res.status(400).json({ error: "Invalid chat room ID" });
    }

    // Verify user has access to this chat room
    const room = await chatService.getChatRoom(chatRoomId);
    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    if (room.customerId !== user.id && room.driverId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await chatService.closeChatRoom(chatRoomId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error closing chat room:", error);
    res.status(500).json({ error: "Failed to close chat room" });
  }
});

export default router;