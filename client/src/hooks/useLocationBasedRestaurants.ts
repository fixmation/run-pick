import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Restaurant } from '@shared/schema';

interface LocationBasedRestaurantsOptions {
  userLatitude?: number;
  userLongitude?: number;
  radius?: number; // in kilometers, default 10km
  autoFilter?: boolean; // automatically filter when location is available
}

interface RestaurantWithDistance extends Restaurant {
  distance?: number;
  estimatedDeliveryTime?: number;
}

interface RestaurantsResponse {
  restaurants: Restaurant[];
  filtered: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export const useLocationBasedRestaurants = ({
  userLatitude,
  userLongitude,
  radius = 10,
  autoFilter = true
}: LocationBasedRestaurantsOptions = {}) => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDistance[]>([]);

  // Query for location-filtered restaurants
  const {
    data: locationFilteredData,
    isLoading: isLocationFilteredLoading,
    error: locationFilteredError,
    refetch: refetchLocationFiltered
  } = useQuery<RestaurantsResponse>({
    queryKey: ['/api/food/restaurants', { latitude: userLatitude, longitude: userLongitude, radius }],
    enabled: Boolean(userLatitude && userLongitude && autoFilter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for all restaurants (fallback)
  const {
    data: allRestaurantsData,
    isLoading: isAllRestaurantsLoading,
    error: allRestaurantsError,
    refetch: refetchAllRestaurants
  } = useQuery<RestaurantsResponse>({
    queryKey: ['/api/food/restaurants'],
    enabled: !autoFilter || !userLatitude || !userLongitude,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate distance and estimated delivery time for restaurants
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Process restaurant data with distance calculations
  useEffect(() => {
    let restaurantData: Restaurant[] = [];
    let isFiltered = false;

    if (locationFilteredData?.restaurants) {
      restaurantData = locationFilteredData.restaurants;
      isFiltered = locationFilteredData.filtered || false;
    } else if (allRestaurantsData?.restaurants) {
      restaurantData = allRestaurantsData.restaurants;
    }

    const processedRestaurants: RestaurantWithDistance[] = restaurantData.map(restaurant => {
      let distance: number | undefined;
      let estimatedDeliveryTime: number | undefined;

      if (userLatitude && userLongitude && restaurant.latitude && restaurant.longitude) {
        distance = calculateDistance(
          userLatitude,
          userLongitude,
          parseFloat(restaurant.latitude),
          parseFloat(restaurant.longitude)
        );
        
        // Estimate delivery time: base delivery time + travel time (assuming 25km/h average speed)
        const baseDeliveryTime = restaurant.deliveryTime || 30;
        const travelTimeMinutes = Math.round((distance / 25) * 60); // Convert hours to minutes
        estimatedDeliveryTime = baseDeliveryTime + travelTimeMinutes;
      }

      return {
        ...restaurant,
        distance,
        estimatedDeliveryTime
      };
    });

    // Apply client-side radius filtering if location is available and server didn't filter
    let finalRestaurants = processedRestaurants;
    if (userLatitude && userLongitude && !isFiltered && autoFilter) {
      finalRestaurants = processedRestaurants.filter(restaurant => 
        restaurant.distance === undefined || restaurant.distance <= radius
      );
    }

    // Sort by distance if location is available, otherwise by rating
    const sortedRestaurants = finalRestaurants.sort((a, b) => {
      if (userLatitude && userLongitude && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance; // Closest first
      } else {
        // Sort by rating (highest first)
        const ratingA = parseFloat(a.rating || '0');
        const ratingB = parseFloat(b.rating || '0');
        return ratingB - ratingA;
      }
    });

    setRestaurants(sortedRestaurants);
    setFilteredRestaurants(sortedRestaurants);
  }, [locationFilteredData, allRestaurantsData, userLatitude, userLongitude]);

  // Filter restaurants by search query or cuisine
  const filterRestaurants = (searchQuery: string = '', cuisine: string = 'all') => {
    let filtered = [...restaurants];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine?.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query)
      );
    }

    if (cuisine && cuisine !== 'all') {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisine?.toLowerCase() === cuisine.toLowerCase()
      );
    }

    setFilteredRestaurants(filtered);
  };

  // Manual location filtering for when coordinates are provided later
  const filterByLocation = async (latitude: number, longitude: number, radiusKm: number = 10) => {
    try {
      const response = await fetch(`/api/food/restaurants?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm}`);
      const data = await response.json();
      
      if (data.restaurants) {
        const processedRestaurants: RestaurantWithDistance[] = data.restaurants.map((restaurant: Restaurant) => {
          const distance = calculateDistance(latitude, longitude, parseFloat(restaurant.latitude || '0'), parseFloat(restaurant.longitude || '0'));
          const baseDeliveryTime = restaurant.deliveryTime || 30;
          const travelTimeMinutes = Math.round((distance / 25) * 60);
          const estimatedDeliveryTime = baseDeliveryTime + travelTimeMinutes;

          return {
            ...restaurant,
            distance,
            estimatedDeliveryTime
          };
        });

        setRestaurants(processedRestaurants);
        setFilteredRestaurants(processedRestaurants);
      }
    } catch (error) {
      console.error('Error filtering restaurants by location:', error);
    }
  };

  const isLoading = isLocationFilteredLoading || isAllRestaurantsLoading;
  const error = locationFilteredError || allRestaurantsError;

  return {
    restaurants,
    filteredRestaurants,
    isLoading,
    error,
    filterRestaurants,
    filterByLocation,
    refetch: userLatitude && userLongitude ? refetchLocationFiltered : refetchAllRestaurants,
    isLocationFiltered: Boolean(userLatitude && userLongitude && locationFilteredData?.filtered)
  };
};

export default useLocationBasedRestaurants;