import { db } from '../db';
import { restaurants } from '@shared/schema';

export const sampleRestaurants = [
  // Colombo Restaurants
  {
    name: "Spice Island Restaurant",
    description: "Authentic Sri Lankan cuisine with traditional spices",
    address: "Galle Road, Colombo 03",
    latitude: "6.9190",
    longitude: "79.8520",
    cuisine: "Sri Lankan",
    rating: "4.5",
    deliveryTime: 25
  },
  {
    name: "Ocean View Seafood",
    description: "Fresh seafood with stunning ocean views",
    address: "Marine Drive, Colombo 03",
    latitude: "6.9180",
    longitude: "79.8490",
    cuisine: "Seafood",
    rating: "4.3",
    deliveryTime: 30
  },
  {
    name: "Metro Pizza Palace",
    description: "Wood-fired pizzas and Italian specialties",
    address: "Duplication Road, Colombo 04",
    latitude: "6.8950",
    longitude: "79.8580",
    cuisine: "Italian",
    rating: "4.1",
    deliveryTime: 20
  },
  {
    name: "Golden Dragon Chinese",
    description: "Traditional Chinese dishes with modern flair",
    address: "Union Place, Colombo 02",
    latitude: "6.9350",
    longitude: "79.8450",
    cuisine: "Chinese",
    rating: "4.4",
    deliveryTime: 35
  },
  {
    name: "Kottu Corner",
    description: "Best kottu roti in Colombo",
    address: "Wellawatta, Colombo 06",
    latitude: "6.8750",
    longitude: "79.8650",
    cuisine: "Sri Lankan",
    rating: "4.6",
    deliveryTime: 15
  },
  {
    name: "Burger Junction",
    description: "Gourmet burgers and American favorites",
    address: "Bambalapitiya, Colombo 04",
    latitude: "6.8850",
    longitude: "79.8570",
    cuisine: "American",
    rating: "4.2",
    deliveryTime: 25
  },
  
  // Kandy Restaurants
  {
    name: "Temple View Restaurant",
    description: "Scenic dining with traditional Sri Lankan food",
    address: "Kandy Lake, Kandy",
    latitude: "7.2906",
    longitude: "80.6337",
    cuisine: "Sri Lankan",
    rating: "4.7",
    deliveryTime: 30
  },
  {
    name: "Hill Country Cafe",
    description: "Coffee, pastries and light meals",
    address: "Peradeniya Road, Kandy",
    latitude: "7.2650",
    longitude: "80.6000",
    cuisine: "Cafe",
    rating: "4.0",
    deliveryTime: 20
  },
  
  // Galle Restaurants
  {
    name: "Fort Heritage Restaurant",
    description: "Colonial charm with local and international cuisine",
    address: "Galle Fort, Galle",
    latitude: "6.0329",
    longitude: "80.2168",
    cuisine: "International",
    rating: "4.5",
    deliveryTime: 25
  },
  {
    name: "Seashore Curry House",
    description: "Coastal curries with fresh catch of the day",
    address: "Unawatuna, Galle",
    latitude: "6.0100",
    longitude: "80.2450",
    cuisine: "Sri Lankan",
    rating: "4.3",
    deliveryTime: 35
  },
  
  // Negombo Restaurants  
  {
    name: "Fish Market Grill",
    description: "Fresh fish and seafood grilled to perfection",
    address: "Beach Road, Negombo",
    latitude: "7.2084",
    longitude: "79.8380",
    cuisine: "Seafood",
    rating: "4.4",
    deliveryTime: 30
  },
  {
    name: "Airport Road Cafe",
    description: "Quick bites and coffee near the airport",
    address: "Airport Road, Negombo",
    latitude: "7.1800",
    longitude: "79.8850",
    cuisine: "Cafe",
    rating: "3.9",
    deliveryTime: 15
  }
];

export async function seedRestaurants() {
  try {
    console.log('Seeding restaurants...');
    
    // Clear existing restaurants (optional)
    // await db.delete(restaurants);
    
    // Insert sample restaurants
    for (const restaurant of sampleRestaurants) {
      await db.insert(restaurants).values(restaurant).onConflictDoNothing();
    }
    
    console.log(`✅ Successfully seeded ${sampleRestaurants.length} restaurants`);
  } catch (error) {
    console.error('Error seeding restaurants:', error);
    throw error;
  }
}

// Run seeder if called directly
if (import.meta.main) {
  seedRestaurants()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}