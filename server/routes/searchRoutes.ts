import { Router } from 'express';
import { db } from '../db';
import { restaurants, rides, users } from '@shared/schema';
import { eq, like, and, or, desc, sql } from 'drizzle-orm';

const router = Router();

interface SearchResult {
  id: string;
  type: 'taxi' | 'restaurant' | 'driver' | 'service';
  title: string;
  subtitle: string;
  description?: string;
  distance?: number;
  rating?: number;
  estimatedTime?: number;
  price?: string;
  imageUrl?: string;
  tags?: string[];
  metadata?: any;
}

// Search endpoint
router.get('/', async (req, res) => {
  try {
    const { q, location, filter } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const searchQuery = q.toLowerCase();
    const results: SearchResult[] = [];

    // Search restaurants
    if (!filter || filter === 'food') {
      try {
        const restaurantResults = await db
          .select()
          .from(restaurants)
          .where(
            or(
              like(restaurants.name, `%${searchQuery}%`),
              like(restaurants.description, `%${searchQuery}%`),
              like(restaurants.cuisine, `%${searchQuery}%`)
            )
          )
          .limit(5);

        restaurantResults.forEach(restaurant => {
          results.push({
            id: `restaurant-${restaurant.id}`,
            type: 'restaurant',
            title: restaurant.name,
            subtitle: restaurant.cuisine || 'Restaurant',
            description: restaurant.description,
            distance: restaurant.latitude && restaurant.longitude ? 
              Math.random() * 10 + 1 : undefined, // Mock distance calculation
            rating: restaurant.rating ? parseFloat(restaurant.rating) : undefined,
            estimatedTime: restaurant.deliveryTime || Math.floor(Math.random() * 30 + 15),
            price: 'LKR 500-1500',
            tags: [restaurant.cuisine].filter(Boolean),
            metadata: {
              restaurantId: restaurant.id,
              cuisine: restaurant.cuisine,
              address: restaurant.address
            }
          });
        });
      } catch (error) {
        console.error('Error searching restaurants:', error);
      }
    }

    // Search drivers/taxis (mock data for now)
    if (!filter || filter === 'taxi') {
      const taxiResults = [
        {
          id: 'taxi-1',
          type: 'taxi' as const,
          title: 'Nearby Taxi',
          subtitle: '3 min away',
          description: 'Blue Toyota Prius - Kasun',
          distance: 0.8,
          rating: 4.8,
          estimatedTime: 3,
          price: 'LKR 120/km',
          tags: ['Available Now', 'AC'],
          metadata: { vehicleType: 'car', driverId: 1 }
        },
        {
          id: 'taxi-2',
          type: 'taxi' as const,
          title: 'Tuk-Tuk Ride',
          subtitle: '5 min away',
          description: 'Three-wheeler - Ravi',
          distance: 1.2,
          rating: 4.5,
          estimatedTime: 5,
          price: 'LKR 80/km',
          tags: ['Economy', 'Quick'],
          metadata: { vehicleType: 'tuktuk', driverId: 2 }
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery) ||
        result.description.toLowerCase().includes(searchQuery) ||
        result.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );

      results.push(...taxiResults);
    }

    // Search parcel services (mock data)
    if (!filter || filter === 'parcel') {
      const parcelResults = [
        {
          id: 'parcel-1',
          type: 'driver' as const,
          title: 'Parcel Delivery',
          subtitle: 'Available for pickup',
          description: 'Van available for large packages',
          distance: 1.5,
          rating: 4.6,
          estimatedTime: 5,
          price: 'From LKR 200',
          tags: ['Large Capacity'],
          metadata: { vehicleType: 'van', service: 'parcel' }
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery) ||
        result.description.toLowerCase().includes(searchQuery) ||
        result.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );

      results.push(...parcelResults);
    }

    // Sort results by relevance (exact matches first, then by distance)
    results.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase().includes(searchQuery) ? 1 : 0;
      const bExactMatch = b.title.toLowerCase().includes(searchQuery) ? 1 : 0;
      
      if (aExactMatch !== bExactMatch) {
        return bExactMatch - aExactMatch;
      }
      
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      
      return 0;
    });

    res.json(results.slice(0, 10)); // Return top 10 results
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get trending searches
router.get('/trending', async (req, res) => {
  try {
    const trending = [
      'Taxi to airport',
      'Pizza delivery',
      'Parcel to Kandy',
      'Kottu near me',
      'Chinese food',
      'Tuk-tuk ride',
      'Package delivery',
      'Seafood restaurant'
    ];
    
    res.json(trending);
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    res.status(500).json({ error: 'Failed to fetch trending searches' });
  }
});

export default router;