import { commissionService } from './commissionService';

/**
 * Cron service for scheduling weekly commission reminder tasks
 * In a production environment, this would integrate with a proper cron job scheduler
 * like node-cron, agenda, or external services like AWS CloudWatch Events
 */
export class CronService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start the weekly commission reminder scheduler
   * Runs every Monday at 9:00 AM
   */
  startWeeklyCommissionReminders() {
    // Calculate milliseconds until next Monday 9:00 AM
    const now = new Date();
    const nextMonday = new Date();
    
    // Set to next Monday
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);
    
    // If it's already Monday after 9 AM, schedule for next week
    if (now.getDay() === 1 && now.getHours() >= 9) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    
    const msUntilNextRun = nextMonday.getTime() - now.getTime();
    
    console.log(`📅 Commission reminders scheduled for: ${nextMonday.toLocaleDateString()} at 9:00 AM`);
    
    // Set initial timeout
    setTimeout(() => {
      this.runWeeklyCommissionTask();
      
      // Set up recurring weekly interval (7 days)
      const weeklyInterval = setInterval(() => {
        this.runWeeklyCommissionTask();
      }, 7 * 24 * 60 * 60 * 1000);
      
      this.intervals.set('weeklyCommissionReminders', weeklyInterval);
      
    }, msUntilNextRun);
  }

  /**
   * Run the weekly commission reminder task
   */
  private async runWeeklyCommissionTask() {
    try {
      console.log('🔔 Running weekly commission reminder task...');
      const results = await commissionService.sendWeeklyReminders();
      
      console.log('✅ Weekly commission reminders completed:', {
        totalProcessed: results.length,
        blocked: results.filter(r => r.blocked).length,
        failed: results.filter(r => r.error).length,
        timestamp: new Date().toISOString()
      });
      
      // Log individual results for monitoring
      results.forEach(result => {
        if (result.error) {
          console.error(`❌ Failed to send reminder to driver ${result.driverId}: ${result.error}`);
        } else if (result.blocked) {
          console.warn(`🚫 Driver ${result.driverId} (${result.name}) has been blocked after ${result.remindersSent} reminders`);
        } else {
          console.log(`📧 Reminder sent to driver ${result.driverId} (${result.name}) - Reminder #${result.remindersSent}`);
        }
      });
      
    } catch (error) {
      console.error('❌ Weekly commission reminder task failed:', error);
    }
  }

  /**
   * Start daily commission calculation task
   * Processes commissions for completed orders from the previous day
   */
  startDailyCommissionCalculation() {
    // Run at 1:00 AM daily
    const now = new Date();
    const next1AM = new Date();
    next1AM.setHours(25, 0, 0, 0); // Next 1 AM (25 = next day 1 AM)
    
    const msUntilNext1AM = next1AM.getTime() - now.getTime();
    
    console.log(`📊 Daily commission calculation scheduled for: ${next1AM.toLocaleDateString()} at 1:00 AM`);
    
    setTimeout(() => {
      this.runDailyCommissionCalculation();
      
      // Set up recurring daily interval (24 hours)
      const dailyInterval = setInterval(() => {
        this.runDailyCommissionCalculation();
      }, 24 * 60 * 60 * 1000);
      
      this.intervals.set('dailyCommissionCalculation', dailyInterval);
      
    }, msUntilNext1AM);
  }

  /**
   * Run daily commission calculation for completed orders
   */
  private async runDailyCommissionCalculation() {
    try {
      console.log('💰 Running daily commission calculation...');
      
      // This would typically process all completed orders from yesterday
      // For now, we'll just log that the task is running
      // In a real implementation, you would:
      // 1. Query all completed orders from yesterday
      // 2. Calculate commissions for each order
      // 3. Update driver commission records
      
      console.log('✅ Daily commission calculation completed at:', new Date().toISOString());
      
    } catch (error) {
      console.error('❌ Daily commission calculation failed:', error);
    }
  }

  /**
   * Stop a specific scheduled task
   */
  stopTask(taskName: string) {
    const interval = this.intervals.get(taskName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskName);
      console.log(`⏹️ Stopped task: ${taskName}`);
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stopAllTasks() {
    this.intervals.forEach((interval, taskName) => {
      clearInterval(interval);
      console.log(`⏹️ Stopped task: ${taskName}`);
    });
    this.intervals.clear();
  }

  /**
   * Get status of all running tasks
   */
  getTaskStatus() {
    return {
      activeTasks: Array.from(this.intervals.keys()),
      totalTasks: this.intervals.size,
      status: this.intervals.size > 0 ? 'running' : 'stopped'
    };
  }
}

export const cronService = new CronService();