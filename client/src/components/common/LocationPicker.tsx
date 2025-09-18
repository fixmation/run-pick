import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "@/contexts/LocationContext";

interface LocationPickerProps {
  onLocationChange?: (location: string) => void;
}

const LocationPicker = ({ onLocationChange }: LocationPickerProps) => {
  const { currentLocation, setCurrentLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasGPS, setHasGPS] = useState(false);

  useEffect(() => {
    // Check if geolocation is available
    if ("geolocation" in navigator) {
      setHasGPS(true);
    }
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Using OpenStreetMap Nominatim API for reverse geocoding (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || "Unknown";
            const country = data.address.country || "Sri Lanka";
            const newLocation = `${city}, ${country}`;
            
            setCurrentLocation(newLocation);
            onLocationChange?.(newLocation);
          }
        } catch (error) {
          console.error("Error getting location:", error);
          // Keep default location on error
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const popularLocations = [
    "Colombo, Sri Lanka",
    "Kandy, Sri Lanka", 
    "Galle, Sri Lanka",
    "Negombo, Sri Lanka",
    "Jaffna, Sri Lanka",
    "Matara, Sri Lanka"
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600">
          <MapPin className="w-4 h-4" />
          <span className="max-w-[150px] truncate">{currentLocation}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {hasGPS && (
          <DropdownMenuItem onClick={getCurrentLocation} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Getting location..." : "Use current location"}
          </DropdownMenuItem>
        )}
        
        <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Popular Locations
        </div>
        
        {popularLocations.map((location) => (
          <DropdownMenuItem 
            key={location}
            onClick={() => {
              setCurrentLocation(location);
              onLocationChange?.(location);
            }}
            className={currentLocation === location ? "bg-blue-50" : ""}
          >
            {location}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationPicker;