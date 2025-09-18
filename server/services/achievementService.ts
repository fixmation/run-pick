import { db } from "../db";
import { 
  achievements, 
  achievementCategories, 
  userAchievements, 
  userStats, 
  dailyProgress,
  users,
  type Achievement,
  type UserAchievement,
  type UserStats as UserStatsType,
  type InsertUserAchievement,
  type InsertUserStats
} from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export class AchievementService {
  
  // Initialize user stats when they first register
  async initializeUserStats(userId: number): Promise<UserStatsType> {
    const existingStats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    
    if (existingStats.length > 0) {
      return existingStats[0];
    }

    const [newStats] = await db.insert(userStats).values({
      userId,
      totalPoints: 0,
      currentLevel: 1,
      totalRides: 0,
      totalFoodOrders: 0,
      totalParcels: 0,
      totalEarnings: 0,
      perfectRatingCount: 0,
      streakDays: 0,
      longestStreak: 0,
    }).returning();

    // Initialize achievements for new user
    await this.initializeUserAchievements(userId);
    
    return newStats;
  }

  // Initialize all achievements for a user
  async initializeUserAchievements(userId: number): Promise<void> {
    const allAchievements = await db.select().from(achievements).where(eq(achievements.isActive, true));
    
    const userAchievementData: InsertUserAchievement[] = allAchievements.map(achievement => {
      const requirement = achievement.requirement as any;
      return {
        userId,
        achievementId: achievement.id,
        progress: 0,
        maxProgress: requirement.target || 1,
        isCompleted: false,
        pointsEarned: 0,
      };
    });

    if (userAchievementData.length > 0) {
      await db.insert(userAchievements).values(userAchievementData).onConflictDoNothing();
    }
  }

  // Update user stats and check for achievements
  async updateUserStats(userId: number, updates: Partial<UserStatsType>): Promise<void> {
    const currentStats = await this.getUserStats(userId);
    
    const updatedStats = {
      ...currentStats,
      ...updates,
      updatedAt: new Date(),
    };

    // Calculate new level based on total points
    const newLevel = this.calculateLevel(updatedStats.totalPoints);
    updatedStats.currentLevel = newLevel;

    await db.update(userStats)
      .set(updatedStats)
      .where(eq(userStats.userId, userId));

    // Check for achievement progress
    await this.checkAchievementProgress(userId, updatedStats);
  }

  // Calculate user level based on points
  private calculateLevel(totalPoints: number): number {
    // Level formula: Level = floor(sqrt(points / 100)) + 1
    // Level 1: 0-99 points, Level 2: 100-399 points, Level 3: 400-899 points, etc.
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  // Check and update achievement progress
  async checkAchievementProgress(userId: number, currentStats: UserStatsType): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = [];
    
    const userActiveAchievements = await db.select({
      userAchievement: userAchievements,
      achievement: achievements,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.isCompleted, false),
        eq(achievements.isActive, true)
      )
    );

    for (const { userAchievement, achievement } of userActiveAchievements) {
      const requirement = achievement.requirement as any;
      let newProgress = 0;

      // Calculate progress based on requirement type
      switch (requirement.type) {
        case 'ride_count':
          newProgress = Math.min(currentStats.totalRides, requirement.target);
          break;
        case 'food_order_count':
          newProgress = Math.min(currentStats.totalFoodOrders, requirement.target);
          break;
        case 'parcel_count':
          newProgress = Math.min(currentStats.totalParcels, requirement.target);
          break;
        case 'total_points':
          newProgress = Math.min(currentStats.totalPoints, requirement.target);
          break;
        case 'perfect_ratings':
          newProgress = Math.min(currentStats.perfectRatingCount, requirement.target);
          break;
        case 'streak_days':
          newProgress = Math.min(currentStats.streakDays, requirement.target);
          break;
        case 'level_reached':
          newProgress = Math.min(currentStats.currentLevel, requirement.target);
          break;
        case 'earnings_amount':
          newProgress = Math.min(currentStats.totalEarnings, requirement.target);
          break;
        default:
          continue;
      }

      // Update progress if changed
      if (newProgress !== userAchievement.progress) {
        const isNowCompleted = newProgress >= requirement.target;
        const pointsToAward = isNowCompleted && !userAchievement.isCompleted ? achievement.points : 0;

        const [updatedUserAchievement] = await db.update(userAchievements)
          .set({
            progress: newProgress,
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? new Date() : userAchievement.completedAt,
            pointsEarned: userAchievement.pointsEarned + pointsToAward,
            updatedAt: new Date(),
          })
          .where(eq(userAchievements.id, userAchievement.id))
          .returning();

        // If achievement was just completed, award points
        if (isNowCompleted && !userAchievement.isCompleted) {
          await this.awardPoints(userId, pointsToAward);
          unlockedAchievements.push(updatedUserAchievement);
        }
      }
    }

    return unlockedAchievements;
  }

  // Award points to user
  async awardPoints(userId: number, points: number): Promise<void> {
    await db.update(userStats)
      .set({
        totalPoints: sql`${userStats.totalPoints} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));
  }

  // Get user stats
  async getUserStats(userId: number): Promise<UserStatsType> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    
    if (!stats) {
      return await this.initializeUserStats(userId);
    }
    
    return stats;
  }

  // Get user achievements with progress
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db.select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      achievementId: userAchievements.achievementId,
      progress: userAchievements.progress,
      maxProgress: userAchievements.maxProgress,
      isCompleted: userAchievements.isCompleted,
      completedAt: userAchievements.completedAt,
      pointsEarned: userAchievements.pointsEarned,
      createdAt: userAchievements.createdAt,
      updatedAt: userAchievements.updatedAt,
      achievement: achievements,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.isCompleted), desc(userAchievements.progress));
  }

  // Get recent achievements (completed)
  async getRecentAchievements(userId: number, limit: number = 5): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db.select({
      id: userAchievements.id,
      userId: userAchievements.userId,
      achievementId: userAchievements.achievementId,
      progress: userAchievements.progress,
      maxProgress: userAchievements.maxProgress,
      isCompleted: userAchievements.isCompleted,
      completedAt: userAchievements.completedAt,
      pointsEarned: userAchievements.pointsEarned,
      createdAt: userAchievements.createdAt,
      updatedAt: userAchievements.updatedAt,
      achievement: achievements,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.isCompleted, true)
      )
    )
    .orderBy(desc(userAchievements.completedAt))
    .limit(limit);
  }

  // Increment specific stats (called when user completes actions)
  async incrementRideCount(userId: number): Promise<UserAchievement[]> {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalRides: stats.totalRides + 1,
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalRides: stats.totalRides + 1 });
  }

  async incrementFoodOrderCount(userId: number): Promise<UserAchievement[]> {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalFoodOrders: stats.totalFoodOrders + 1,
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalFoodOrders: stats.totalFoodOrders + 1 });
  }

  async incrementParcelCount(userId: number): Promise<UserAchievement[]> {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalParcels: stats.totalParcels + 1,
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalParcels: stats.totalParcels + 1 });
  }

  async addEarnings(userId: number, amount: number): Promise<UserAchievement[]> {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      totalEarnings: stats.totalEarnings + amount,
    });
    return await this.checkAchievementProgress(userId, { ...stats, totalEarnings: stats.totalEarnings + amount });
  }

  async incrementPerfectRating(userId: number): Promise<UserAchievement[]> {
    const stats = await this.getUserStats(userId);
    await this.updateUserStats(userId, {
      perfectRatingCount: stats.perfectRatingCount + 1,
    });
    return await this.checkAchievementProgress(userId, { ...stats, perfectRatingCount: stats.perfectRatingCount + 1 });
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<(UserStatsType & { user: { username: string; role: string } })[]> {
    return await db.select({
      id: userStats.id,
      userId: userStats.userId,
      totalPoints: userStats.totalPoints,
      currentLevel: userStats.currentLevel,
      totalRides: userStats.totalRides,
      totalFoodOrders: userStats.totalFoodOrders,
      totalParcels: userStats.totalParcels,
      totalEarnings: userStats.totalEarnings,
      perfectRatingCount: userStats.perfectRatingCount,
      streakDays: userStats.streakDays,
      longestStreak: userStats.longestStreak,
      createdAt: userStats.createdAt,
      updatedAt: userStats.updatedAt,
      user: {
        username: users.username,
        role: users.role,
      },
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id))
    .orderBy(desc(userStats.totalPoints), desc(userStats.currentLevel))
    .limit(limit);
  }
}

export const achievementService = new AchievementService();