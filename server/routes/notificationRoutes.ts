import { Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  notifications, 
  messageLogs, 
  users,
  insertNotificationSchema, 
  insertMessageLogSchema,
  type Notification,
  type MessageLog
} from "../../shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { isAuthenticated, loadUser } from "../middleware/auth";

const router = Router();

// Get all notifications for the authenticated user
router.get("/", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    const offset = (page - 1) * limit;

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    if (unreadOnly) {
      query = db
        .select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const userNotifications = await query;

    // Get unread count
    const unreadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    res.json({
      success: true,
      notifications: userNotifications,
      pagination: {
        page,
        limit,
        total: unreadCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.patch("/:id/read", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const notificationId = parseInt(req.params.id);

    const updated = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, notification: updated[0] });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, error: "Failed to update notification" });
  }
});

// Mark all notifications as read for user
router.patch("/read-all", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const updated = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .returning();

    res.json({ success: true, updated: updated.length });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, error: "Failed to update notifications" });
  }
});

// Take action on notification (accept/reject/complete)
router.patch("/:id/action", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const notificationId = parseInt(req.params.id);
    const { action } = req.body;

    if (!["accepted", "rejected", "completed", "cancelled"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const updated = await db
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
      ))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, notification: updated[0] });
  } catch (error) {
    console.error("Error taking action on notification:", error);
    res.status(500).json({ success: false, error: "Failed to update notification" });
  }
});

// Send notification (for internal use)
const sendNotificationSchema = z.object({
  userId: z.number(),
  userRole: z.enum(["customer", "driver", "vendor", "business", "admin"]),
  type: z.enum([
    "order_received", "order_status_update", "ride_request", "delivery_request", 
    "gas_request", "payment_received", "rating_received", "system_announcement",
    "commission_reminder", "account_update", "promotion", "verification_status"
  ]),
  title: z.string().min(1),
  message: z.string().min(1),
  orderId: z.number().optional(),
  serviceType: z.enum(["taxi", "food", "parcel", "gas"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  isActionRequired: z.boolean().default(false),
  expiresAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  relatedUserId: z.number().optional()
});

router.post("/send", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const validation = sendNotificationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid notification data",
        details: validation.error.errors 
      });
    }

    const data = validation.data;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;

    // Insert notification
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        userRole: data.userRole,
        type: data.type,
        title: data.title,
        message: data.message,
        orderId: data.orderId,
        serviceType: data.serviceType,
        priority: data.priority,
        isActionRequired: data.isActionRequired,
        expiresAt,
        sentVia: ["in_app"],
        metadata: data.metadata,
        relatedUserId: data.relatedUserId
      })
      .returning();

    // Create message log entry
    await db
      .insert(messageLogs)
      .values({
        userId: data.userId,
        userRole: data.userRole,
        recipientId: data.userId,
        recipientRole: data.userRole,
        messageType: "notification",
        serviceType: data.serviceType,
        orderId: data.orderId,
        title: data.title,
        content: data.message,
        priority: data.priority,
        deliveryMethods: ["in_app"],
        deliveryStatus: "sent",
        metadata: data.metadata,
        responseRequired: data.isActionRequired,
        expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days default
      });

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, error: "Failed to send notification" });
  }
});

// Get message logs for authenticated user
router.get("/logs", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const messageType = req.query.messageType as string;
    const serviceType = req.query.serviceType as string;
    const offset = (page - 1) * limit;

    let whereConditions = eq(messageLogs.userId, userId);

    if (messageType) {
      whereConditions = and(whereConditions, eq(messageLogs.messageType, messageType))!;
    }

    if (serviceType) {
      whereConditions = and(whereConditions, eq(messageLogs.serviceType as any, serviceType))!;
    }

    const logs = await db
      .select()
      .from(messageLogs)
      .where(whereConditions)
      .orderBy(desc(messageLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messageLogs)
      .where(whereConditions);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error("Error fetching message logs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch message logs" });
  }
});

// Delete expired message logs (admin endpoint)
router.delete("/logs/cleanup", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    const deleted = await db
      .delete(messageLogs)
      .where(lte(messageLogs.createdAt, cutoffDate))
      .returning({ id: messageLogs.id });

    res.json({ success: true, deletedCount: deleted.length });
  } catch (error) {
    console.error("Error cleaning up message logs:", error);
    res.status(500).json({ success: false, error: "Failed to cleanup message logs" });
  }
});

// Get notification statistics
router.get("/stats", isAuthenticated, loadUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        unread: sql<number>`count(*) filter (where is_read = false)`,
        actionRequired: sql<number>`count(*) filter (where is_action_required = true and action_taken is null)`
      })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

export default router;