
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LocationContextType {
  currentLocation: string;
  setCurrentLocation: (location: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [currentLocation, setCurrentLocationState] = useState(() => {
    // Load from localStorage or default to Colombo
    const saved = localStorage.getItem('runpick-location');
    return saved || "Colombo, Sri Lanka";
  });

  const setCurrentLocation = (location: string) => {
    setCurrentLocationState(location);
    localStorage.setItem('runpick-location', location);
  };

  useEffect(() => {
    // Save to localStorage whenever location changes
    localStorage.setItem('runpick-location', currentLocation);
  }, [currentLocation]);

  return (
    <LocationContext.Provider value={{ currentLocation, setCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
