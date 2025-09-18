import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Star, ChevronLeft, ChevronRight, Package } from 'lucide-react';

// Import lorry vehicle images
import lightLorryIcon from "@assets/Light-Lorry_1758134256033.png";
import lightOpenIcon from "@assets/Light-Open_1758129452943.png";
import moverIcon from "@assets/Mover_1758129452942.png";
import moverOpenIcon from "@assets/Mover-Open_1758129452944.png";
import moverPlusIcon from "@assets/Mover-Plus_1758134256031.png";
import moverPlusOpenIcon from "@assets/Mover-Plus-Open_1758134256032.png";

interface LorryVehicleType {
  id: string;
  name: string;
  icon: string;
  description: string;
  size: string;
  baseFare: number;
  pricePerKm: number;
  estimatedTime: string;
  available: boolean;
}

interface LorryVehicleSelectorProps {
  selectedVehicle: string;
  onVehicleSelect: (vehicleId: string) => void;
  distance?: number;
  estimatedFare?: number;
  onVehicleAnnounce?: (message: string) => void;
}

const LorryVehicleSelector: React.FC<LorryVehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleSelect,
  distance = 0,
  estimatedFare = 0,
  onVehicleAnnounce
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 200;
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 200;
    }
  };

  const lorryVehicleTypes: LorryVehicleType[] = [
    {
      id: 'lorry_light',
      name: 'Lorry Light',
      icon: lightLorryIcon,
      description: 'Perfect for small loads',
      size: '7 feet',
      baseFare: 1821.68,
      pricePerKm: 121.10,
      estimatedTime: 'in 5 mins',
      available: true
    },
    {
      id: 'light_open',
      name: 'Light Open',
      icon: lightOpenIcon,
      description: 'Open lorry for easy loading',
      size: '7 feet',
      baseFare: 1821.68,
      pricePerKm: 121.10,
      estimatedTime: 'in 5 mins',
      available: true
    },
    {
      id: 'mover',
      name: 'Mover',
      icon: moverIcon,
      description: 'Medium capacity lorry',
      size: '10 feet',
      baseFare: 4045.88,
      pricePerKm: 185.86,
      estimatedTime: 'in 7 mins',
      available: true
    },
    {
      id: 'mover_open',
      name: 'Mover Open',
      icon: moverOpenIcon,
      description: 'Open medium lorry',
      size: '10 feet',
      baseFare: 4045.88,
      pricePerKm: 185.86,
      estimatedTime: 'in 7 mins',
      available: true
    },
    {
      id: 'mover_plus',
      name: 'Mover Plus',
      icon: moverPlusIcon,
      description: 'Large capacity lorry',
      size: '14.5 feet',
      baseFare: 7790.08,
      pricePerKm: 266.98,
      estimatedTime: 'in 10 mins',
      available: true
    },
    {
      id: 'mover_plus_open',
      name: 'Mover Plus Open',
      icon: moverPlusOpenIcon,
      description: 'Large open lorry',
      size: '14.5 feet',
      baseFare: 7790.08,
      pricePerKm: 266.98,
      estimatedTime: 'in 10 mins',
      available: true
    }
  ];

  const calculateFare = (vehicle: LorryVehicleType) => {
    // Lorry fare calculation: Base fare for first km + per km rate for additional distance
    if (distance <= 1) {
      // For distances 1km or less, just charge the base fare
      return Math.round(vehicle.baseFare);
    } else {
      // Base fare for first km + per km rate for additional distance
      const additionalDistance = distance - 1;
      return Math.round(vehicle.baseFare + (additionalDistance * vehicle.pricePerKm));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Choose Lorry Type</h3>
      
      <div className="relative">
        {/* Left scroll arrow */}
        <Button
          variant="outline"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white shadow-md"
          onClick={scrollLeft}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {/* Right scroll arrow */}
        <Button
          variant="outline"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white shadow-md"
          onClick={scrollRight}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-3 pb-2 px-10 scroll-smooth"
          style={{ 
            scrollbarWidth: 'thin', 
            msOverflowStyle: 'auto',
            scrollbarColor: '#d1d5db #f3f4f6'
          }}
        >
        {lorryVehicleTypes.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 w-40 ${
              selectedVehicle === vehicle.id
                ? 'ring-2 ring-orange-600 bg-orange-600 border-orange-600 border-2 text-white'
                : 'bg-[#ffac76] hover:bg-[#ffac76]/80 border border-[#ffac76]/50'
            } ${!vehicle.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (vehicle.available) {
                onVehicleSelect(vehicle.id);
                onVehicleAnnounce?.(`Selected ${vehicle.name}, ${vehicle.size}, fare LKR ${calculateFare(vehicle)}`);
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && vehicle.available) {
                e.preventDefault();
                onVehicleSelect(vehicle.id);
                onVehicleAnnounce?.(`Selected ${vehicle.name}, ${vehicle.size}, fare LKR ${calculateFare(vehicle)}`);
              }
            }}
            tabIndex={0}
            role="button"
            aria-pressed={selectedVehicle === vehicle.id}
            aria-label={`${vehicle.name}, ${vehicle.description}, ${vehicle.size}, ${vehicle.available ? `LKR ${calculateFare(vehicle)}` : 'unavailable'}`}
            aria-describedby={`lorry-${vehicle.id}-details`}
          >
            <CardContent className="p-3">
              <div id={`lorry-${vehicle.id}-details`} className="flex flex-col items-center text-center space-y-3">
                {/* Vehicle Image */}
                <div className="w-32 h-20 flex items-center justify-center bg-amber-100/50 rounded-lg border-2 border-transparent hover:border-amber-300 transition-all">
                  <img 
                    src={vehicle.icon} 
                    alt={vehicle.name}
                    className="w-28 h-16 object-contain"
                  />
                </div>
                
                {/* Vehicle Name & Status */}
                <div className="w-full">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">{vehicle.name}</h4>
                    {!vehicle.available && (
                      <Badge variant="secondary" className="text-xs">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                  
                  {/* Vehicle Description */}
                  <p className={`text-xs mb-2 ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-700'}`}>{vehicle.description}</p>
                  
                  {/* Size */}
                  <div className={`flex items-center justify-center space-x-1 text-xs mb-1 ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-600'}`}>
                    <Package className="w-3 h-3" />
                    <span>{vehicle.size}</span>
                  </div>
                  
                  {/* ETA */}
                  <div className={`flex items-center justify-center space-x-1 text-xs mb-2 ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-600'}`}>
                    <Clock className="w-3 h-3" />
                    <span>{vehicle.estimatedTime}</span>
                  </div>
                  
                  {/* Fare */}
                  <div className="border-t border-amber-200/50 pt-2">
                    <div className={`text-sm font-semibold ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-800'}`}>
                      LKR {calculateFare(vehicle).toLocaleString()}
                    </div>
                    <div className={`text-xs ${selectedVehicle === vehicle.id ? 'text-white/80' : 'text-gray-600'}`}>
                      {distance > 0 ? `${distance.toFixed(1)} km` : 'Est. fare'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-orange-800">
          <Star className="w-4 h-4" />
          <span>
            Lorry rates - Base fare for 1st km + additional per km charges
          </span>
        </div>
      </div>
    </div>
  );
};

export default LorryVehicleSelector;