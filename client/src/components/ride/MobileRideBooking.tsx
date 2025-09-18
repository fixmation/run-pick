import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Car, 
  Bike, 
  Truck, 
  Users, 
  Clock, 
  CreditCard, 
  Banknote,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VehicleType {
  id: string;
  name: string;
  icon: React.ReactNode;
  capacity: number;
  estimatedTime: string;
  fare: string;
  available: boolean;
}

const MobileRideBooking: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'token'>('cash');
  const [remark, setRemark] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  // Vehicle types based on PDF specification
  const vehicleTypes: VehicleType[] = [
    {
      id: 'threewheeler',
      name: 'Threewheeler',
      icon: <Car className="w-8 h-8" />,
      capacity: 3,
      estimatedTime: 'in 3 mins',
      fare: 'LKR 1000.00',
      available: true
    },
    {
      id: 'bike',
      name: 'Bike',
      icon: <Bike className="w-8 h-8" />,
      capacity: 1,
      estimatedTime: 'in 3 mins',
      fare: 'LKR 1000.00',
      available: true
    },
    {
      id: 'mini_car',
      name: 'Mini Car',
      icon: <Car className="w-8 h-8" />,
      capacity: 3,
      estimatedTime: 'in 3 mins',
      fare: 'LKR 1000.00',
      available: true
    },
    {
      id: 'light_open',
      name: 'Light Open',
      icon: <Truck className="w-8 h-8" />,
      capacity: 1,
      estimatedTime: 'in 3 mins',
      fare: 'LKR 1000.00',
      available: true
    },
    {
      id: 'light',
      name: 'Light',
      icon: <Car className="w-8 h-8" />,
      capacity: 1,
      estimatedTime: 'in 3 mins',
      fare: 'LKR 1000.00',
      available: true
    },
    {
      id: 'mover',
      name: 'Mover',
      icon: <Truck className="w-8 h-8" />,
      capacity: 1,
      estimatedTime: 'in 3 mins',
      fare: 'LKR 1000.00',
      available: true
    }
  ];

  const handleBookRide = async () => {
    if (!selectedVehicle) {
      toast({
        title: "Select Vehicle",
        description: "Please select a vehicle type to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Ride Booked!",
        description: `Your ${vehicleTypes.find(v => v.id === selectedVehicle)?.name} is on the way.`,
      });
      
      // Reset form
      setSelectedVehicle('');
      setPaymentMethod('cash');
      setRemark('');
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 select-none">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Book a Ride</h1>
        </div>
        <p className="text-gray-600 text-sm">Choose your vehicle and ride with us</p>
      </div>

      {/* Vehicle Grid - 2x3 Layout as per PDF */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {vehicleTypes.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 touch-manipulation ${
              selectedVehicle === vehicle.id
                ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md'
                : 'hover:bg-gray-50'
            } ${!vehicle.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => vehicle.available && setSelectedVehicle(vehicle.id)}
          >
            <CardContent className="p-4 text-center">
              {/* Vehicle Icon */}
              <div className="flex justify-center mb-3">
                <div className={`p-3 rounded-full ${
                  selectedVehicle === vehicle.id ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  {vehicle.icon}
                </div>
              </div>
              
              {/* Vehicle Name */}
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                {vehicle.name}
              </h3>
              
              {/* Capacity */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">{vehicle.capacity}</span>
              </div>
              
              {/* Estimated Time */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">{vehicle.estimatedTime}</span>
              </div>
              
              {/* Fare */}
              <div className="font-bold text-blue-600 text-sm">
                {vehicle.fare}
              </div>
              
              {/* Selection Indicator */}
              {selectedVehicle === vehicle.id && (
                <Badge className="mt-2 bg-blue-500 text-white text-xs">
                  Selected
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Method Selection */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-gray-900">Payment Method</h3>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(value) => setPaymentMethod(value as 'cash' | 'token')}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" className="text-blue-600" />
              <Label 
                htmlFor="cash" 
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Banknote className="w-5 h-5 text-green-600" />
                <span className="font-medium">Cash</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="token" id="token" className="text-blue-600" />
              <Label 
                htmlFor="token" 
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Token</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Add Remark */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Add Remark</h3>
          </div>
          <Textarea
            placeholder="Any special instructions for the driver..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {remark.length}/200
          </div>
        </CardContent>
      </Card>

      {/* Book Now Button */}
      <Button 
        onClick={handleBookRide}
        disabled={isBooking || !selectedVehicle}
        className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
        size="lg"
      >
        {isBooking ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Booking...
          </div>
        ) : (
          'Book Now'
        )}
      </Button>

      {/* Selection Summary */}
      {selectedVehicle && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">
                  {vehicleTypes.find(v => v.id === selectedVehicle)?.name}
                </h4>
                <p className="text-sm text-blue-700">
                  {paymentMethod === 'cash' ? 'Cash Payment' : 'Token Payment'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-900">LKR 1000.00</p>
                <p className="text-xs text-blue-700">in 3 mins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileRideBooking;