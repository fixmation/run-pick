import { db } from '../db';
import { messageLogs, notifications } from '../../shared/schema';
import { lt } from 'drizzle-orm';

class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start the cleanup service
  start() {
    if (this.isRunning) {
      console.log('🧹 Cleanup service already running');
      return;
    }

    this.isRunning = true;
    console.log('🧹 Starting cleanup service...');

    // Run cleanup immediately
    this.runCleanup();

    // Schedule cleanup to run every 24 hours
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('🧹 Cleanup service started - will run every 24 hours');
  }

  // Stop the cleanup service
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('🧹 Cleanup service stopped');
  }

  // Run the cleanup process
  private async runCleanup() {
    console.log('🧹 Starting cleanup process...');
    
    try {
      // Clean up message logs older than 90 days
      await this.cleanupMessageLogs();
      
      // Clean up old read notifications (older than 30 days)
      await this.cleanupOldNotifications();
      
      console.log('🧹 Cleanup process completed successfully');
    } catch (error) {
      console.error('🧹 Error during cleanup process:', error);
    }
  }

  // Clean up message logs older than 90 days
  private async cleanupMessageLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

      const deletedLogs = await db
        .delete(messageLogs)
        .where(lt(messageLogs.expiresAt, cutoffDate))
        .returning({ id: messageLogs.id });

      console.log(`🧹 Cleaned up ${deletedLogs.length} expired message logs (older than 90 days)`);
      
      return deletedLogs.length;
    } catch (error) {
      console.error('🧹 Error cleaning up message logs:', error);
      return 0;
    }
  }

  // Clean up old read notifications (older than 30 days)
  private async cleanupOldNotifications() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

      const deletedNotifications = await db
        .delete(notifications)
        .where(lt(notifications.createdAt, cutoffDate))
        .returning({ id: notifications.id });

      console.log(`🧹 Cleaned up ${deletedNotifications.length} old notifications (older than 30 days)`);
      
      return deletedNotifications.length;
    } catch (error) {
      console.error('🧹 Error cleaning up old notifications:', error);
      return 0;
    }
  }

  // Manual cleanup (for admin endpoints)
  async runManualCleanup() {
    console.log('🧹 Running manual cleanup...');
    
    const messageLogsDeleted = await this.cleanupMessageLogs();
    const notificationsDeleted = await this.cleanupOldNotifications();
    
    return {
      messageLogsDeleted,
      notificationsDeleted,
      timestamp: new Date().toISOString()
    };
  }

  // Get cleanup statistics
  async getCleanupStats() {
    try {
      // Count message logs by age
      const messageLogStats = await db.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE expires_at < NOW() - INTERVAL '90 days') as expired,
          COUNT(*) FILTER (WHERE expires_at < NOW() - INTERVAL '30 days') as old
        FROM message_logs
      `);

      // Count notifications by age
      const notificationStats = await db.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days') as old,
          COUNT(*) FILTER (WHERE is_read = false) as unread
        FROM notifications
      `);

      return {
        messageLogs: messageLogStats[0],
        notifications: notificationStats[0],
        isRunning: this.isRunning
      };
    } catch (error) {
      console.error('🧹 Error getting cleanup stats:', error);
      return {
        messageLogs: { total: 0, expired: 0, old: 0 },
        notifications: { total: 0, old: 0, unread: 0 },
        isRunning: this.isRunning
      };
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
export default cleanupService;