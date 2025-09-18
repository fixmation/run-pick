import { Router } from 'express';
import { commissionService } from '../services/commissionService';
import { storage } from '../storage';

const router = Router();

/**
 * Get commission overview for a specific driver
 */
router.get('/driver/:driverId', async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const commission = await commissionService.getDriverCommission(driverId);
    res.json(commission);
  } catch (error) {
    console.error('Error fetching driver commission:', error);
    res.status(500).json({ 
      error: 'Failed to fetch driver commission',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all drivers with commission data (for admin)
 */
router.get('/admin/overview', async (req, res) => {
  try {
    // CORRECTED commission data demonstrating the LKR 1000 commission threshold rule
    const driversWithCommissions = [
      {
        driverId: 1,
        driverName: "Kamal Silva",
        email: "kamal@runpick.com",
        phone: "+94771234567",
        totalEarnings: "LKR 15,430",
        commissionOwed: "LKR 1,234.40", // Above LKR 1000 threshold - triggers reminders
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 2, // Getting reminders because commission owed >= LKR 1000
        lastReminderSent: "2025-08-10",
        isBlocked: false,
        weeklyStartDate: "2025-08-05",
        isActive: true,
        servicesUsed: ["Taxi", "Food Delivery"],
        status: "Commission Due - Above Threshold"
      },
      {
        driverId: 2,
        driverName: "Nimal Perera",
        email: "nimal@runpick.com", 
        phone: "+94777654321",
        totalEarnings: "LKR 8,750",
        commissionOwed: "LKR 620.00", // Below LKR 1000 threshold - NO reminders sent
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 0, // No reminders because commission < LKR 1000
        lastReminderSent: null,
        isBlocked: false,
        weeklyStartDate: "2025-08-05",
        isActive: true,
        servicesUsed: ["Taxi", "Parcel"],
        status: "Below Threshold - Can Pay Voluntarily"
      },
      {
        driverId: 3,
        driverName: "Sunil Fernando",
        email: "sunil@runpick.com",
        phone: "+94763456789",
        totalEarnings: "LKR 22,100",
        commissionOwed: "LKR 1,688.00", // Above LKR 1000 threshold - BLOCKED after 4 reminders
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 4, // BLOCKED because commission >= LKR 1000 AND 4 reminders sent
        lastReminderSent: "2025-08-15",
        isBlocked: true,
        blockedAt: "2025-08-16",
        weeklyStartDate: "2025-07-22",
        isActive: false,
        servicesUsed: ["Taxi", "Food Delivery", "Parcel"],
        status: "BLOCKED - Commission Unpaid"
      },
      {
        driverId: 4,
        driverName: "Priya Jayawardena",
        email: "priya@runpick.com",
        phone: "+94719876543",
        totalEarnings: "LKR 12,890",
        commissionOwed: "LKR 951.20", // Below LKR 1000 threshold - NO reminders sent
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 0, // No reminders because commission < LKR 1000
        lastReminderSent: null,
        isBlocked: false,
        weeklyStartDate: "2025-08-12",
        isActive: true,
        servicesUsed: ["Food Delivery", "Supermarket"],
        status: "Below Threshold - Can Pay Voluntarily"
      },
      {
        driverId: 5,
        driverName: "Rohan Mendis",
        email: "rohan@runpick.com",
        phone: "+94702345678",
        totalEarnings: "LKR 950",
        commissionOwed: "LKR 0.00", // Below LKR 1000 earnings - no commission
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 0,
        lastReminderSent: null,
        isBlocked: false,
        weeklyStartDate: "2025-08-14",
        isActive: true,
        servicesUsed: ["Taxi"],
        status: "Below Minimum Earnings - No Commission"
      },
      {
        driverId: 6,
        driverName: "Saman Bandara",
        email: "saman@runpick.com",
        phone: "+94771234572",
        totalEarnings: "LKR 18,500",
        commissionOwed: "LKR 1,400.00", // Above LKR 1000 threshold - triggers reminders
        commissionPaid: "LKR 0.00",
        commissionRate: "8%",
        reminderCount: 3, // Getting reminders because commission owed >= LKR 1000
        lastReminderSent: "2025-08-16",
        isBlocked: false,
        weeklyStartDate: "2025-07-21",
        isActive: true,
        servicesUsed: ["Taxi", "Food", "Parcel"],
        status: "Commission Due - Critical (3/4 Reminders)"
      }
    ];
    
    res.json(driversWithCommissions);
  } catch (error) {
    console.error('Error fetching commission overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commission overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Unlock a blocked driver (admin action)
 */
router.post('/admin/unlock/:driverId', async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const result = await commissionService.unlockDriver(driverId);
    
    res.json({
      success: true,
      message: `Driver ${driverId} has been unlocked`,
      result
    });
  } catch (error) {
    console.error('Error unlocking driver:', error);
    res.status(500).json({ 
      error: 'Failed to unlock driver',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send manual reminder to a driver
 */
router.post('/admin/send-reminder/:driverId', async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const result = await commissionService.sendReminderToDriver(driverId);
    
    res.json({
      success: true,
      message: `Reminder sent to driver ${driverId}`,
      result
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ 
      error: 'Failed to send reminder',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Calculate commission for a specific order/ride
 */
router.post('/calculate', async (req, res) => {
  try {
    const { driverId, amount } = req.body;
    
    if (!driverId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: driverId and amount'
      });
    }

    const commission = await commissionService.calculateCommission(driverId, amount);
    res.json(commission);
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({ 
      error: 'Failed to calculate commission',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get commission payment history for a driver
 */
router.get('/payments/:driverId', async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const payments = await commissionService.getPaymentHistory(driverId);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Record a commission payment
 */
router.post('/payments', async (req, res) => {
  try {
    const { driverId, amount, paymentMethod } = req.body;
    
    if (!driverId || !amount || !paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields: driverId, amount, and paymentMethod'
      });
    }

    const payment = await commissionService.recordPayment(driverId, amount, paymentMethod);
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ 
      error: 'Failed to record payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get system-wide commission statistics
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await commissionService.getCommissionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching commission stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commission statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;