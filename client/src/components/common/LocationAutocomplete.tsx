import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';

export interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: SelectedLocation) => void;
  onCurrentLocation?: () => void;
  showCurrentLocationButton?: boolean;
  disabled?: boolean;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  onCurrentLocation,
  showCurrentLocationButton = true,
  disabled = false,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const { suggestions, isLoading, searchPlaces, retrievePlace } = useMapboxGeocoding();

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setSelectedIndex(-1);
    setHasSearched(false);
    
    if (inputValue.length >= 3) {
      setShowSuggestions(true);
      // Hook now handles debouncing, request cancellation, and race conditions internally
      searchPlaces(inputValue);
      setHasSearched(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle manual address validation when user finishes typing
  const handleManualAddressValidation = (inputValue: string) => {
    // If user has typed a reasonable address (15+ chars) but no dropdown selection made
    if (inputValue.length >= 15 && inputValue.trim()) {
      // Create a location object with default Sri Lanka coordinates
      // This allows the booking flow to continue with manual address
      const location: SelectedLocation = {
        lat: 7.8731, // Default to Sri Lanka center (Kandy area)
        lng: 80.7718,
        address: inputValue.trim()
      };
      
      console.log('📍 Manual address accepted:', inputValue);
      onLocationSelect(location);
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    try {
      // Step 2: Retrieve the full details including coordinates
      const fullSuggestion = await retrievePlace(suggestion);
      
      const location: SelectedLocation = {
        lat: fullSuggestion.center ? fullSuggestion.center[1] : 0, // latitude
        lng: fullSuggestion.center ? fullSuggestion.center[0] : 0, // longitude  
        address: fullSuggestion.full_address || fullSuggestion.place_name || suggestion.place_name
      };
      
      console.log('📍 LOCATION DEBUG:', {
        address: location.address,
        center: fullSuggestion.center,
        finalLocation: location,
        coordinateInfo: `Latitude: ${location.lat}, Longitude: ${location.lng}`
      });
      
      onChange(suggestion.full_address || suggestion.place_name);
      onLocationSelect(location);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error selecting location:', error);
      // Fallback to basic selection without coordinates
      onChange(suggestion.full_address || suggestion.place_name);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter and Tab keys for manual address even when no suggestions
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.key === 'Enter') e.preventDefault();
      
      if (showSuggestions && suggestions.length > 0 && selectedIndex >= 0) {
        if (e.key === 'Enter') {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
      } else if (value.trim()) {
        // Handle manual address entry on Enter/Tab key
        handleManualAddressValidation(value);
        setShowSuggestions(false);
        if (e.key === 'Enter') inputRef.current?.blur();
      }
      
      if (e.key === 'Enter') return;
    }

    // Handle other keys only when suggestions are visible
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      // Enter key now handled above
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputBlur = () => {
    // Validate manual address input when user leaves the field
    if (value.trim()) {
      handleManualAddressValidation(value);
    }
    
    // Delay hiding suggestions to allow for click selection
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleInputFocus = () => {
    if (value.length >= 3) {
      setShowSuggestions(true);
    }
  };
  
  // Cleanup is now handled by the hook internally

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`h-12 min-h-[48px] ${showCurrentLocationButton && onCurrentLocation ? 'pr-20 md:pr-16' : 'pr-10'}`}
            data-testid="input-location-address"
          />
          
          {/* Icons and Current Location Button Container */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Use Current Location Button - Inside Input */}
            {showCurrentLocationButton && onCurrentLocation && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCurrentLocation}
                disabled={disabled}
                className="w-7 h-7 md:w-8 md:h-8 min-w-[28px] min-h-[28px] md:min-w-[32px] md:min-h-[32px] p-0 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center shadow-sm"
                title="Use Current Location"
                data-testid="button-current-location"
              >
                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            )}
            
            {/* Loading/Location Icon */}
            <div className="ml-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <MapPin className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  ref={el => suggestionRefs.current[index] = el}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.feature_name || suggestion.address_line1 || suggestion.place_name?.split(',')[0] || suggestion.full_address?.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.full_address || suggestion.place_name || suggestion.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : hasSearched && !isLoading ? (
              <div className="px-4 py-6 text-center text-gray-500" data-testid="text-no-results">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <div className="text-sm">No locations found</div>
                <div className="text-xs mt-1">Try a different search term</div>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
};

export default LocationAutocomplete;