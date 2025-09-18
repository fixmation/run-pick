import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Loader2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxHybridMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    type: 'driver' | 'shop' | 'vendor' | 'pickup' | 'dropoff' | 'customer';
    title?: string;
    status?: string;
  }>;
  routes?: Array<{
    coordinates: [number, number][];
    color?: string;
  }>;
  waypoints?: [number, number][]; // New prop for multi-waypoint routing
  pickupLocation?: { lat: number; lng: number; address?: string };
  dropoffLocation?: { lat: number; lng: number; address?: string };
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  className?: string;
  showGeofencing?: boolean;
}

const MapboxHybridMap = ({
  center = [79.8612, 6.9271], // Colombo, Sri Lanka
  zoom = 13,
  markers = [],
  routes = [],
  waypoints,
  pickupLocation,
  dropoffLocation,
  onMapClick,
  className = "w-full h-[400px]",
  showGeofencing = true
}: MapboxHybridMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Get Mapbox token from server
  const getMapboxToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/mapbox/token');
      if (!response.ok) {
        throw new Error(`Failed to fetch Mapbox token: ${response.status}`);
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('❌ Failed to fetch Mapbox token:', error);
      throw error;
    }
  };

  // Fetch route from server-side Geoapify endpoint (supports multiple waypoints)
  const fetchGeoapifyRoute = async (waypoints: [number, number][]) => {
    try {
      if (waypoints.length < 2) {
        throw new Error('At least 2 waypoints required for routing');
      }
      
      // Convert waypoints to lat,lng format and join with pipes
      const waypointsParam = waypoints.map(point => `${point[1]},${point[0]}`).join('|');
      
      console.log('🗺️ MULTI-WAYPOINT ROUTING DEBUG:', {
        waypointsInput: waypoints,
        waypointsCount: waypoints.length,
        waypointsParam: waypointsParam,
        formattedWaypoints: waypoints.map((point, i) => 
          `${i + 1}. lng:${point[0]}, lat:${point[1]}`
        )
      });
      
      const response = await fetch(`/api/geocode/route?waypoints=${encodeURIComponent(waypointsParam)}`);
      
      if (!response.ok) {
        throw new Error(`Server routing failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🛣️ Route response received:', { hasSuccess: 'success' in data, hasFeatures: 'features' in data, featuresLength: data.features?.length });
      
      const features = data.features || data?.data?.features;
      if (features && features.length > 0) {
        const feature = features[0];
        const geom = feature?.geometry;
        console.log('🛣️ Geometry type:', geom?.type, 'Coordinates length:', geom?.coordinates?.length);
        
        let coords: [number, number][] = [];
        if (geom?.type === 'LineString') {
          coords = geom.coordinates;
        } else if (geom?.type === 'MultiLineString') {
          coords = geom.coordinates.flat();
        }
        
        if (coords && coords.length > 0) {
          console.log('✅ Route coordinates found, rendering route with', coords.length, 'points');
          return coords.map((coord: [number, number]) => [coord[0], coord[1]] as [number, number]);
        }
      }
      console.log('❌ No valid route coordinates found in response');
      return null;
    } catch (error) {
      console.error('❌ Server routing error:', error);
      return null;
    }
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current || map.current) return;

      try {
        console.log('🗺️ Initializing Mapbox hybrid map...');
        
        // Get Mapbox token
        const token = await getMapboxToken();
        mapboxgl.accessToken = token;

        // Check WebGL support
        if (!mapboxgl.supported()) {
          throw new Error('WebGL not supported');
        }

        // Create map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: zoom,
          attributionControl: false
        });

        // Add attribution
        map.current.addControl(new mapboxgl.AttributionControl({
          compact: true
        }));

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl());

        // Handle map click
        if (onMapClick) {
          map.current.on('click', (e) => {
            onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          });
        }

        map.current.on('load', () => {
          console.log('✅ Mapbox map loaded successfully');
          setLoading(false);
        });

        map.current.on('error', (e) => {
          console.error('❌ Mapbox error:', e);
          setError(e.error?.message || 'Map failed to load');
          setLoading(false);
        });

      } catch (error) {
        console.error('❌ Failed to initialize Mapbox map:', error);
        setError((error as Error).message);
        setLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current || loading) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    [...markers, 
     ...(pickupLocation ? [{ id: 'pickup', lat: pickupLocation.lat, lng: pickupLocation.lng, type: 'pickup' as const, title: 'Pickup Location' }] : []),
     ...(dropoffLocation ? [{ id: 'dropoff', lat: dropoffLocation.lat, lng: dropoffLocation.lng, type: 'dropoff' as const, title: 'Drop-off Location' }] : [])
    ].forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Set marker style based on type
      const markerStyles = {
        driver: { backgroundColor: '#10b981', emoji: '🚗' },
        shop: { backgroundColor: '#f59e0b', emoji: '🏪' },
        vendor: { backgroundColor: '#8b5cf6', emoji: '🏬' },
        pickup: { backgroundColor: '#3b82f6', emoji: '📍' },
        dropoff: { backgroundColor: '#ef4444', emoji: '🎯' },
        customer: { backgroundColor: '#06b6d4', emoji: '👤' }
      };
      
      const style = markerStyles[marker.type];
      el.innerHTML = `
        <div style="
          background: ${style.backgroundColor};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${style.emoji}</div>
      `;

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current!);

      // Add popup if title provided
      if (marker.title) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setText(marker.title);
        mapboxMarker.setPopup(popup);
      }

      markersRef.current[marker.id] = mapboxMarker;
    });
  }, [markers, pickupLocation, dropoffLocation, loading]);

  // Update routes
  useEffect(() => {
    if (!map.current || loading) return;

    const updateRoutes = async () => {
      // Remove existing route sources and layers
      const existingLayers = map.current!.getStyle().layers || [];
      existingLayers.forEach(layer => {
        if (layer.id.startsWith('route') || layer.id === 'auto-route') {
          map.current!.removeLayer(layer.id);
        }
      });
      
      // Remove existing sources
      ['route', 'auto-route'].forEach(sourceId => {
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      });
      
      // Remove numbered route sources
      for (let i = 0; i < 10; i++) {
        const sourceId = `route-${i}`;
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      }

      // Add routes from props
      if (routes.length > 0) {
        routes.forEach((route, index) => {
          const sourceId = `route-${index}`;
          const layerId = `route-${index}`;

          if (!map.current!.getSource(sourceId)) {
            map.current!.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: route.coordinates
                }
              }
            });

            map.current!.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': route.color || '#8b5cf6', // Dark violet as default
                'line-width': 4
              }
            });
          }
        });
      }

      // Auto-fetch route if pickup and dropoff are provided
      if (pickupLocation && dropoffLocation) {
        try {
          const routeCoordinates = await fetchGeoapifyRoute([
            [pickupLocation.lng, pickupLocation.lat],
            [dropoffLocation.lng, dropoffLocation.lat]
          ]);

          if (routeCoordinates && map.current) {
            // Add the auto-route source and layer
            map.current.addSource('auto-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates
                }
              }
            });

            map.current.addLayer({
              id: 'auto-route',
              type: 'line',
              source: 'auto-route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#8b5cf6', // Dark violet
                'line-width': 5,
                'line-opacity': 0.8
              }
            });

            // Fit bounds to show the route
            const bounds = new mapboxgl.LngLatBounds();
            routeCoordinates.forEach((coord: [number, number]) => bounds.extend(coord));
            map.current.fitBounds(bounds, { padding: 50 });
          }
        } catch (error) {
          console.error('❌ Failed to fetch route:', error);
        }
      }
    };

    updateRoutes();
  }, [routes, pickupLocation, dropoffLocation, loading]);

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg border`}>
        <div className="text-center text-red-600">
          <p className="font-medium">Map Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapboxHybridMap;