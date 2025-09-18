import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  Star, 
  Phone, 
  MessageSquare, 
  CreditCard, 
  Banknote,
  X,
  ArrowLeft,
  Loader2,
  Search,
  UserCheck,
  Plus
} from 'lucide-react';
import MapboxHybridMap from '@/components/maps/MapboxHybridMap';
import LocationAutocomplete, { type SelectedLocation } from '@/components/common/LocationAutocomplete';
import VehicleSelector from '@/components/ride/VehicleSelector';
import LorryVehicleSelector from '@/components/ride/LorryVehicleSelector';
import { RideChatButton } from '@/components/ride/RideChatButton';
import { useToast } from '@/hooks/use-toast';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingAuth from '@/components/auth/OnboardingAuth';
import EmailOtpModal from '@/components/auth/EmailOtpModal';
import { getDistance } from 'geolib';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Driver {
  id: number;
  name: string;
  rating: number;
  vehicleType: string;
  vehicleNumber: string;
  vehicleColor: string;
  phone: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  estimatedArrival: number;
  distance?: number;
}


interface ProductionRideBookingProps {
  vehicleFilter?: 'car' | 'lorry';
}

const ProductionRideBooking: React.FC<ProductionRideBookingProps> = ({ vehicleFilter = 'car' }) => {
  // Core booking state
  const [bookingStep, setBookingStep] = useState<'location' | 'vehicle' | 'driver' | 'confirm' | 'tracking'>('location');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [isMultiStopEnabled, setIsMultiStopEnabled] = useState<boolean>(false);
  const [waypoints, setWaypoints] = useState<Location[]>([]);
  const [waypointSearches, setWaypointSearches] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'token'>('cash');
  const [remark, setRemark] = useState<string>('');
  
  // Booking state management
  const [isBooking, setIsBooking] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customerData, setCustomerData] = useState<{ email: string; name: string } | null>(null);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  
  // Chat state
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const handleUnreadMessageUpdate = (count: number) => {
    setUnreadMessageCount(count);
  };
  
  // Location search state
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
  
  // Route and fare info
  const [distance, setDistance] = useState<number>(0);
  const [estimatedFare, setEstimatedFare] = useState<number>(1000);
  const [estimatedTime, setEstimatedTime] = useState<number>(3);
  const [isColumboArea, setIsColumboArea] = useState<boolean>(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { announce, handleKeyNavigation, focusElement } = useAccessibility({
    announceSteps: true,
    keyboardNavigation: true
  });

  // Vehicle types for fare calculation (matching VehicleSelector)
  const vehicleTypes = [
    { id: 'threewheeler', baseFareColumbo: 315, baseFareOther: 240, pricePerKm: 80 },
    { id: 'bike', baseFareColumbo: 198, baseFareOther: 150, pricePerKm: 80 },
    { id: 'mini_car', baseFareColumbo: 450, baseFareOther: 370, pricePerKm: 80 },
    { id: 'flex_car', baseFareColumbo: 400, baseFareOther: 350, pricePerKm: 80 },
    { id: 'car', baseFareColumbo: 590, baseFareOther: 550, pricePerKm: 80 },
    { id: 'mini_van', baseFareColumbo: 690, baseFareOther: 650, pricePerKm: 80 },
    { id: 'van', baseFareColumbo: 2300, baseFareOther: 2100, pricePerKm: 80 }
  ];

  // Lorry vehicle types for fare calculation (from provided rates)
  const lorryVehicleTypes = [
    { id: 'lorry_light', baseFare: 1821.68, pricePerKm: 121.10 },
    { id: 'light_open', baseFare: 1821.68, pricePerKm: 121.10 },
    { id: 'mover', baseFare: 4045.88, pricePerKm: 185.86 },
    { id: 'mover_open', baseFare: 4045.88, pricePerKm: 185.86 },
    { id: 'mover_plus', baseFare: 7790.08, pricePerKm: 266.98 },
    { id: 'mover_plus_open', baseFare: 7790.08, pricePerKm: 266.98 }
  ];

  // Calculate fare for selected vehicle
  const calculateSelectedVehicleFare = () => {
    if (!selectedVehicle) return null; // No fare until vehicle selected
    
    if (vehicleFilter === 'lorry') {
      // Lorry fare calculation
      const lorryVehicle = lorryVehicleTypes.find(v => v.id === selectedVehicle);
      if (!lorryVehicle) return null;
      
      if (distance <= 1) {
        return Math.round(lorryVehicle.baseFare);
      } else {
        const additionalDistance = distance - 1;
        return Math.round(lorryVehicle.baseFare + (additionalDistance * lorryVehicle.pricePerKm));
      }
    } else {
      // Regular taxi fare calculation
      const vehicle = vehicleTypes.find(v => v.id === selectedVehicle);
      if (!vehicle) return null;
      
      const baseFare = isColumboArea ? vehicle.baseFareColumbo : vehicle.baseFareOther;
      
      if (distance <= 1) {
        return Math.round(baseFare);
      } else {
        const additionalDistance = distance - 1;
        return Math.round(baseFare + (additionalDistance * vehicle.pricePerKm));
      }
    }
  };






  // Check if location is in Colombo area
  const checkColumboArea = (location: Location) => {
    // Colombo district coordinates (approximate bounds)
    const colomboBounds = {
      north: 7.2,
      south: 6.8,
      east: 80.0,
      west: 79.8
    };
    
    return location.lat >= colomboBounds.south && 
           location.lat <= colomboBounds.north && 
           location.lng >= colomboBounds.west && 
           location.lng <= colomboBounds.east;
  };

  // Calculate distance and fare
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      if (isMultiStopEnabled && waypoints.some(w => w.address)) {
        // Multi-waypoint route calculation
        calculateMultiWaypointDistance();
      } else {
        // Simple A-to-B calculation
        const distanceInMeters = getDistance(
          { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
          { latitude: dropoffLocation.lat, longitude: dropoffLocation.lng }
        );
        const distanceInKm = distanceInMeters / 1000;
        setDistance(distanceInKm);
        
        // Check if pickup location is in Colombo area
        setIsColumboArea(checkColumboArea(pickupLocation));
        
        // Calculate estimated time (3 min per km)
        setEstimatedTime(Math.max(3, Math.round(distanceInKm * 3)));
      }
    }
  }, [pickupLocation, dropoffLocation, isMultiStopEnabled, waypoints]);

  // Calculate multi-waypoint distance using routing API
  const calculateMultiWaypointDistance = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    try {
      const validWaypoints = waypoints.filter(w => w.address && w.lat && w.lng);
      const allPoints = [pickupLocation, ...validWaypoints, dropoffLocation];
      
      if (allPoints.length < 2) return;

      const waypointsParam = allPoints
        .map(point => `${point.lat},${point.lng}`)
        .join('|');

      const response = await fetch(`/api/geocode/route?waypoints=${waypointsParam}`);
      if (!response.ok) {
        throw new Error('Routing failed');
      }

      const data = await response.json();
      if (data.success && data.features && data.features.length > 0) {
        const route = data.features[0];
        const distanceInMeters = route.properties?.distance || 0;
        const durationInSeconds = route.properties?.duration || 0;
        
        const distanceInKm = distanceInMeters / 1000;
        const durationInMinutes = Math.round(durationInSeconds / 60);

        setDistance(distanceInKm);
        setEstimatedTime(Math.max(3, durationInMinutes));
        
        // Check if pickup location is in Colombo area
        setIsColumboArea(checkColumboArea(pickupLocation));
      }
    } catch (error) {
      console.warn('Multi-waypoint routing failed, falling back to direct distance:', error);
      // Fallback to direct distance calculation
      const distanceInMeters = getDistance(
        { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
        { latitude: dropoffLocation.lat, longitude: dropoffLocation.lng }
      );
      const distanceInKm = distanceInMeters / 1000;
      setDistance(distanceInKm);
      setEstimatedTime(Math.max(3, Math.round(distanceInKm * 3)));
      setIsColumboArea(checkColumboArea(pickupLocation));
    }
  };

  // Find nearby drivers
  const findNearbyDrivers = async () => {
    if (!pickupLocation || !selectedVehicle) return;

    setIsLoadingDrivers(true);
    
    try {
      // Mock driver data - in production, fetch from API
      const mockDrivers: Driver[] = [
        {
          id: 1,
          name: 'Kasun Perera',
          rating: 4.8,
          vehicleType: selectedVehicle,
          vehicleNumber: 'ABC-1234',
          vehicleColor: 'Blue',
          phone: '+94771234567',
          latitude: pickupLocation.lat + (Math.random() - 0.5) * 0.01,
          longitude: pickupLocation.lng + (Math.random() - 0.5) * 0.01,
          isAvailable: true,
          estimatedArrival: 3
        },
        {
          id: 2,
          name: 'Nimal Silva',
          rating: 4.6,
          vehicleType: selectedVehicle,
          vehicleNumber: 'DEF-5678',
          vehicleColor: 'Red',
          phone: '+94771234568',
          latitude: pickupLocation.lat + (Math.random() - 0.5) * 0.01,
          longitude: pickupLocation.lng + (Math.random() - 0.5) * 0.01,
          isAvailable: true,
          estimatedArrival: 5
        },
        {
          id: 3,
          name: 'Suresh Fernando',
          rating: 4.9,
          vehicleType: selectedVehicle,
          vehicleNumber: 'GHI-9012',
          vehicleColor: 'Yellow',
          phone: '+94771234569',
          latitude: pickupLocation.lat + (Math.random() - 0.5) * 0.01,
          longitude: pickupLocation.lng + (Math.random() - 0.5) * 0.01,
          isAvailable: true,
          estimatedArrival: 2
        }
      ];

      // Calculate distances
      const driversWithDistance = mockDrivers.map(driver => ({
        ...driver,
        distance: getDistance(
          { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
          { latitude: driver.latitude, longitude: driver.longitude }
        ) / 1000
      })).sort((a, b) => a.distance - b.distance);

      setNearbyDrivers(driversWithDistance);
    } catch (error) {
      toast({
        title: "Error finding drivers",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  // Handle booking confirmation with authentication check first
  const handleBookRide = async () => {
    if (!selectedDriver || !pickupLocation || !dropoffLocation) return;

    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If user is authenticated, proceed with booking
    await proceedWithBooking();
  };

  // Actual booking logic after email verification
  const proceedWithBooking = async () => {
    if (!selectedDriver || !pickupLocation || !dropoffLocation) return;
    
    setIsBooking(true);
    
    try {
      // Real API call to book the ride
      const bookingData = {
        pickupLocation: pickupLocation.address,
        pickupLatitude: pickupLocation.lat.toString(),
        pickupLongitude: pickupLocation.lng.toString(),
        dropoffLocation: dropoffLocation.address,
        dropoffLatitude: dropoffLocation.lat.toString(),
        dropoffLongitude: dropoffLocation.lng.toString(),
        vehicleType: selectedVehicle,
        paymentMethod,
        remarks: remark,
        // Multi-stop data
        isMultiStop: isMultiStopEnabled,
        waypoints: isMultiStopEnabled ? waypoints.filter(w => w.address).map(w => ({
          address: w.address,
          latitude: w.lat.toString(),
          longitude: w.lng.toString()
        })) : []
      };

      const response = await fetch('/api/rides/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...bookingData,
          customerEmail: customerData?.email,
          customerName: customerData?.name
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication error gracefully
          toast({
            title: "Authentication Required",
            description: "Please sign in to book a ride. Creating demo booking for now...",
            variant: "destructive"
          });
          // Simulate successful booking for demo purposes
          setTimeout(() => {
            setBookingStep('tracking');
            setBookingId('DEMO_' + Date.now());
            toast({
              title: "Demo Booking Created",
              description: "This is a demo booking. In production, please ensure you're logged in.",
            });
          }, 2000);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }

      const result = await response.json();
      const rideId = result.ride.id.toString();
      setBookingId(rideId);
      setBookingStep('tracking');
      
      // Initialize chat room if driver is selected
      if (selectedDriver) {
        await initializeChatRoom(rideId, selectedDriver.id);
      }
      
      toast({
        title: "Ride Booked Successfully!",
        description: `Booking ID: ${result.ride.id}. Your driver will be assigned shortly.`,
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Create or get chat room after successful booking
  const initializeChatRoom = async (rideId: string, driverId: number) => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customerId: user?.id,
          driverId: driverId,
          orderId: parseInt(rideId),
          serviceType: 'taxi',
          status: 'active'
        })
      });

      if (response.ok) {
        const chatRoom = await response.json();
        setChatRoomId(chatRoom.id);
        console.log('✅ Chat room initialized:', chatRoom.id);
      } else {
        console.warn('⚠️ Failed to create chat room:', response.status);
      }
    } catch (error) {
      console.error('❌ Chat room initialization error:', error);
    }
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!bookingId) return;

    try {
      // Mock API call for cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset state
      setBookingStep('location');
      setBookingId(null);
      setSelectedDriver(null);
      setSelectedVehicle('');
      setPickupLocation(null);
      setDropoffLocation(null);
      setPickupSearch('');
      setDropoffSearch('');
      setRemark('');
      
      toast({
        title: "Booking Cancelled",
        description: "Your ride has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get current location
  const getCurrentLocationForPickup = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your location manually.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLoc: Location = {
          lat: latitude,
          lng: longitude,
          address: "Current Location"
        };
        setPickupLocation(currentLoc);
        setPickupSearch("Current Location");
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your current location.",
          variant: "destructive"
        });
      }
    );
  };

  // Handle location selection from autocomplete
  const handlePickupLocationSelect = (location: SelectedLocation) => {
    setPickupLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.address
    });
  };

  const handleDropoffLocationSelect = (location: SelectedLocation) => {
    setDropoffLocation({
      lat: location.lat,
      lng: location.lng,
      address: location.address
    });
  };

  // Multi-stop waypoint management
  const addWaypoint = () => {
    setWaypoints([...waypoints, { lat: 0, lng: 0, address: '' }]);
    setWaypointSearches([...waypointSearches, '']);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
    setWaypointSearches(waypointSearches.filter((_, i) => i !== index));
  };

  const handleWaypointLocationSelect = (index: number, location: SelectedLocation) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = {
      lat: location.lat,
      lng: location.lng,
      address: location.address
    };
    setWaypoints(newWaypoints);
  };

  const handleWaypointSearchChange = (index: number, value: string) => {
    const newSearches = [...waypointSearches];
    newSearches[index] = value;
    setWaypointSearches(newSearches);
  };

  const toggleMultiStop = () => {
    setIsMultiStopEnabled(!isMultiStopEnabled);
    if (!isMultiStopEnabled) {
      // Clear waypoints when enabling multi-stop
      setWaypoints([]);
      setWaypointSearches([]);
    }
  };

  // Announce step changes
  useEffect(() => {
    switch (bookingStep) {
      case 'location':
        announce('Step 1 of 4: Set pickup and drop-off locations');
        break;
      case 'vehicle':
        announce('Step 2 of 4: Choose your vehicle type');
        break;
      case 'driver':
        announce('Step 3 of 4: Select your driver');
        break;
      case 'confirm':
        announce('Step 4 of 4: Confirm your booking details');
        break;
      case 'tracking':
        announce('Booking confirmed! Track your ride');
        break;
    }
  }, [bookingStep, announce]);

  // Location Step Component
  const renderLocationStep = () => (
    <div className="space-y-6" id="main-content" role="main" aria-labelledby="location-heading">
      <div className="text-center mb-6">
        <h2 id="location-heading" className="text-xl font-bold mb-2">Where to?</h2>
        <p className="text-gray-600 text-sm" aria-describedby="location-heading">Set your pickup and drop-off locations</p>
      </div>

      {/* Multi-Stop Toggle */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 text-sm mb-1">Multi-Stop Booking</h3>
              <p className="text-xs text-blue-700">Add multiple stops to your journey</p>
            </div>
            <Switch
              checked={isMultiStopEnabled}
              onCheckedChange={toggleMultiStop}
              data-testid="toggle-multi-stop"
              aria-label="Enable multi-stop booking"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pickup Location */}
      <LocationAutocomplete
        label="Pick"
        placeholder="Enter pickup location..."
        value={pickupSearch}
        onChange={setPickupSearch}
        onLocationSelect={handlePickupLocationSelect}
        onCurrentLocation={getCurrentLocationForPickup}
        showCurrentLocationButton={true}
      />

      {/* Waypoints (Multi-Stop) */}
      {isMultiStopEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Stops</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addWaypoint}
              className="h-8 px-3 text-xs"
              data-testid="button-add-waypoint"
              disabled={waypoints.length >= 8} // Max 8 additional stops
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Stop
            </Button>
          </div>
          
          {waypoints.map((waypoint, index) => (
            <div key={index} className="relative">
              <LocationAutocomplete
                label={`Stop ${index + 1}`}
                placeholder={`Enter stop ${index + 1} location...`}
                value={waypointSearches[index] || ''}
                onChange={(value) => handleWaypointSearchChange(index, value)}
                onLocationSelect={(location) => handleWaypointLocationSelect(index, location)}
                showCurrentLocationButton={false}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeWaypoint(index)}
                className="absolute -right-2 top-8 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                data-testid={`button-remove-waypoint-${index}`}
                aria-label={`Remove stop ${index + 1}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dropoff Location */}
      <LocationAutocomplete
        label="Drop"
        placeholder="Where are you going?"
        value={dropoffSearch}
        onChange={setDropoffSearch}
        onLocationSelect={handleDropoffLocationSelect}
        showCurrentLocationButton={false}
      />
      


      {/* Floating Continue Button - Mobile */}
      <div className="fixed left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-6" style={{ zIndex: 9999, bottom: 'calc(var(--bottom-nav-height, 80px) + env(safe-area-inset-bottom) + 15px)' }}>
        <Button
          onClick={() => {
            setBookingStep('vehicle');
            announce('Moving to vehicle selection');
            setTimeout(() => focusElement('#vehicle-heading'), 100);
          }}
          disabled={
            !pickupLocation || 
            !dropoffLocation || 
            (isMultiStopEnabled && waypoints.some(w => !w.address))
          }
          className="w-full h-14 min-h-[56px] text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white shadow-2xl rounded-xl border-2 border-white"
          aria-label="Continue to vehicle selection"
          data-testid="button-continue-to-vehicle"
          onKeyDown={(e) => handleKeyNavigation(e.nativeEvent, () => {
            if (!pickupLocation || !dropoffLocation || (isMultiStopEnabled && waypoints.some(w => !w.address))) return;
            setBookingStep('vehicle');
            announce('Moving to vehicle selection');
          })}
        >
          Choose Vehicle
        </Button>
      </div>
    </div>
  );

  // Vehicle Selection Step
  const renderVehicleStep = () => (
    <div className="space-y-6" role="main" aria-labelledby="vehicle-heading">
      <div className="text-center mb-6">
        <h2 id="vehicle-heading" className="text-xl font-bold mb-2">Choose Your Ride</h2>
        <p className="text-gray-600 text-sm" aria-describedby="vehicle-heading">Select a vehicle type for your journey</p>
      </div>

      {/* Route Summary */}
      {pickupLocation && dropoffLocation && (
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Route Summary</h4>
                <p className="text-xs text-blue-700">
                  {distance.toFixed(1)} km • {estimatedTime} mins
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Estimated Fare</p>
                <p className="font-bold text-blue-900">
                  {calculateSelectedVehicleFare() ? `LKR ${calculateSelectedVehicleFare()}` : 'Select vehicle'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Selector - Conditional based on filter */}
      {vehicleFilter === 'lorry' ? (
        <LorryVehicleSelector
          selectedVehicle={selectedVehicle}
          onVehicleSelect={setSelectedVehicle}
          distance={distance}
          estimatedFare={estimatedFare}
          onVehicleAnnounce={announce}
        />
      ) : (
        <VehicleSelector
          selectedVehicle={selectedVehicle}
          onVehicleSelect={setSelectedVehicle}
          distance={distance}
          estimatedFare={estimatedFare}
          isColumboArea={isColumboArea}
          nearbyDrivers={nearbyDrivers}
          userLocation={pickupLocation}
          onVehicleAnnounce={announce}
        />
      )}
      


      {/* Floating Action Buttons - Mobile */}
      <div className="fixed left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:pt-4" style={{ zIndex: 9999, bottom: 'calc(var(--bottom-nav-height, 80px) + env(safe-area-inset-bottom) + 15px)' }}>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setBookingStep('location');
              announce('Returning to location selection');
              setTimeout(() => focusElement('#location-heading'), 100);
            }}
            className="flex-1 bg-white shadow-lg"
            aria-label="Go back to location selection"
            onKeyDown={(e) => handleKeyNavigation(e.nativeEvent, () => {
              setBookingStep('location');
              announce('Returning to location selection');
            }, () => {
              setBookingStep('location');
              announce('Cancelled, returning to location selection');
            })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={() => {
              if (selectedVehicle) {
                announce('Finding nearby drivers...');
                findNearbyDrivers();
                setBookingStep('driver');
                setTimeout(() => focusElement('#driver-heading'), 100);
              }
            }}
            disabled={!selectedVehicle}
            className="flex-1 h-14 min-h-[56px] text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white shadow-2xl rounded-xl border-2 border-white"
            aria-label={!selectedVehicle ? 'Please select a vehicle first' : 'Find available drivers'}
            onKeyDown={(e) => handleKeyNavigation(e.nativeEvent, () => {
              if (!selectedVehicle) return;
              announce('Finding nearby drivers...');
              findNearbyDrivers();
              setBookingStep('driver');
            })}
          >
            Find Drivers
          </Button>
        </div>
      </div>
    </div>
  );

  // Driver Selection Step
  const renderDriverStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Available Drivers</h2>
        <p className="text-gray-600 text-sm">Choose your preferred driver</p>
      </div>


      {/* Loading State */}
      {isLoadingDrivers && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Finding nearby drivers...</p>
        </div>
      )}

      {/* Drivers List */}
      {!isLoadingDrivers && nearbyDrivers.length > 0 && (
        <div className="space-y-3">
          {nearbyDrivers.map((driver) => (
            <Card
              key={driver.id}
              className={`cursor-pointer transition-all ${
                selectedDriver?.id === driver.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedDriver(driver)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{driver.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{driver.vehicleColor} {driver.vehicleNumber}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{driver.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1 text-xs">
                      {driver.estimatedArrival} min
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {driver.distance?.toFixed(1)} km away
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No drivers found */}
      {!isLoadingDrivers && nearbyDrivers.length === 0 && (
        <div className="text-center py-8">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No drivers available right now</p>
          <Button variant="outline" onClick={findNearbyDrivers}>
            Try Again
          </Button>
        </div>
      )}
      


      {/* Floating Continue Button - Mobile */}
      <div className="fixed left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-6" style={{ zIndex: 9999, bottom: 'calc(var(--bottom-nav-height, 80px) + env(safe-area-inset-bottom) + 15px)' }}>
        <Button
          onClick={() => setBookingStep('confirm')}
          disabled={!selectedDriver}
          className="w-full h-14 min-h-[56px] text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white shadow-2xl rounded-xl border-2 border-white"
        >
          Continue to Booking
        </Button>
      </div>
    </div>
  );

  // Confirmation Step
  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Confirm Your Booking</h2>
        <p className="text-gray-600 text-sm">Review your ride details</p>
      </div>

      {/* Trip Summary */}
      {selectedDriver && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Driver Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedDriver.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedDriver.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDriver.vehicleColor} {selectedDriver.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (selectedDriver?.phone) {
                        window.open(`tel:${selectedDriver.phone}`, '_self');
                      }
                    }}
                    title={`Call ${selectedDriver?.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (selectedDriver?.phone) {
                        window.open(`sms:${selectedDriver.phone}?body=Hi ${selectedDriver.name}, I'm your RunPick customer. Please contact me regarding the ride.`, '_self');
                      }
                    }}
                    title={`Message ${selectedDriver?.name}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Trip Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pickup:</span>
                  <span className="font-medium">{pickupLocation?.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Drop-off:</span>
                  <span className="font-medium">{dropoffLocation?.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance:</span>
                  <span>{distance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span>in 3 mins</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Fare:</span>
                  <span className="text-blue-600">LKR {calculateSelectedVehicleFare()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Payment Method</h3>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'token')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-green-600" />
                <span>Cash Payment</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="token" id="token" />
              <Label htmlFor="token" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Run Pick Tokens</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 opacity-60">
              <RadioGroupItem value="card" id="card" disabled />
              <Label htmlFor="card" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span>Credit/Debit Card</span>
                <Badge variant="secondary" className="ml-2 text-xs">SOON</Badge>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Add Remark */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Add Remark</h3>
          <Textarea
            placeholder="Any special instructions for the driver..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="min-h-[80px]"
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {remark.length}/200
          </div>
        </CardContent>
      </Card>
      


      {/* Floating Book Now Button - Mobile */}
      <div className="fixed left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-6" style={{ zIndex: 9999, bottom: 'calc(var(--bottom-nav-height, 80px) + env(safe-area-inset-bottom) + 15px)' }}>
        <Button 
          onClick={handleBookRide}
          disabled={isBooking}
          className="w-full h-14 min-h-[56px] text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white shadow-2xl rounded-xl border-2 border-white"
        >
          {isBooking ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Booking...
            </div>
          ) : (
            'Book Now'
          )}
        </Button>
      </div>
    </div>
  );

  // Tracking Step
  const renderTrackingStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Ride Booked!</h2>
        <p className="text-gray-600 text-sm">Your driver is on the way</p>
        <p className="text-xs text-gray-500 mt-1">Booking ID: {bookingId}</p>
      </div>


      {/* Driver Status */}
      {selectedDriver && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedDriver.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{selectedDriver.name}</h4>
                  <p className="text-sm text-gray-600">{selectedDriver.vehicleColor} {selectedDriver.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedDriver?.phone) {
                      window.open(`tel:${selectedDriver.phone}`, '_self');
                    }
                  }}
                  title={`Call ${selectedDriver?.name}`}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedDriver?.phone) {
                      window.open(`sms:${selectedDriver.phone}?body=Hi ${selectedDriver.name}, I'm your RunPick customer. Please contact me regarding the ride.`, '_self');
                    }
                  }}
                  title={`Message ${selectedDriver?.name}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                {/* Chat Button */}
                {chatRoomId && bookingId && (
                  <RideChatButton
                    chatRoomId={chatRoomId}
                    orderId={parseInt(bookingId)}
                    serviceType="taxi"
                    otherUser={{
                      id: selectedDriver.id,
                      name: selectedDriver.name,
                      role: 'driver',
                      phone: selectedDriver.phone
                    }}
                    unreadCount={unreadMessageCount}
                    onUnreadCountChange={handleUnreadMessageUpdate}
                  />
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Driver is arriving in 3 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Booking */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Cancel Booking
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? You may be charged a cancellation fee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto p-4">
      {/* Authentication Modal */}
      <OnboardingAuth
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          // Check if user is now authenticated after successful auth
          setTimeout(() => {
            if (user) {
              handleBookRide();
            }
          }, 500);
        }}
      />
      
      {/* Email OTP Modal */}
      <EmailOtpModal
        isOpen={showEmailOtp}
        onClose={() => setShowEmailOtp(false)}
        onVerified={(userData) => {
          setCustomerData(userData);
          setShowEmailOtp(false);
          // Auto-proceed with booking after verification
          setTimeout(() => {
            proceedWithBooking();
          }, 500);
        }}
        title="Sign up to book your ride"
        description="Please verify your email address to continue with the booking"
      />
      
      {/* Header with Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {bookingStep !== 'location' && bookingStep !== 'tracking' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (bookingStep === 'vehicle') setBookingStep('location');
                else if (bookingStep === 'driver') setBookingStep('vehicle');
                else if (bookingStep === 'confirm') setBookingStep('driver');
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          
          {bookingStep === 'tracking' && (
            <div className="text-center w-full">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active Booking
              </Badge>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {bookingStep !== 'tracking' && (
          <div className="flex items-center justify-center space-x-2 mb-4">
            {['location', 'vehicle', 'driver', 'confirm'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  bookingStep === step 
                    ? 'bg-blue-600 text-white' 
                    : ['location', 'vehicle', 'driver', 'confirm'].indexOf(bookingStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {['location', 'vehicle', 'driver', 'confirm'].indexOf(bookingStep) > index ? '✓' : index + 1}
                </div>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-200"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single Persistent Map Component - Always visible to prevent WebGL context issues */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            {bookingStep === 'location' && 'Route Preview'}
            {bookingStep === 'driver' && 'Available Drivers'}
            {bookingStep === 'tracking' && 'Live Tracking'}
            {bookingStep === 'vehicle' && 'Map View'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MapboxHybridMap
            pickupLocation={pickupLocation ? {lat: pickupLocation.lat, lng: pickupLocation.lng, address: pickupLocation.address} : undefined}
            dropoffLocation={dropoffLocation ? {lat: dropoffLocation.lat, lng: dropoffLocation.lng, address: dropoffLocation.address} : undefined}
            waypoints={isMultiStopEnabled && waypoints.length > 0 ? waypoints.map(w => [w.lng, w.lat] as [number, number]) : undefined}
            markers={(bookingStep === 'driver' || bookingStep === 'tracking') ? 
              (bookingStep === 'tracking' && selectedDriver ? 
                [{id: selectedDriver.id.toString(), lat: selectedDriver.latitude, lng: selectedDriver.longitude, type: 'driver' as const, title: selectedDriver.name}] : 
                nearbyDrivers.map(driver => ({id: driver.id.toString(), lat: driver.latitude, lng: driver.longitude, type: 'driver' as const, title: driver.name}))) : []}
            className="w-full h-[500px]"
            routes={[]}
          />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6 pb-[100px] md:pb-0">
        {bookingStep === 'location' && renderLocationStep()}
        {bookingStep === 'vehicle' && renderVehicleStep()}
        {bookingStep === 'driver' && renderDriverStep()}
        {bookingStep === 'confirm' && renderConfirmStep()}
        {bookingStep === 'tracking' && renderTrackingStep()}
      </div>
    </div>
  );
};

export default ProductionRideBooking;