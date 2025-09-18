import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, MessageSquare, Clock, Star } from 'lucide-react';
import MapComponent from '@/components/maps/MapComponent';

interface RideRequest {
  id: number;
  customerName: string;
  customerRating: number;
  customerPhone: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number;
  estimatedFare: number;
  estimatedTime: number;
  vehicleType: string;
  requestedAt: string;
}

interface DriverMapProps {
  driverLocation: { lat: number; lng: number };
  isOnline: boolean;
  onToggleOnline: (online: boolean) => void;
}

const DriverMap: React.FC<DriverMapProps> = ({
  driverLocation,
  isOnline,
  onToggleOnline
}) => {
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<RideRequest[]>([]);
  const [rideStatus, setRideStatus] = useState<'idle' | 'driving_to_pickup' | 'arrived' | 'in_trip' | 'completed'>('idle');

  // Mock ride requests
  const mockRequests: RideRequest[] = [
    {
      id: 1,
      customerName: 'Priya Jayawardena',
      customerRating: 4.7,
      customerPhone: '+94771234567',
      pickupLocation: {
        lat: 6.9271,
        lng: 79.8612,
        address: 'Galle Face, Colombo 03'
      },
      dropoffLocation: {
        lat: 6.9344,
        lng: 79.8487,
        address: 'Pettah, Colombo 11'
      },
      distance: 2.5,
      estimatedFare: 320,
      estimatedTime: 12,
      vehicleType: 'car',
      requestedAt: '2 mins ago'
    },
    {
      id: 2,
      customerName: 'Rohan Fernando',
      customerRating: 4.9,
      customerPhone: '+94771234568',
      pickupLocation: {
        lat: 6.9147,
        lng: 79.8736,
        address: 'Bambalapitiya, Colombo 04'
      },
      dropoffLocation: {
        lat: 6.9319,
        lng: 79.8478,
        address: 'Fort, Colombo 01'
      },
      distance: 3.2,
      estimatedFare: 410,
      estimatedTime: 15,
      vehicleType: 'car',
      requestedAt: '1 min ago'
    }
  ];

  useEffect(() => {
    if (isOnline) {
      // Simulate receiving ride requests
      const interval = setInterval(() => {
        if (Math.random() > 0.7 && incomingRequests.length < 3) {
          const randomRequest = mockRequests[Math.floor(Math.random() * mockRequests.length)];
          setIncomingRequests(prev => [...prev, { ...randomRequest, id: Date.now() }]);
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [isOnline, incomingRequests.length]);

  const handleAcceptRide = (request: RideRequest) => {
    setCurrentRide(request);
    setIncomingRequests(prev => prev.filter(req => req.id !== request.id));
    setRideStatus('driving_to_pickup');
  };

  const handleRejectRide = (requestId: number) => {
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleRideAction = () => {
    switch (rideStatus) {
      case 'driving_to_pickup':
        setRideStatus('arrived');
        break;
      case 'arrived':
        setRideStatus('in_trip');
        break;
      case 'in_trip':
        setRideStatus('completed');
        break;
      case 'completed':
        setCurrentRide(null);
        setRideStatus('idle');
        break;
    }
  };

  const getRideActionText = () => {
    switch (rideStatus) {
      case 'driving_to_pickup':
        return 'Arrived at Pickup';
      case 'arrived':
        return 'Start Trip';
      case 'in_trip':
        return 'Complete Trip';
      case 'completed':
        return 'Finish';
      default:
        return '';
    }
  };

  const getRideStatusText = () => {
    switch (rideStatus) {
      case 'driving_to_pickup':
        return 'Driving to pickup location';
      case 'arrived':
        return 'Arrived at pickup location';
      case 'in_trip':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      default:
        return 'Waiting for rides';
    }
  };

  return (
    <div className="space-y-4">
      {/* Driver Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Driver Status</span>
            <Button
              variant={isOnline ? "destructive" : "default"}
              onClick={() => onToggleOnline(!isOnline)}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            <span className="text-xs text-gray-500">• {getRideStatusText()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Ride */}
      {currentRide && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span>Current Ride</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {currentRide.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{currentRide.customerName}</h4>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{currentRide.customerRating}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>

            <MapComponent
              pickupLocation={currentRide.pickupLocation}
              dropoffLocation={currentRide.dropoffLocation}
              currentLocation={driverLocation}
              showRoute={true}
              height="200px"
            />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup:</span>
                <span>{currentRide.pickupLocation.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dropoff:</span>
                <span>{currentRide.dropoffLocation.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span>{currentRide.distance} km</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Fare:</span>
                <span className="text-green-600">₨{currentRide.estimatedFare}</span>
              </div>
            </div>

            <Button 
              onClick={handleRideAction}
              className="w-full"
              size="lg"
            >
              {getRideActionText()}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Incoming Ride Requests */}
      {!currentRide && incomingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Incoming Ride Requests</h3>
          {incomingRequests.map((request) => (
            <Card key={request.id} className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {request.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{request.customerName}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{request.customerRating}</span>
                        </div>
                        <span>• {request.requestedAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-green-600">
                      ₨{request.estimatedFare}
                    </Badge>
                    <Badge variant="outline">
                      {request.distance} km
                    </Badge>
                  </div>
                </div>

                <div className="text-sm space-y-1 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">{request.pickupLocation.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600">{request.dropoffLocation.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Est. {request.estimatedTime} mins</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleRejectRide(request.id)}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleAcceptRide(request)}
                    className="flex-1"
                  >
                    Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Driver Map */}
      {!currentRide && isOnline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Your Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapComponent
              currentLocation={driverLocation}
              height="300px"
            />
          </CardContent>
        </Card>
      )}

      {/* Waiting State */}
      {!currentRide && incomingRequests.length === 0 && isOnline && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Navigation className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Looking for rides...</h3>
              <p className="text-gray-600">
                Stay online to receive ride requests from nearby customers
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DriverMap;