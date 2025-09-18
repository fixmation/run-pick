import { Router } from "express";
import { z } from "zod";
import { achievementService } from "../services/achievementService";
import { seedAchievements } from "../seedData/achievementSeeds";
import { isAuthenticated, authorizeRole } from "../middleware/auth";

const router = Router();

// Get user achievements
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const [achievements, stats] = await Promise.all([
      achievementService.getUserAchievements(userId),
      achievementService.getUserStats(userId),
    ]);

    res.json({
      achievements,
      stats,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

// Get user stats only
router.get("/stats/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const stats = await achievementService.getUserStats(userId);
    res.json({ stats, success: true });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Get recent achievements
router.get("/recent/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 5;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const recentAchievements = await achievementService.getRecentAchievements(userId, limit);
    res.json({ achievements: recentAchievements, success: true });
  } catch (error) {
    console.error("Error fetching recent achievements:", error);
    res.status(500).json({ message: "Failed to fetch recent achievements" });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await achievementService.getLeaderboard(limit);
    res.json({ leaderboard, success: true });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Manual achievement triggers (for testing or admin use)
const achievementActionSchema = z.object({
  userId: z.number(),
  action: z.enum(['ride', 'food_order', 'parcel', 'earnings', 'perfect_rating']),
  amount: z.number().optional(),
});

router.post("/trigger", isAuthenticated, async (req, res) => {
  try {
    const { userId, action, amount } = achievementActionSchema.parse(req.body);
    
    let unlockedAchievements = [];
    
    switch (action) {
      case 'ride':
        unlockedAchievements = await achievementService.incrementRideCount(userId);
        break;
      case 'food_order':
        unlockedAchievements = await achievementService.incrementFoodOrderCount(userId);
        break;
      case 'parcel':
        unlockedAchievements = await achievementService.incrementParcelCount(userId);
        break;
      case 'earnings':
        if (!amount) {
          return res.status(400).json({ message: "Amount required for earnings action" });
        }
        unlockedAchievements = await achievementService.addEarnings(userId, amount);
        break;
      case 'perfect_rating':
        unlockedAchievements = await achievementService.incrementPerfectRating(userId);
        break;
    }

    res.json({
      success: true,
      message: `${action} incremented successfully`,
      unlockedAchievements,
    });
  } catch (error) {
    console.error("Error triggering achievement:", error);
    res.status(500).json({ message: "Failed to trigger achievement" });
  }
});

// Initialize user stats (called on user registration)
router.post("/initialize/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const stats = await achievementService.initializeUserStats(userId);
    res.json({ stats, success: true, message: "User stats initialized" });
  } catch (error) {
    console.error("Error initializing user stats:", error);
    res.status(500).json({ message: "Failed to initialize user stats" });
  }
});

// Seed achievements (admin only)
router.post("/seed", async (req, res) => {
  try {
    await seedAchievements();
    res.json({ success: true, message: "Achievements seeded successfully" });
  } catch (error) {
    console.error("Error seeding achievements:", error);
    res.status(500).json({ message: "Failed to seed achievements" });
  }
});

export { router as achievementRoutes };