import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Clock, Navigation, Star, Phone, MessageSquare, CreditCard, Banknote } from 'lucide-react';
import MapComponent from '@/components/maps/MapComponent';
import VehicleSelector from '@/components/ride/VehicleSelector';
import LocationAutocomplete from '@/components/common/LocationAutocomplete';
import { useToast } from '@/hooks/use-toast';
import { getDistance, getCenter } from 'geolib';

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

const RideBooking: React.FC = () => {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [pickupInput, setPickupInput] = useState<string>('');
  const [dropoffInput, setDropoffInput] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('car');
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'location' | 'vehicle' | 'driver' | 'confirm'>('location');
  const [distance, setDistance] = useState<number>(0);
  const [estimatedFare, setEstimatedFare] = useState<number>(1000); // Fixed fare as per PDF
  const [estimatedTime, setEstimatedTime] = useState<number>(3); // Fixed time as per PDF
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'token'>('cash');
  const [remark, setRemark] = useState<string>('');
  const { toast } = useToast();

  // Mock nearby drivers data
  const mockDrivers: Driver[] = [
    {
      id: 1,
      name: 'Kasun Perera',
      rating: 4.8,
      vehicleType: 'car',
      vehicleNumber: 'CAR-1234',
      vehicleColor: 'Blue',
      phone: '+94771234567',
      latitude: 6.9271,
      longitude: 79.8612,
      isAvailable: true,
      estimatedArrival: 3
    },
    {
      id: 2,
      name: 'Nimal Silva',
      rating: 4.6,
      vehicleType: 'tuk_tuk',
      vehicleNumber: 'TUK-5678',
      vehicleColor: 'Yellow',
      phone: '+94771234568',
      latitude: 6.9290,
      longitude: 79.8640,
      isAvailable: true,
      estimatedArrival: 5
    },
    {
      id: 3,
      name: 'Suresh Fernando',
      rating: 4.9,
      vehicleType: 'bike',
      vehicleNumber: 'BIKE-9012',
      vehicleColor: 'Red',
      phone: '+94771234569',
      latitude: 6.9250,
      longitude: 79.8590,
      isAvailable: true,
      estimatedArrival: 2
    }
  ];

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateDistance();
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (pickupLocation && selectedVehicle) {
      findNearbyDrivers();
    }
  }, [pickupLocation, selectedVehicle]);

  const calculateDistance = () => {
    if (!pickupLocation || !dropoffLocation) return;

    const distanceInMeters = getDistance(
      { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
      { latitude: dropoffLocation.lat, longitude: dropoffLocation.lng }
    );

    const distanceInKm = distanceInMeters / 1000;
    setDistance(distanceInKm);

    // Calculate estimated fare based on vehicle type
    const baseFares = {
      bike: 100,
      tuk_tuk: 150,
      car: 200,
      mini_van: 300,
      van: 400
    };

    const pricePerKm = {
      bike: 25,
      tuk_tuk: 35,
      car: 50,
      mini_van: 60,
      van: 75
    };

    const baseFare = baseFares[selectedVehicle as keyof typeof baseFares] || 200;
    const kmRate = pricePerKm[selectedVehicle as keyof typeof pricePerKm] || 50;
    const calculatedFare = baseFare + (distanceInKm * kmRate);

    setEstimatedFare(Math.round(calculatedFare));
    setEstimatedTime(Math.round(distanceInKm * 3)); // Rough estimate: 3 minutes per km
  };

  const findNearbyDrivers = () => {
    if (!pickupLocation) return;

    // Filter drivers by vehicle type and calculate distance
    const filteredDrivers = mockDrivers
      .filter(driver => driver.vehicleType === selectedVehicle && driver.isAvailable)
      .map(driver => ({
        ...driver,
        distance: getDistance(
          { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
          { latitude: driver.latitude, longitude: driver.longitude }
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    setNearbyDrivers(filteredDrivers);
  };

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation || !selectedDriver) {
      toast({
        title: "Missing Information",
        description: "Please complete all booking details",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);

    // Simulate booking API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Ride Booked Successfully!",
        description: `${selectedDriver.name} is on the way. Estimated arrival: ${selectedDriver.estimatedArrival} minutes`,
      });

      // Reset form
      setPickupLocation(null);
      setDropoffLocation(null);
      setPickupInput('');
      setDropoffInput('');
      setSelectedDriver(null);
      setBookingStep('location');

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const renderLocationStep = () => (
    <div className="space-y-6">
      {/* Current Location Button */}
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center space-x-2 py-3"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords;
              setPickupLocation({ lat: latitude, lng: longitude, address: "Current Location" });
            });
          }
        }}
      >
        <Navigation className="w-5 h-5 text-blue-600" />
        <span>Use Current Location</span>
      </Button>

      {/* Location Input Fields */}
      <div className="space-y-4">
        <LocationAutocomplete
          label="Pickup Location"
          placeholder="Enter pickup location"
          value={pickupInput}
          onChange={setPickupInput}
          onLocationSelect={(location) => {
            setPickupLocation(location);
            setPickupInput(location.address);
          }}
          onCurrentLocation={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude, address: "Current Location" };
                setPickupLocation(location);
                setPickupInput("Current Location");
              });
            }
          }}
          className="border-2 focus-within:border-green-500"
        />

        <LocationAutocomplete
          label="Destination"
          placeholder="Where are you going?"
          value={dropoffInput}
          onChange={setDropoffInput}
          onLocationSelect={(location) => {
            setDropoffLocation(location);
            setDropoffInput(location.address);
          }}
          showCurrentLocationButton={false}
          className="border-2 focus-within:border-red-500"
        />
      </div>

      {/* Saved Places */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Quick Select</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Home", icon: "🏠", address: "Colombo 03, Sri Lanka" },
            { name: "Work", icon: "🏢", address: "Colombo 01, Sri Lanka" },
            { name: "Airport", icon: "✈️", address: "Katunayake, Sri Lanka" },
            { name: "Railway Station", icon: "🚂", address: "Fort Railway Station" }
          ].map((place) => (
            <Button
              key={place.name}
              variant="ghost"
              size="sm"
              className="justify-start p-2 h-auto"
              onClick={() => {
                if (!pickupLocation) {
                  setPickupLocation({ lat: 6.9271, lng: 79.8612, address: place.address });
                  setPickupInput(place.address);
                } else if (!dropoffLocation) {
                  setDropoffLocation({ lat: 6.9250, lng: 79.8600, address: place.address });
                  setDropoffInput(place.address);
                }
              }}
            >
              <span className="text-lg mr-2">{place.icon}</span>
              <div className="text-left">
                <div className="font-medium text-sm">{place.name}</div>
                <div className="text-xs text-gray-500">{place.address}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Map Preview */}
      {(pickupLocation || dropoffLocation) && (
        <div className="space-y-4">
          <MapComponent
            pickupLocation={pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : undefined}
            dropoffLocation={dropoffLocation ? { lat: dropoffLocation.lat, lng: dropoffLocation.lng } : undefined}
            showRoute={true}
            height="300px"
          />

          {/* Trip Info */}
          {pickupLocation && dropoffLocation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-1">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Distance: {distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Est. time: {estimatedTime} mins</span>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={() => setBookingStep('vehicle')}
            className="w-full py-3 text-lg font-semibold"
            disabled={!pickupLocation?.address || !dropoffLocation?.address}
          >
            Choose Vehicle Type
          </Button>
        </div>
      )}
    </div>
  );

  const renderVehicleStep = () => (
    <div className="space-y-4">
      <VehicleSelector
        selectedVehicle={selectedVehicle}
        onVehicleSelect={(vehicleId) => {
          setSelectedVehicle(vehicleId);
          setBookingStep('driver');
        }}
        distance={distance}
        estimatedFare={estimatedFare}
      />

      {distance > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center space-x-1">
              <Navigation className="w-4 h-4" />
              <span>Distance: {distance.toFixed(1)} km</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Est. time: {estimatedTime} mins</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderDriverStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Drivers</h3>

      <MapComponent
        pickupLocation={pickupLocation || undefined}
        dropoffLocation={dropoffLocation || undefined}
        drivers={nearbyDrivers}
        onDriverSelect={(driver) => {
          // Ensure driver has all required properties
          const fullDriver: Driver = {
            ...driver,
            vehicleNumber: driver.vehicleNumber || 'N/A',
            vehicleColor: driver.vehicleColor || 'Unknown',
            phone: driver.phone || 'N/A',
            estimatedArrival: driver.estimatedArrival || 5,
            distance: driver.distance || 0
          };
          setSelectedDriver(fullDriver);
        }}
        showRoute={true}
        height="250px"
      />

      <div className="space-y-3">
        {nearbyDrivers.map((driver) => (
          <Card
            key={driver.id}
            className={`cursor-pointer transition-all ${
              selectedDriver?.id === driver.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              setSelectedDriver(driver);
              setBookingStep('confirm');
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{driver.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{driver.vehicleColor} {driver.vehicleNumber}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {driver.estimatedArrival} mins
                  </Badge>
                  <div className="text-xs text-gray-500">
                    arrival time
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Confirm Booking</h3>

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
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{selectedDriver.vehicleColor} {selectedDriver.vehicleNumber}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{selectedDriver.rating}</span>
                    </div>
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

            <Separator />

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pickup:</span>
                <span className="text-sm">{pickupLocation?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dropoff:</span>
                <span className="text-sm">{dropoffLocation?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Distance:</span>
                <span className="text-sm">{distance.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Time:</span>
                <span className="text-sm">in 3 mins</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Fare:</span>
                <span className="text-blue-600">LKR 1000.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'token')} className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer">
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="token" id="token" />
              <Label htmlFor="token" className="flex items-center space-x-2 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                <span>Token</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Add Remark */}
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="remark" className="text-sm font-medium mb-2 block">Add Remark</Label>
          <Textarea
            id="remark"
            placeholder="Any special instructions for the driver..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      <Button 
            onClick={handleBookRide}
            disabled={isBooking || !pickupLocation || !dropoffLocation}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isBooking ? 'Booking...' : 'Request Ride'}
          </Button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Book a Ride</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingStep === 'location' && renderLocationStep()}
          {bookingStep === 'vehicle' && renderVehicleStep()}
          {bookingStep === 'driver' && renderDriverStep()}
          {bookingStep === 'confirm' && renderConfirmStep()}

          {bookingStep !== 'location' && (
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (bookingStep === 'vehicle') setBookingStep('location');
                  else if (bookingStep === 'driver') setBookingStep('vehicle');
                  else if (bookingStep === 'confirm') setBookingStep('driver');
                }}
              >
                Back
              </Button>

              {bookingStep === 'vehicle' && (
                <Button
                  onClick={() => setBookingStep('driver')}
                  disabled={!selectedVehicle}
                >
                  Find Drivers
                </Button>
              )}

              {bookingStep === 'driver' && (
                <Button
                  onClick={() => setBookingStep('confirm')}
                  disabled={!selectedDriver}
                >
                  Book Ride
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RideBooking;