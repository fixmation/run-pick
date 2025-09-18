import { Router } from 'express';
import { locationRecommendationService } from '../services/locationRecommendationService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  userId: z.number().optional()
});

const markViewedSchema = z.object({
  recommendationIds: z.array(z.number())
});

/**
 * GET /api/recommendations/location
 * Get location-based service recommendations
 */
router.get('/location', async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.query;
    
    // Validate input
    const validatedData = locationSchema.parse({
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
      userId: userId ? parseInt(userId as string) : undefined
    });

    // Check for cached recommendations first
    let recommendations;
    if (validatedData.userId) {
      const cached = await locationRecommendationService.getCachedRecommendations(
        validatedData.userId,
        validatedData.latitude,
        validatedData.longitude,
        15 // 15 minutes cache
      );
      
      if (cached.length > 0) {
        recommendations = cached.map(rec => ({
          id: rec.id,
          serviceType: rec.serviceType,
          recommendations: rec.recommendedServices,
          confidence: parseFloat(rec.confidence || '0'),
          distance: parseFloat(rec.distanceKm || '0'),
          cached: true,
          createdAt: rec.createdAt
        }));
        
        return res.json({
          success: true,
          recommendations,
          cached: true,
          location: {
            latitude: validatedData.latitude,
            longitude: validatedData.longitude
          }
        });
      }
    }

    // Generate fresh recommendations
    recommendations = await locationRecommendationService.generateRecommendations(
      validatedData.latitude,
      validatedData.longitude,
      validatedData.userId
    );

    res.json({
      success: true,
      recommendations,
      cached: false,
      location: {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting location recommendations:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get location recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/recommendations/mark-viewed
 * Mark recommendations as viewed for analytics
 */
router.post('/mark-viewed', async (req, res) => {
  try {
    const validatedData = markViewedSchema.parse(req.body);
    
    await locationRecommendationService.markRecommendationsViewed(
      validatedData.recommendationIds
    );

    res.json({
      success: true,
      message: 'Recommendations marked as viewed',
      markedCount: validatedData.recommendationIds.length
    });

  } catch (error) {
    console.error('Error marking recommendations as viewed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to mark recommendations as viewed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/recommendations/demo
 * Get demo recommendations for testing (with mock location)
 */
router.get('/demo', async (req, res) => {
  try {
    // Use Colombo coordinates as demo location
    const demoLocation = {
      latitude: 6.9271,
      longitude: 79.8612
    };

    const recommendations = await locationRecommendationService.generateRecommendations(
      demoLocation.latitude,
      demoLocation.longitude
    );

    res.json({
      success: true,
      recommendations,
      demo: true,
      location: {
        ...demoLocation,
        name: 'Colombo, Sri Lanka (Demo)'
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting demo recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get demo recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;