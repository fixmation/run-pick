import React, { useState, useEffect } from 'react';
import { MapPin, Car, Bike, Truck, Navigation, Clock, Package, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MapboxHybridMap from '@/components/maps/MapboxHybridMap';

interface ParcelDriver {
  id: number;
  name: string;
  vehicleType: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  rating: number;
  estimatedTime: string;
  phone: string;
  capacity: string;
}

interface ParcelDelivery {
  id: number;
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  driver?: ParcelDriver;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  parcelDetails: {
    weight: string;
    dimensions: string;
    fragile: boolean;
    value: string;
  };
  trackingNumber: string;
}

interface ParcelTrackingMapProps {
  parcelDrivers: ParcelDriver[];
  activeDelivery?: ParcelDelivery;
  pickupLocation?: { lat: number; lng: number; address: string };
  dropoffLocation?: { lat: number; lng: number; address: string };
  onDriverSelect?: (driver: ParcelDriver) => void;
  showTrackingRoute?: boolean;
}

const ParcelTrackingMap: React.FC<ParcelTrackingMapProps> = ({
  parcelDrivers = [],
  activeDelivery,
  pickupLocation,
  dropoffLocation,
  onDriverSelect,
  showTrackingRoute = false
}) => {
  const [nearbyDrivers, setNearbyDrivers] = useState<ParcelDriver[]>([]);
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  
  // Convert parcel drivers to compatible format
  const driversData = parcelDrivers.map(driver => ({
    id: driver.id,
    name: driver.name,
    latitude: driver.latitude,
    longitude: driver.longitude,
    vehicleType: driver.vehicleType,
    rating: driver.rating,
    isAvailable: driver.isAvailable,
    phone: driver.phone,
    estimatedArrival: parseInt(driver.estimatedTime)
  }));
  
  const handleDriverSelect = (driver: any) => {
    const parcelDriver = parcelDrivers.find(d => d.id === driver.id);
    if (parcelDriver && onDriverSelect) {
      onDriverSelect(parcelDriver);
    }
  };

  // Default to Colombo, Sri Lanka
  const defaultLocation = { lat: 6.9271, lng: 79.8612 };

  useEffect(() => {
    if (pickupLocation && parcelDrivers.length > 0) {
      // Calculate nearby drivers within 15km radius
      const nearby = parcelDrivers.filter(driver => {
        const distance = Math.sqrt(
          Math.pow(driver.latitude - pickupLocation.lat, 2) + 
          Math.pow(driver.longitude - pickupLocation.lng, 2)
        ) * 111;
        return distance <= 15 && driver.isAvailable;
      }).sort((a, b) => {
        const distanceA = Math.sqrt(
          Math.pow(a.latitude - pickupLocation.lat, 2) + 
          Math.pow(a.longitude - pickupLocation.lng, 2)
        );
        const distanceB = Math.sqrt(
          Math.pow(b.latitude - pickupLocation.lat, 2) + 
          Math.pow(b.longitude - pickupLocation.lng, 2)
        );
        return distanceA - distanceB;
      });

      setNearbyDrivers(nearby);
    }
  }, [pickupLocation, parcelDrivers]);

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      const distance = Math.sqrt(
        Math.pow(dropoffLocation.lat - pickupLocation.lat, 2) + 
        Math.pow(dropoffLocation.lng - pickupLocation.lng, 2)
      ) * 111;

      setRouteInfo({
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(distance * 3.5) // 3.5 minutes per km for parcel delivery
      });
    }
  }, [pickupLocation, dropoffLocation]);

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bike':
        return <Bike className="w-4 h-4 text-white" />;
      case 'truck':
      case 'van':
        return <Truck className="w-4 h-4 text-white" />;
      default:
        return <Car className="w-4 h-4 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-orange-100 text-orange-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'confirmed', label: 'Confirmed', completed: ['confirmed', 'picked_up', 'in_transit', 'delivered'].includes(currentStatus) },
      { key: 'picked_up', label: 'Picked Up', completed: ['picked_up', 'in_transit', 'delivered'].includes(currentStatus) },
      { key: 'in_transit', label: 'In Transit', completed: ['in_transit', 'delivered'].includes(currentStatus) },
      { key: 'delivered', label: 'Delivered', completed: currentStatus === 'delivered' }
    ];
    return steps;
  };

  return (
    <div className="space-y-6">
      {/* Accessibility Button */}
      <div className="fixed top-1/2 right-4 z-50">
        <Button onClick={() => setIsAccessibilityPanelOpen(true)} className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l7-7 3 3-7 7-3-3zM8 13l7-7M8 13l-7-7 3-3 7 7M8 13l3-3" />
          </svg>
        </Button>
      </div>

      {/* Accessibility Panel */}
      {isAccessibilityPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4">Accessibility Options</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contrast</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Normal</option>
                    <option>High Contrast</option>
                  </select>
                </div>
              </div>
              <Button onClick={() => setIsAccessibilityPanelOpen(false)} className="w-full bg-gray-500 hover:bg-gray-600 text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Parcel Tracking */}
      {activeDelivery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Live Parcel Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tracking Number */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Tracking Number</p>
                  <p className="text-lg font-mono">{activeDelivery.trackingNumber}</p>
                </div>
                <Badge className={getStatusColor(activeDelivery.status)}>
                  {activeDelivery.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Pickup Location */}
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="bg-green-500 p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pickup Location</p>
                  <p className="text-xs text-gray-600">{activeDelivery.pickupLocation.address}</p>
                </div>
              </div>

              {/* Dropoff Location */}
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="bg-red-500 p-2 rounded-full">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Location</p>
                  <p className="text-xs text-gray-600">{activeDelivery.dropoffLocation.address}</p>
                </div>
              </div>

              {/* Driver Information */}
              {activeDelivery.driver && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-500 p-2 rounded-full">
                    {getVehicleIcon(activeDelivery.driver.vehicleType)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activeDelivery.driver?.name}</p>
                    <p className="text-xs text-gray-600">
                      {activeDelivery.driver.vehicleType} • Rating: {activeDelivery.driver.rating}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${activeDelivery.driver?.phone}`, '_self')}
                  >
                    Call Driver
                  </Button>
                </div>
              )}

              {/* Delivery Progress */}
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium mb-3">Delivery Progress</p>
                <div className="space-y-2">
                  {getStatusSteps(activeDelivery.status).map((step, index) => (
                    <div key={step.key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {step.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs ${
                        step.completed ? 'text-green-700 font-medium' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parcel Details */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Parcel Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Weight:</span>
                    <span className="ml-1 font-medium">{activeDelivery.parcelDetails.weight}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="ml-1 font-medium">{activeDelivery.parcelDetails.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Value:</span>
                    <span className="ml-1 font-medium">{activeDelivery.parcelDetails.value}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fragile:</span>
                    <span className="ml-1 font-medium">
                      {activeDelivery.parcelDetails.fragile ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Parcel Tracking Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MapboxHybridMap
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            markers={[
              // Add parcel drivers
              ...driversData.map(driver => ({
                id: `driver-${driver.id}`,
                lat: driver.latitude,
                lng: driver.longitude,
                type: 'driver' as const,
                title: driver.name
              }))
            ]}
            className="w-full h-[500px]"
          />

          {/* Map Information Panel */}
          <div className="p-4 border-t space-y-3">
            {/* Route Information */}
            {routeInfo && showTrackingRoute && (
              <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 p-1 rounded-full">
                  <Navigation className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Route</p>
                  <p className="text-xs text-gray-600">
                    Distance: {routeInfo.distance} km • ETA: {routeInfo.duration} mins
                  </p>
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Pickup</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Delivery</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Drivers</span>
                </div>
              </div>
              <p>Real-time tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParcelTrackingMap;