import { db } from "../db";
import { achievementCategories, achievements } from "@shared/schema";

export async function seedAchievements() {
  try {
    console.log("🏆 Seeding achievement system...");

    // Check if achievements already exist
    const existingAchievements = await db.select().from(achievements).limit(1);
    if (existingAchievements.length > 0) {
      console.log("✅ Achievements already seeded");
      return;
    }

    // Create achievement categories
    const categories = await db.insert(achievementCategories).values([
      {
        name: "Transportation",
        description: "Achievements related to taxi rides and transportation",
        iconColor: "#3B82F6",
      },
      {
        name: "Food Delivery",
        description: "Achievements related to food orders and delivery",
        iconColor: "#F59E0B",
      },
      {
        name: "Parcel Service",
        description: "Achievements related to parcel delivery",
        iconColor: "#10B981",
      },
      {
        name: "Social & Community",
        description: "Achievements related to social interactions and community",
        iconColor: "#8B5CF6",
      },
      {
        name: "Milestones",
        description: "Major milestone achievements",
        iconColor: "#EF4444",
      },
      {
        name: "Excellence",
        description: "Achievements for exceptional performance",
        iconColor: "#F97316",
      },
    ]).returning();

    const [transportCategory, foodCategory, parcelCategory, socialCategory, milestoneCategory, excellenceCategory] = categories;

    // Create achievements
    await db.insert(achievements).values([
      // Transportation Achievements
      {
        categoryId: transportCategory.id,
        name: "First Ride",
        description: "Complete your first taxi ride",
        badgeIcon: "Car",
        badgeColor: "#3B82F6",
        points: 10,
        requirement: { type: "ride_count", target: 1 },
        tier: "bronze",
      },
      {
        categoryId: transportCategory.id,
        name: "Regular Commuter",
        description: "Complete 10 taxi rides",
        badgeIcon: "Navigation",
        badgeColor: "#3B82F6",
        points: 50,
        requirement: { type: "ride_count", target: 10 },
        tier: "silver",
      },
      {
        categoryId: transportCategory.id,
        name: "Road Warrior",
        description: "Complete 50 taxi rides",
        badgeIcon: "Zap",
        badgeColor: "#3B82F6",
        points: 200,
        requirement: { type: "ride_count", target: 50 },
        tier: "gold",
      },
      {
        categoryId: transportCategory.id,
        name: "Transport Legend",
        description: "Complete 200 taxi rides",
        badgeIcon: "Crown",
        badgeColor: "#3B82F6",
        points: 500,
        requirement: { type: "ride_count", target: 200 },
        tier: "platinum",
      },

      // Food Delivery Achievements
      {
        categoryId: foodCategory.id,
        name: "Foodie Beginner",
        description: "Order your first meal",
        badgeIcon: "UtensilsCrossed",
        badgeColor: "#F59E0B",
        points: 10,
        requirement: { type: "food_order_count", target: 1 },
        tier: "bronze",
      },
      {
        categoryId: foodCategory.id,
        name: "Regular Diner",
        description: "Order 15 meals",
        badgeIcon: "ChefHat",
        badgeColor: "#F59E0B",
        points: 75,
        requirement: { type: "food_order_count", target: 15 },
        tier: "silver",
      },
      {
        categoryId: foodCategory.id,
        name: "Food Enthusiast",
        description: "Order 50 meals",
        badgeIcon: "Pizza",
        badgeColor: "#F59E0B",
        points: 250,
        requirement: { type: "food_order_count", target: 50 },
        tier: "gold",
      },
      {
        categoryId: foodCategory.id,
        name: "Culinary Master",
        description: "Order 150 meals",
        badgeIcon: "Award",
        badgeColor: "#F59E0B",
        points: 600,
        requirement: { type: "food_order_count", target: 150 },
        tier: "platinum",
      },

      // Parcel Achievements
      {
        categoryId: parcelCategory.id,
        name: "First Delivery",
        description: "Send your first parcel",
        badgeIcon: "Package",
        badgeColor: "#10B981",
        points: 10,
        requirement: { type: "parcel_count", target: 1 },
        tier: "bronze",
      },
      {
        categoryId: parcelCategory.id,
        name: "Reliable Sender",
        description: "Send 20 parcels",
        badgeIcon: "Truck",
        badgeColor: "#10B981",
        points: 100,
        requirement: { type: "parcel_count", target: 20 },
        tier: "silver",
      },
      {
        categoryId: parcelCategory.id,
        name: "Logistics Expert",
        description: "Send 75 parcels",
        badgeIcon: "MapPin",
        badgeColor: "#10B981",
        points: 350,
        requirement: { type: "parcel_count", target: 75 },
        tier: "gold",
      },

      // Excellence Achievements
      {
        categoryId: excellenceCategory.id,
        name: "Five Star Service",
        description: "Receive 5 perfect ratings",
        badgeIcon: "Star",
        badgeColor: "#F97316",
        points: 100,
        requirement: { type: "perfect_ratings", target: 5 },
        tier: "silver",
      },
      {
        categoryId: excellenceCategory.id,
        name: "Excellence Ambassador",
        description: "Receive 25 perfect ratings",
        badgeIcon: "Trophy",
        badgeColor: "#F97316",
        points: 400,
        requirement: { type: "perfect_ratings", target: 25 },
        tier: "gold",
      },
      {
        categoryId: excellenceCategory.id,
        name: "Service Legend",
        description: "Receive 100 perfect ratings",
        badgeIcon: "Medal",
        badgeColor: "#F97316",
        points: 1000,
        requirement: { type: "perfect_ratings", target: 100 },
        tier: "diamond",
      },

      // Milestone Achievements
      {
        categoryId: milestoneCategory.id,
        name: "Level Up",
        description: "Reach Level 5",
        badgeIcon: "TrendingUp",
        badgeColor: "#EF4444",
        points: 100,
        requirement: { type: "level_reached", target: 5 },
        tier: "silver",
      },
      {
        categoryId: milestoneCategory.id,
        name: "High Achiever",
        description: "Reach Level 10",
        badgeIcon: "Target",
        badgeColor: "#EF4444",
        points: 300,
        requirement: { type: "level_reached", target: 10 },
        tier: "gold",
      },
      {
        categoryId: milestoneCategory.id,
        name: "Elite Member",
        description: "Reach Level 20",
        badgeIcon: "Gem",
        badgeColor: "#EF4444",
        points: 800,
        requirement: { type: "level_reached", target: 20 },
        tier: "platinum",
      },
      {
        categoryId: milestoneCategory.id,
        name: "Points Collector",
        description: "Earn 1000 points",
        badgeIcon: "Coins",
        badgeColor: "#EF4444",
        points: 200,
        requirement: { type: "total_points", target: 1000 },
        tier: "gold",
      },
      {
        categoryId: milestoneCategory.id,
        name: "Points Master",
        description: "Earn 5000 points",
        badgeIcon: "Banknote",
        badgeColor: "#EF4444",
        points: 500,
        requirement: { type: "total_points", target: 5000 },
        tier: "platinum",
      },

      // Social & Community Achievements
      {
        categoryId: socialCategory.id,
        name: "Streak Starter",
        description: "Maintain a 7-day streak",
        badgeIcon: "Flame",
        badgeColor: "#8B5CF6",
        points: 75,
        requirement: { type: "streak_days", target: 7 },
        tier: "silver",
      },
      {
        categoryId: socialCategory.id,
        name: "Dedication Master",
        description: "Maintain a 30-day streak",
        badgeIcon: "Calendar",
        badgeColor: "#8B5CF6",
        points: 300,
        requirement: { type: "streak_days", target: 30 },
        tier: "gold",
      },
      {
        categoryId: socialCategory.id,
        name: "Unstoppable Force",
        description: "Maintain a 100-day streak",
        badgeIcon: "Infinity",
        badgeColor: "#8B5CF6",
        points: 1000,
        requirement: { type: "streak_days", target: 100 },
        tier: "diamond",
      },

      // Special Driver/Vendor Achievements
      {
        categoryId: excellenceCategory.id,
        name: "Big Earner",
        description: "Earn LKR 50,000 in total",
        badgeIcon: "DollarSign",
        badgeColor: "#10B981",
        points: 300,
        requirement: { type: "earnings_amount", target: 5000000 }, // 50,000 LKR in cents
        tier: "gold",
      },
      {
        categoryId: excellenceCategory.id,
        name: "Top Performer",
        description: "Earn LKR 200,000 in total",
        badgeIcon: "TrendingUp",
        badgeColor: "#10B981",
        points: 800,
        requirement: { type: "earnings_amount", target: 20000000 }, // 200,000 LKR in cents
        tier: "platinum",
      },
    ]);

    console.log("✅ Achievement system seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
    throw error;
  }
}