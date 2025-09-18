import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Car, Bike, Truck, Navigation, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getGeoapifyKey } from '@/config/env';

interface Driver {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  vehicleType: string;
  rating: number;
  isAvailable: boolean;
  vehicleNumber?: string;
  vehicleColor?: string;
  phone?: string;
  estimatedArrival?: number;
  distance?: number;
}

interface MapComponentProps {
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  drivers?: Driver[];
  onDriverSelect?: (driver: Driver) => void;
  showRoute?: boolean;
  currentLocation?: { lat: number; lng: number };
  height?: string;
  routeColor?: string;
  refreshKey?: string | number; // For triggering map resize on visibility changes
}

const MapComponent: React.FC<MapComponentProps> = ({
  pickupLocation,
  dropoffLocation,
  drivers = [],
  onDriverSelect,
  showRoute = false,
  currentLocation,
  height = "400px",
  routeColor = "#6b46c1",
  refreshKey
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [geoapifyKey, setGeoapifyKey] = useState<string>('');
  const markers = useRef<maplibregl.Marker[]>([]);
  const hasInitializedRef = useRef(false);
  const hasDestroyedRef = useRef(false);

  // Default to Colombo, Sri Lanka if no locations provided
  const defaultLocation = { lat: 6.9271, lng: 79.8612 };

  // Clear all markers
  const clearMarkers = useCallback(() => {
    try {
      markers.current.forEach(marker => {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      });
      markers.current = [];
    } catch (error) {
      console.warn('Error clearing markers:', error);
      markers.current = [];
    }
  }, []);

  // Add marker to map
  const addMarker = useCallback((lng: number, lat: number, color: string = '#e11d48', className: string = '') => {
    if (!map.current) return null;

    const marker = new maplibregl.Marker({ color })
      .setLngLat([lng, lat])
      .addTo(map.current);

    if (className) {
      const element = marker.getElement();
      element.className += ` ${className}`;
    }

    markers.current.push(marker);
    return marker;
  }, []);

  // Get route from server-side Geoapify Routing API
  const fetchRoute = useCallback(async (from: [number, number], to: [number, number]) => {
    try {
      const url = `/api/geocode/route?from=${from[1]},${from[0]}&to=${to[1]},${to[0]}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.features && data.features.length > 0) {
        const route = data.features[0];
        const distance = Math.round(route.properties.distance / 1000 * 100) / 100; // Convert to km
        const duration = Math.round(route.properties.time / 60); // Convert to minutes
        
        return {
          route: route.geometry,
          distance,
          duration
        };
      }
    } catch (error) {
      console.error('❌ Geoapify routing error:', error);
    }
    return null;
  }, []);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || hasInitializedRef.current) return; // Prevent double initialization

      hasInitializedRef.current = true;

      try {
        console.log('🗺️ Initializing map...');
        
        // Check WebGL support manually
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          console.warn('⚠️ WebGL not supported - map disabled');
          return;
        }

        // Wait for container to be visible and have non-zero dimensions
        const waitForVisibleContainer = () => {
          return new Promise<boolean>((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // ~500ms
            
            const checkSize = () => {
              if (!mapContainer.current) {
                resolve(false);
                return;
              }
              
              const rect = mapContainer.current.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                console.log(`📐 Container ready: ${rect.width}x${rect.height}`);
                resolve(true);
                return;
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                console.warn(`⚠️ Container still zero-sized after ${maxAttempts * 10}ms`);
                resolve(false);
                return;
              }
              
              requestAnimationFrame(checkSize);
            };
            
            checkSize();
          });
        };
        
        const isContainerReady = await waitForVisibleContainer();
        if (!isContainerReady) {
          console.warn('⚠️ Container not ready for map initialization');
          return;
        }
        
        const apiKey = await getGeoapifyKey();
        setGeoapifyKey(apiKey || '');

        // Use ONLY Geoapify maps - no fallbacks
        if (!apiKey) {
          console.error('❌ Geoapify API key required - cannot initialize map');
          return;
        }

        // Use Geoapify style directly without preflight check
        const mapStyle = `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${apiKey}`;
        console.log('✅ Using Geoapify map style');

        // Create map with fallback-safe options
        const mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: mapStyle,
          center: [79.8612, 6.9271], // Colombo, Sri Lanka
          zoom: 12,
          attributionControl: false,
          antialias: false, // Safer GL option
          failIfMajorPerformanceCaveat: false, // Safer GL option
          trackResize: true // Better resize handling
        });

        // Set map reference immediately
        map.current = mapInstance;
        
        // Add WebGL context error logging
        mapInstance.getCanvas().addEventListener('webglcontextcreationerror', (e) => {
          console.error('❌ WebGL context creation failed:', e);
        });

        // Add Geoapify attribution
        const attribution = '🗺️ Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
        
        mapInstance.addControl(new maplibregl.AttributionControl({
          customAttribution: attribution
        }));

        // Add navigation controls
        mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

        mapInstance.on('load', () => {
          console.log('✅ Map loaded successfully using Geoapify');
          
          // Add geolocate control safely after load
          try {
            mapInstance.addControl(
              new maplibregl.GeolocateControl({
                positionOptions: {
                  enableHighAccuracy: true
                },
                trackUserLocation: true
              }),
              'top-right'
            );
          } catch (error) {
            console.warn('⚠️ Could not add geolocate control:', error);
          }
          
          // Ensure proper sizing after load
          setTimeout(() => {
            mapInstance.resize();
          }, 100);
          
          setIsMapLoaded(true);
        });

        mapInstance.on('error', (e) => {
          // Better error logging to bypass devtools stringify failure
          console.error('❌ Geoapify map error:', e?.error?.message || e?.message || 'Unknown error');
          if (e?.error?.stack) {
            console.error('Stack trace:', e.error.stack);
          }
        });

      } catch (error) {
        console.error('Failed to initialize Geoapify map:', error);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (hasDestroyedRef.current) return; // Prevent double cleanup
      hasDestroyedRef.current = true;
      
      try {
        if (map.current) {
          console.log('🧹 Cleaning up map...');
          clearMarkers();
          if (typeof map.current.remove === 'function') {
            map.current.remove();
          }
          map.current = null;
          setIsMapLoaded(false);
        }
      } catch (error) {
        console.warn('Error during map cleanup:', error);
        map.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []); // Empty dependency array to prevent cleanup loop

  // Handle refreshKey changes for map resize
  useEffect(() => {
    if (!map.current || !isMapLoaded || !refreshKey) return;
    
    const resizeMap = () => {
      try {
        map.current?.resize();
        console.log('🔄 Map resized for visibility change');
      } catch (error) {
        console.warn('Error resizing map:', error);
      }
    };

    // Small delay to ensure container is fully visible
    const timeoutId = setTimeout(resizeMap, 100);
    return () => clearTimeout(timeoutId);
  }, [refreshKey, isMapLoaded]);

  // Update map center when locations change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const centerLocation = pickupLocation || currentLocation || defaultLocation;
    map.current.flyTo({
      center: [centerLocation.lng, centerLocation.lat],
      zoom: 14,
      duration: 1000
    });
  }, [pickupLocation, currentLocation, isMapLoaded]);

  // Add markers for locations
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    clearMarkers();

    // Add pickup location marker
    if (pickupLocation) {
      addMarker(pickupLocation.lng, pickupLocation.lat, '#10b981', 'pickup-marker');
    }

    // Add dropoff location marker
    if (dropoffLocation) {
      addMarker(dropoffLocation.lng, dropoffLocation.lat, '#ef4444', 'dropoff-marker');
    }

    // Add current location marker
    if (currentLocation) {
      addMarker(currentLocation.lng, currentLocation.lat, '#3b82f6', 'current-location-marker');
    }

    // Add driver markers
    drivers.forEach((driver, index) => {
      const marker = addMarker(driver.longitude, driver.latitude, '#8b5cf6', 'driver-marker');
      
      if (marker && onDriverSelect) {
        marker.getElement().addEventListener('click', () => {
          onDriverSelect(driver);
        });
        marker.getElement().style.cursor = 'pointer';
      }
    });

  }, [pickupLocation, dropoffLocation, currentLocation, drivers, isMapLoaded, addMarker, clearMarkers, onDriverSelect]);

  // Add route when requested
  useEffect(() => {
    if (!map.current || !isMapLoaded || !showRoute || !pickupLocation || !dropoffLocation) return;

    const addRoute = async () => {
      const routeData = await fetchRoute(
        [pickupLocation.lng, pickupLocation.lat],
        [dropoffLocation.lng, dropoffLocation.lat]
      );

      if (routeData && map.current) {
        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration
        });

        // Add route line to map
        if (map.current.getSource('route')) {
          map.current.removeLayer('route-line');
          map.current.removeSource('route');
        }

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeData.route
          }
        });

        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routeColor,
            'line-width': 4
          }
        });

        // Fit map to route bounds
        const coordinates = routeData.route.coordinates;
        const bounds = coordinates.reduce((bounds: maplibregl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, { padding: 50 });
      }
    };

    addRoute();
  }, [showRoute, pickupLocation, dropoffLocation, routeColor, isMapLoaded, fetchRoute]);

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'bike':
      case 'motorbike':
        return <Bike className="w-3 h-3" />;
      case 'car':
        return <Car className="w-3 h-3" />;
      case 'van':
      case 'truck':
        return <Truck className="w-3 h-3" />;
      default:
        return <Car className="w-3 h-3" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <div 
              ref={mapContainer} 
              style={{ height }} 
              className="w-full"
            />
            
            {/* Loading overlay */}
            {!isMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading map...</p>
                </div>
              </div>
            )}

            {/* Route info overlay */}
            {routeInfo && showRoute && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">
                      Route Details
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {routeInfo.distance} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {routeInfo.duration} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drivers list overlay */}
            {drivers.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Available Drivers ({drivers.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {drivers.slice(0, 3).map((driver) => (
                        <Button
                          key={driver.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => onDriverSelect?.(driver)}
                          className="w-full justify-between p-2 h-auto"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {getVehicleIcon(driver.vehicleType)}
                              <span className="font-medium text-sm">{driver.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              ⭐ {driver.rating}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {driver.estimatedArrival && `${driver.estimatedArrival}min`}
                            {driver.distance && ` • ${driver.distance}km`}
                          </div>
                        </Button>
                      ))}
                      {drivers.length > 3 && (
                        <div className="text-xs text-center text-gray-500">
                          +{drivers.length - 3} more drivers available
                        </div>
                      )}
                    </div>
                    
                    {/* Map legend */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span>Pickup</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Dropoff</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Drivers</span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-1">
                        🗺️ Better Sri Lankan Roads • Powered by Geoapify
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapComponent;