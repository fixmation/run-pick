import { db } from '../db';
import { 
  serviceZones, 
  locationRecommendations, 
  restaurants, 
  driverProfiles,
  vendorProfiles,
  type InsertLocationRecommendation,
  type ServiceZone,
  type LocationRecommendation 
} from '@shared/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { calculateDistance } from '../utils/businessLogic';

interface RecommendationData {
  id: number;
  name: string;
  type: string;
  distance: number;
  rating?: number;
  estimatedTime?: number;
  metadata: any;
}

interface LocationRecommendationResult {
  serviceType: 'taxi' | 'food' | 'parcel';
  recommendations: RecommendationData[];
  confidence: number;
  distance: number;
  zoneInfo?: ServiceZone;
}

export class LocationRecommendationService {
  /**
   * Generate comprehensive location-based service recommendations
   */
  async generateRecommendations(
    userLatitude: number,
    userLongitude: number,
    userId?: number
  ): Promise<LocationRecommendationResult[]> {
    try {
      const results: LocationRecommendationResult[] = [];

      // Get taxi recommendations (nearby drivers)
      const taxiRecommendations = await this.getTaxiRecommendations(userLatitude, userLongitude);
      if (taxiRecommendations.recommendations.length > 0) {
        results.push(taxiRecommendations);
      }

      // Get food delivery recommendations (nearby restaurants)
      const foodRecommendations = await this.getFoodRecommendations(userLatitude, userLongitude);
      if (foodRecommendations.recommendations.length > 0) {
        results.push(foodRecommendations);
      }

      // Get parcel delivery recommendations (available drivers)
      const parcelRecommendations = await this.getParcelRecommendations(userLatitude, userLongitude);
      if (parcelRecommendations.recommendations.length > 0) {
        results.push(parcelRecommendations);
      }

      // Store recommendations in database for analytics
      if (userId) {
        await this.storeRecommendations(userId, userLatitude, userLongitude, results);
      }

      return results;
    } catch (error) {
      console.error('Error generating location recommendations:', error);
      return [];
    }
  }

  /**
   * Get taxi service recommendations based on nearby drivers
   */
  private async getTaxiRecommendations(
    userLatitude: number,
    userLongitude: number
  ): Promise<LocationRecommendationResult> {
    const nearbyDrivers = await db
      .select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        vehicleType: driverProfiles.vehicleType,
        vehicleModel: driverProfiles.vehicleModel,
        vehicleColor: driverProfiles.vehicleColor,
        rating: driverProfiles.rating,
        currentLatitude: driverProfiles.currentLatitude,
        currentLongitude: driverProfiles.currentLongitude,
        status: driverProfiles.status,
        isAvailable: driverProfiles.isAvailable,
      })
      .from(driverProfiles)
      .where(
        and(
          eq(driverProfiles.isAvailable, true),
          eq(driverProfiles.status, 'online')
        )
      )
      .limit(20);

    const recommendations: RecommendationData[] = nearbyDrivers
      .map(driver => {
        if (!driver.currentLatitude || !driver.currentLongitude) return null;
        
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          parseFloat(driver.currentLatitude),
          parseFloat(driver.currentLongitude)
        );

        return {
          id: driver.id,
          name: `${driver.vehicleType} - ${driver.vehicleModel || 'Available'}`,
          type: 'taxi',
          distance,
          rating: parseFloat(driver.rating || '0'),
          estimatedTime: Math.round(distance * 3), // 3 minutes per km
          metadata: {
            driverId: driver.userId,
            vehicleType: driver.vehicleType,
            vehicleModel: driver.vehicleModel,
            vehicleColor: driver.vehicleColor,
            coordinates: {
              lat: parseFloat(driver.currentLatitude),
              lng: parseFloat(driver.currentLongitude)
            }
          }
        };
      })
      .filter(Boolean)
      .filter(rec => rec!.distance <= 15) // Within 15km
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 5) as RecommendationData[];

    const avgDistance = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.distance, 0) / recommendations.length
      : 0;

    const confidence = this.calculateConfidence(recommendations.length, avgDistance, 'taxi');

    return {
      serviceType: 'taxi',
      recommendations,
      confidence,
      distance: avgDistance
    };
  }

  /**
   * Get food delivery recommendations based on nearby restaurants
   */
  private async getFoodRecommendations(
    userLatitude: number,
    userLongitude: number
  ): Promise<LocationRecommendationResult> {
    const nearbyRestaurants = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        description: restaurants.description,
        address: restaurants.address,
        latitude: restaurants.latitude,
        longitude: restaurants.longitude,
        cuisine: restaurants.cuisine,
        rating: restaurants.rating,
        deliveryTime: restaurants.deliveryTime,
        isActive: restaurants.isActive,
      })
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .limit(50);

    const recommendations: RecommendationData[] = nearbyRestaurants
      .map(restaurant => {
        if (!restaurant.latitude || !restaurant.longitude) return null;
        
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          parseFloat(restaurant.latitude),
          parseFloat(restaurant.longitude)
        );

        return {
          id: restaurant.id,
          name: restaurant.name,
          type: 'restaurant',
          distance,
          rating: parseFloat(restaurant.rating || '0'),
          estimatedTime: (restaurant.deliveryTime || 30) + Math.round(distance * 2), // Delivery time + travel
          metadata: {
            cuisine: restaurant.cuisine,
            address: restaurant.address,
            description: restaurant.description,
            baseDeliveryTime: restaurant.deliveryTime,
            coordinates: {
              lat: parseFloat(restaurant.latitude),
              lng: parseFloat(restaurant.longitude)
            }
          }
        };
      })
      .filter(Boolean)
      .filter(rec => rec!.distance <= 10) // Within 10km for food delivery
      .sort((a, b) => {
        // Sort by rating first, then distance
        const ratingDiff = b!.rating - a!.rating;
        return ratingDiff !== 0 ? ratingDiff : a!.distance - b!.distance;
      })
      .slice(0, 8) as RecommendationData[];

    const avgDistance = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.distance, 0) / recommendations.length
      : 0;

    const confidence = this.calculateConfidence(recommendations.length, avgDistance, 'food');

    return {
      serviceType: 'food',
      recommendations,
      confidence,
      distance: avgDistance
    };
  }

  /**
   * Get parcel delivery recommendations based on available drivers
   */
  private async getParcelRecommendations(
    userLatitude: number,
    userLongitude: number
  ): Promise<LocationRecommendationResult> {
    // Find drivers suitable for parcel delivery (bikes, cars, vans)
    const parcelDrivers = await db
      .select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        vehicleType: driverProfiles.vehicleType,
        vehicleModel: driverProfiles.vehicleModel,
        rating: driverProfiles.rating,
        currentLatitude: driverProfiles.currentLatitude,
        currentLongitude: driverProfiles.currentLongitude,
        status: driverProfiles.status,
        isAvailable: driverProfiles.isAvailable,
      })
      .from(driverProfiles)
      .where(
        and(
          eq(driverProfiles.isAvailable, true),
          eq(driverProfiles.status, 'online')
        )
      )
      .limit(15);

    const recommendations: RecommendationData[] = parcelDrivers
      .map(driver => {
        if (!driver.currentLatitude || !driver.currentLongitude) return null;
        
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          parseFloat(driver.currentLatitude),
          parseFloat(driver.currentLongitude)
        );

        // Calculate capacity based on vehicle type
        const capacity = this.getVehicleCapacity(driver.vehicleType);

        return {
          id: driver.id,
          name: `${driver.vehicleType} - ${capacity} capacity`,
          type: 'parcel',
          distance,
          rating: parseFloat(driver.rating || '0'),
          estimatedTime: Math.round(distance * 2.5), // Slightly faster than taxi
          metadata: {
            driverId: driver.userId,
            vehicleType: driver.vehicleType,
            vehicleModel: driver.vehicleModel,
            capacity,
            coordinates: {
              lat: parseFloat(driver.currentLatitude),
              lng: parseFloat(driver.currentLongitude)
            }
          }
        };
      })
      .filter(Boolean)
      .filter(rec => rec!.distance <= 20) // Within 20km for parcel delivery
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 6) as RecommendationData[];

    const avgDistance = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.distance, 0) / recommendations.length
      : 0;

    const confidence = this.calculateConfidence(recommendations.length, avgDistance, 'parcel');

    return {
      serviceType: 'parcel',
      recommendations,
      confidence,
      distance: avgDistance
    };
  }

  /**
   * Calculate confidence score based on availability and distance
   */
  private calculateConfidence(count: number, avgDistance: number, serviceType: string): number {
    let confidence = 0;

    // Base confidence on availability
    if (count >= 5) confidence += 0.4;
    else if (count >= 3) confidence += 0.3;
    else if (count >= 1) confidence += 0.2;

    // Adjust for distance
    const distanceThresholds = {
      taxi: 10,
      food: 5,
      parcel: 15
    };

    const threshold = distanceThresholds[serviceType as keyof typeof distanceThresholds];
    if (avgDistance <= threshold * 0.5) confidence += 0.4;
    else if (avgDistance <= threshold * 0.75) confidence += 0.3;
    else if (avgDistance <= threshold) confidence += 0.2;

    // Quality bonus (higher ratings)
    confidence += 0.2; // Assume good quality for now

    return Math.min(confidence, 1.0);
  }

  /**
   * Get vehicle capacity description
   */
  private getVehicleCapacity(vehicleType: string): string {
    const capacities = {
      'bike': 'Small packages',
      'tuk_tuk': 'Medium packages', 
      'car': 'Large packages',
      'van': 'Bulk delivery',
      'truck': 'Commercial delivery'
    };
    return capacities[vehicleType as keyof typeof capacities] || 'Standard';
  }

  /**
   * Store recommendations for analytics and caching
   */
  private async storeRecommendations(
    userId: number,
    userLatitude: number,
    userLongitude: number,
    recommendations: LocationRecommendationResult[]
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      for (const rec of recommendations) {
        await db.insert(locationRecommendations).values({
          userId,
          userLatitude: userLatitude.toString(),
          userLongitude: userLongitude.toString(),
          serviceType: rec.serviceType,
          recommendedServices: rec.recommendations,
          distanceKm: rec.distance.toString(),
          confidence: rec.confidence.toString(),
          expiresAt
        });
      }
    } catch (error) {
      console.error('Error storing recommendations:', error);
    }
  }

  /**
   * Get cached recommendations if available and not expired
   */
  async getCachedRecommendations(
    userId: number,
    userLatitude: number,
    userLongitude: number,
    maxAgeMinutes: number = 30
  ): Promise<LocationRecommendation[]> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    
    try {
      return await db
        .select()
        .from(locationRecommendations)
        .where(
          and(
            eq(locationRecommendations.userId, userId),
            gte(locationRecommendations.createdAt, cutoff),
            gte(locationRecommendations.expiresAt, new Date())
          )
        )
        .orderBy(locationRecommendations.createdAt);
    } catch (error) {
      console.error('Error getting cached recommendations:', error);
      return [];
    }
  }

  /**
   * Mark recommendations as viewed for analytics
   */
  async markRecommendationsViewed(recommendationIds: number[]): Promise<void> {
    try {
      for (const id of recommendationIds) {
        await db
          .update(locationRecommendations)
          .set({ isViewed: true })
          .where(eq(locationRecommendations.id, id));
      }
    } catch (error) {
      console.error('Error marking recommendations as viewed:', error);
    }
  }
}

export const locationRecommendationService = new LocationRecommendationService();