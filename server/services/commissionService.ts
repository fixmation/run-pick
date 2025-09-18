import { db } from '../db';
import { 
  driverCommissions, 
  commissionTransactions, 
  driverNotifications,
  users,
  driverProfiles 
} from '@shared/schema';
import { eq, and, gte, lte, sum, desc, sql } from 'drizzle-orm';
import { sendEmail } from './emailService';
import { sendSMS } from './smsService';

const COMMISSION_RATE = 8; // 8% commission
const WEEKLY_REMINDER_LIMIT = 4; // 4 weeks before blocking
const COMMISSION_THRESHOLD = 1000; // LKR 1000

export class CommissionService {
  
  /**
   * Calculate and record commission for a completed order
   */
  async calculateCommission(driverId: number, orderId: number, orderAmount: number, serviceType: 'taxi' | 'food' | 'parcel') {
    const commissionAmount = (orderAmount * COMMISSION_RATE) / 100;
    
    // Record the commission transaction
    const [commissionTransaction] = await db.insert(commissionTransactions).values({
      driverId,
      orderId,
      serviceType,
      orderAmount: orderAmount.toString(),
      commissionAmount: commissionAmount.toString(),
      commissionRate: COMMISSION_RATE.toString(),
      isPaid: false,
    }).returning();

    // Update or create driver commission record
    await this.updateDriverCommission(driverId, orderAmount, commissionAmount);
    
    return commissionTransaction;
  }

  /**
   * Update driver's total earnings and commission owed
   */
  private async updateDriverCommission(driverId: number, orderAmount: number, commissionAmount: number) {
    const existingCommission = await db
      .select()
      .from(driverCommissions)
      .where(eq(driverCommissions.driverId, driverId))
      .limit(1);

    if (existingCommission.length === 0) {
      // Create new commission record
      await db.insert(driverCommissions).values({
        driverId,
        totalEarnings: orderAmount.toString(),
        commissionOwed: commissionAmount.toString(),
        commissionPaid: '0.00',
        weeklyStartDate: new Date(),
      });
    } else {
      // Update existing record
      const current = existingCommission[0];
      const newTotalEarnings = parseFloat(current.totalEarnings) + orderAmount;
      const newCommissionOwed = parseFloat(current.commissionOwed) + commissionAmount;
      
      await db
        .update(driverCommissions)
        .set({
          totalEarnings: newTotalEarnings.toString(),
          commissionOwed: newCommissionOwed.toString(),
          updatedAt: new Date(),
        })
        .where(eq(driverCommissions.driverId, driverId));
    }
  }

  /**
   * Get driver's commission status
   */
  async getDriverCommissionStatus(driverId: number) {
    const [commission] = await db
      .select()
      .from(driverCommissions)
      .where(eq(driverCommissions.driverId, driverId))
      .limit(1);

    if (!commission) {
      return {
        totalEarnings: 0,
        commissionOwed: 0,
        commissionPaid: 0,
        isBlocked: false,
        reminderCount: 0,
        shouldPayCommission: false
      };
    }

    const totalEarnings = parseFloat(commission.totalEarnings);
    const commissionOwed = parseFloat(commission.commissionOwed);
    const commissionPaid = parseFloat(commission.commissionPaid);
    
    return {
      totalEarnings,
      commissionOwed,
      commissionPaid,
      isBlocked: commission.isBlocked,
      reminderCount: commission.reminderCount,
      shouldPayCommission: commissionOwed >= COMMISSION_THRESHOLD,
      lastReminderSent: commission.lastReminderSent,
      weeklyStartDate: commission.weeklyStartDate
    };
  }

  /**
   * Send weekly reminders to drivers who owe commission
   */
  async sendWeeklyReminders() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get drivers who owe commission and haven't received reminder in the past week
    const driversToRemind = await db
      .select({
        driverId: driverCommissions.driverId,
        totalEarnings: driverCommissions.totalEarnings,
        commissionOwed: driverCommissions.commissionOwed,
        reminderCount: driverCommissions.reminderCount,
        lastReminderSent: driverCommissions.lastReminderSent,
        isBlocked: driverCommissions.isBlocked,
        email: users.email,
        phone: users.phone,
        name: users.name,
      })
      .from(driverCommissions)
      .innerJoin(users, eq(driverCommissions.driverId, users.id))
      .where(
        and(
          gte(driverCommissions.commissionOwed, COMMISSION_THRESHOLD.toString()),
          eq(driverCommissions.isBlocked, false),
          // Either never sent reminder or sent more than a week ago
          // or(
          //   isNull(driverCommissions.lastReminderSent),
          //   lte(driverCommissions.lastReminderSent, oneWeekAgo)
          // )
        )
      );

    const results = [];
    
    for (const driver of driversToRemind) {
      const commissionOwed = parseFloat(driver.commissionOwed);
      
      // Skip if already blocked or reminder sent recently or commission below threshold
      if (driver.isBlocked || (driver.lastReminderSent && driver.lastReminderSent > oneWeekAgo) || commissionOwed < COMMISSION_THRESHOLD) {
        continue;
      }

      const newReminderCount = driver.reminderCount + 1;
      const shouldBlock = newReminderCount >= WEEKLY_REMINDER_LIMIT && commissionOwed >= COMMISSION_THRESHOLD;

      try {
        // Send reminder via email and SMS
        await this.sendCommissionReminder(driver, newReminderCount);
        
        // Update reminder count and timestamp
        await db
          .update(driverCommissions)
          .set({
            reminderCount: newReminderCount,
            lastReminderSent: now,
            isBlocked: shouldBlock,
            blockedAt: shouldBlock ? now : null,
            updatedAt: now,
          })
          .where(eq(driverCommissions.driverId, driver.driverId));

        // Block driver account if reached limit
        if (shouldBlock) {
          await db
            .update(users)
            .set({ isActive: false })
            .where(eq(users.id, driver.driverId));

          // Send blocking notification
          await this.sendBlockingNotification(driver);
        }

        results.push({
          driverId: driver.driverId,
          name: driver.name,
          remindersSent: newReminderCount,
          blocked: shouldBlock,
          commissionOwed: driver.commissionOwed
        });

      } catch (error) {
        console.error(`Failed to send reminder to driver ${driver.driverId}:`, error);
        results.push({
          driverId: driver.driverId,
          name: driver.name,
          error: 'Failed to send reminder',
          blocked: false,
          commissionOwed: driver.commissionOwed
        });
      }
    }

    return results;
  }

  /**
   * Send commission reminder to driver
   */
  private async sendCommissionReminder(driver: any, reminderCount: number) {
    const commissionOwed = parseFloat(driver.commissionOwed);
    const title = `Commission Payment Reminder - Week ${reminderCount}`;
    const message = `Dear ${driver.name}, you have an outstanding commission of LKR ${commissionOwed.toFixed(2)} to pay. Please settle this amount to continue using our platform. ${reminderCount >= 3 ? 'Your account will be blocked if payment is not received within 1 week.' : ''}`;

    // Save notification to database
    await db.insert(driverNotifications).values({
      driverId: driver.driverId,
      type: 'commission_reminder',
      title,
      message,
      sentVia: 'email,sms,in_app',
      metadata: { reminderCount, commissionOwed: driver.commissionOwed }
    });

    // Send email
    if (driver.email) {
      await sendEmail(driver.email, title, message);
    }

    // Send SMS
    if (driver.phone) {
      await sendSMS(driver.phone, message);
    }
  }

  /**
   * Send blocking notification to driver
   */
  private async sendBlockingNotification(driver: any) {
    const title = 'Account Blocked - Commission Payment Required';
    const message = `Dear ${driver.name}, your account has been blocked due to unpaid commission of LKR ${parseFloat(driver.commissionOwed).toFixed(2)}. Please contact admin to settle payment and reactivate your account.`;

    await db.insert(driverNotifications).values({
      driverId: driver.driverId,
      type: 'account_blocked',
      title,
      message,
      sentVia: 'email,sms,in_app',
      metadata: { commissionOwed: driver.commissionOwed, blockedAt: new Date().toISOString() }
    });

    // Send email and SMS
    if (driver.email) {
      await sendEmail(driver.email, title, message);
    }
    if (driver.phone) {
      await sendSMS(driver.phone, message);
    }
  }

  /**
   * Process commission payment and unblock driver
   */
  async processCommissionPayment(driverId: number, paidAmount: number, adminId: number) {
    const [commission] = await db
      .select()
      .from(driverCommissions)
      .where(eq(driverCommissions.driverId, driverId))
      .limit(1);

    if (!commission) {
      throw new Error('Driver commission record not found');
    }

    const commissionOwed = parseFloat(commission.commissionOwed);
    const commissionPaid = parseFloat(commission.commissionPaid);
    
    if (paidAmount > commissionOwed) {
      throw new Error('Payment amount exceeds commission owed');
    }

    const newCommissionPaid = commissionPaid + paidAmount;
    const newCommissionOwed = commissionOwed - paidAmount;
    const isFullyPaid = newCommissionOwed <= 0;

    // Update commission record
    await db
      .update(driverCommissions)
      .set({
        commissionPaid: newCommissionPaid.toString(),
        commissionOwed: Math.max(0, newCommissionOwed).toString(),
        isBlocked: false,
        unblockedAt: isFullyPaid ? new Date() : null,
        reminderCount: isFullyPaid ? 0 : commission.reminderCount,
        updatedAt: new Date(),
      })
      .where(eq(driverCommissions.driverId, driverId));

    // Unblock driver account if fully paid
    if (isFullyPaid) {
      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.id, driverId));

      // Send unblocking notification
      const [driver] = await db
        .select({ name: users.name, email: users.email, phone: users.phone })
        .from(users)
        .where(eq(users.id, driverId));

      if (driver) {
        await this.sendUnblockingNotification(driverId, driver, paidAmount);
      }
    }

    // Mark commission transactions as paid
    await db
      .update(commissionTransactions)
      .set({ isPaid: true, paidAt: new Date() })
      .where(
        and(
          eq(commissionTransactions.driverId, driverId),
          eq(commissionTransactions.isPaid, false)
        )
      );

    return {
      driverId,
      paidAmount,
      newCommissionOwed: Math.max(0, newCommissionOwed),
      newCommissionPaid,
      isFullyPaid,
      unblockedAt: isFullyPaid ? new Date() : null
    };
  }

  /**
   * Send unblocking notification to driver
   */
  private async sendUnblockingNotification(driverId: number, driver: any, paidAmount: number) {
    const title = 'Account Reactivated - Commission Payment Received';
    const message = `Dear ${driver.name}, thank you for your commission payment of LKR ${paidAmount.toFixed(2)}. Your account has been reactivated and you can continue using our platform.`;

    await db.insert(driverNotifications).values({
      driverId,
      type: 'account_unblocked',
      title,
      message,
      sentVia: 'email,sms,in_app',
      metadata: { paidAmount: paidAmount.toString(), unblockedAt: new Date().toISOString() }
    });

    // Send email and SMS
    if (driver.email) {
      await sendEmail(driver.email, title, message);
    }
    if (driver.phone) {
      await sendSMS(driver.phone, message);
    }
  }

  /**
   * Get all drivers with commission details (for admin dashboard)
   */
  async getAllDriverCommissions() {
    return await db
      .select({
        driverId: driverCommissions.driverId,
        driverName: users.name,
        email: users.email,
        phone: users.phone,
        totalEarnings: driverCommissions.totalEarnings,
        commissionOwed: driverCommissions.commissionOwed,
        commissionPaid: driverCommissions.commissionPaid,
        reminderCount: driverCommissions.reminderCount,
        lastReminderSent: driverCommissions.lastReminderSent,
        isBlocked: driverCommissions.isBlocked,
        blockedAt: driverCommissions.blockedAt,
        unblockedAt: driverCommissions.unblockedAt,
        weeklyStartDate: driverCommissions.weeklyStartDate,
        isActive: users.isActive,
      })
      .from(driverCommissions)
      .innerJoin(users, eq(driverCommissions.driverId, users.id))
      .orderBy(desc(driverCommissions.commissionOwed));
  }

  /**
   * Get commission transaction history for a driver
   */
  async getDriverCommissionHistory(driverId: number) {
    return await db
      .select()
      .from(commissionTransactions)
      .where(eq(commissionTransactions.driverId, driverId))
      .orderBy(desc(commissionTransactions.createdAt));
  }

  /**
   * Get commission statistics for admin dashboard
   */
  async getCommissionStats() {
    try {
      // Get total number of drivers
      const totalDrivers = await db.select().from(driverProfiles);
      const activeDriversCount = totalDrivers.filter(d => !d.isBlocked).length;
      const blockedDriversCount = totalDrivers.filter(d => d.isBlocked).length;
      
      // Get commission totals
      const commissionSummary = await db
        .select({
          totalOwed: sum(driverCommissions.commissionOwed),
          totalPaid: sum(driverCommissions.commissionPaid)
        })
        .from(driverCommissions);
        
      return {
        totalDrivers: totalDrivers.length,
        activeDrivers: activeDriversCount,
        blockedDrivers: blockedDriversCount,
        totalCommissionOwed: `LKR ${commissionSummary[0]?.totalOwed || '0.00'}`,
        totalCommissionPaid: `LKR ${commissionSummary[0]?.totalPaid || '0.00'}`,
        pendingReminders: await this.getPendingRemindersCount(),
        lastProcessedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching commission stats:', error);
      throw error;
    }
  }

  /**
   * Get all drivers with commission data
   */
  async getAllDriversCommissions() {
    try {
      const driversWithCommissions = await db
        .select({
          driverId: driverCommissions.driverId,
          driverName: users.firstName,
          email: users.email,
          phone: driverProfiles.phoneNumber,
          totalEarnings: driverCommissions.totalEarnings,
          commissionOwed: driverCommissions.commissionOwed,
          commissionPaid: driverCommissions.commissionPaid,
          reminderCount: driverCommissions.reminderCount,
          lastReminderSent: driverCommissions.lastReminderSent,
          isBlocked: driverProfiles.isBlocked,
          weeklyStartDate: driverCommissions.weeklyStartDate,
          isActive: driverProfiles.isActive,
        })
        .from(driverCommissions)
        .leftJoin(driverProfiles, eq(driverCommissions.driverId, driverProfiles.driverId))
        .leftJoin(users, eq(driverProfiles.userId, users.id))
        .orderBy(desc(driverCommissions.commissionOwed));
        
      return driversWithCommissions;
    } catch (error) {
      console.error('Error fetching all drivers commissions:', error);
      throw error;
    }
  }

  /**
   * Get driver commission data
   */
  async getDriverCommission(driverId: number) {
    try {
      const [commission] = await db
        .select()
        .from(driverCommissions)
        .where(eq(driverCommissions.driverId, driverId))
        .limit(1);

      if (!commission) {
        return {
          driverId,
          totalEarnings: 0,
          commissionOwed: 0,
          commissionPaid: 0,
          reminderCount: 0,
          isBlocked: false,
          shouldPayCommission: false,
          weeklyStartDate: new Date().toISOString()
        };
      }

      const totalEarnings = parseFloat(commission.totalEarnings);
      const commissionOwed = parseFloat(commission.commissionOwed);
      const shouldPayCommission = totalEarnings > COMMISSION_THRESHOLD && commissionOwed > 0;

      return {
        driverId,
        totalEarnings,
        commissionOwed,
        commissionPaid: parseFloat(commission.commissionPaid),
        reminderCount: commission.reminderCount,
        isBlocked: commission.isBlocked,
        shouldPayCommission,
        lastReminderSent: commission.lastReminderSent?.toISOString(),
        weeklyStartDate: commission.weeklyStartDate.toISOString()
      };
    } catch (error) {
      console.error('Error fetching driver commission:', error);
      throw error;
    }
  }

  /**
   * Send reminder to specific driver
   */
  async sendReminderToDriver(driverId: number) {
    try {
      // Get driver info
      const [driverInfo] = await db
        .select({
          name: users.firstName,
          email: users.email,
          phone: driverProfiles.phoneNumber,
        })
        .from(driverProfiles)
        .leftJoin(users, eq(driverProfiles.userId, users.id))
        .where(eq(driverProfiles.driverId, driverId))
        .limit(1);

      if (!driverInfo) {
        throw new Error(`Driver ${driverId} not found`);
      }

      // Send SMS and email reminder
      const smsResult = await sendSMS(driverInfo.phone, 'Commission payment reminder: Please pay your outstanding commission to avoid account suspension.');
      const emailResult = await sendEmail(driverInfo.email, 'Commission Payment Reminder', 'Please pay your outstanding commission amount.');

      // Update reminder count
      await db
        .update(driverCommissions)
        .set({
          reminderCount: sql`${driverCommissions.reminderCount} + 1`,
          lastReminderSent: new Date(),
          updatedAt: new Date()
        })
        .where(eq(driverCommissions.driverId, driverId));

      return {
        success: true,
        driverId,
        name: driverInfo.name,
        smsResult,
        emailResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  /**
   * Unlock blocked driver
   */
  async unlockDriver(driverId: number) {
    try {
      // Update driver profile to unblock
      await db
        .update(driverProfiles)
        .set({
          isBlocked: false,
          blockedAt: null,
          unblockedAt: new Date(),
          isActive: true
        })
        .where(eq(driverProfiles.driverId, driverId));

      // Reset commission reminders
      await db
        .update(driverCommissions)
        .set({
          reminderCount: 0,
          lastReminderSent: null,
          updatedAt: new Date()
        })
        .where(eq(driverCommissions.driverId, driverId));

      return {
        success: true,
        driverId,
        unblockedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error unlocking driver:', error);
      throw error;
    }
  }

  /**
   * Get payment history for driver
   */
  async getPaymentHistory(driverId: number) {
    try {
      // This would query payment records from database
      // For now returning mock data as payment schema isn't fully implemented
      return [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Record commission payment
   */
  async recordPayment(driverId: number, amount: number, method: string) {
    try {
      // Update commission paid amount
      await db
        .update(driverCommissions)
        .set({
          commissionPaid: sql`${driverCommissions.commissionPaid} + ${amount}`,
          commissionOwed: sql`${driverCommissions.commissionOwed} - ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(driverCommissions.driverId, driverId));

      return {
        id: Date.now(),
        driverId,
        amount,
        method,
        paidAt: new Date().toISOString(),
        status: 'completed'
      };
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  private async getPendingRemindersCount(): Promise<number> {
    try {
      const pending = await db
        .select()
        .from(driverCommissions)
        .where(and(
          eq(driverCommissions.isBlocked, false),
          gte(driverCommissions.commissionOwed, COMMISSION_THRESHOLD.toString())
        ));
      return pending.length;
    } catch (error) {
      console.error('Error counting pending reminders:', error);
      return 0;
    }
  }
}

export const commissionService = new CommissionService();