import { useState, useCallback, useRef, useEffect } from 'react';
import { getMapboxToken } from '@/config/env';

interface LocationSuggestion {
  id: string;
  place_name: string;
  full_address: string;
  center?: [number, number]; // [longitude, latitude] - only available after retrieve
  address_line1?: string;
  address_line2?: string;
  postcode?: string;
  action?: { id: string };
  feature_name?: string;
  description?: string;
}

export const useMapboxGeocoding = () => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autofillRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);
  
  // Production safeguards
  const currentRequestIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<number | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const initializeAutofill = useCallback(async () => {
    if (autofillRef.current) return autofillRef.current;

    try {
      const token = await getMapboxToken();
      if (!token) {
        console.warn('MapBox token not available');
        return null;
      }

      console.log('🔧 Initializing Mapbox Address Autofill with token:', token.substring(0, 20) + '...');

      // Try dynamic import with more specific error handling
      let AddressAutofillCore, SessionToken;
      
      try {
        const mapboxModule = await import('@mapbox/search-js-core');
        console.log('📦 Mapbox module imported successfully:', Object.keys(mapboxModule));
        
        AddressAutofillCore = mapboxModule.AddressAutofillCore;
        SessionToken = mapboxModule.SessionToken;
        
        if (!AddressAutofillCore) {
          throw new Error('AddressAutofillCore not found in module');
        }
        if (!SessionToken) {
          throw new Error('SessionToken not found in module');
        }
      } catch (importError) {
        console.error('❌ Failed to import Mapbox module:', importError);
        throw importError;
      }
      
      console.log('🏗️ Creating AddressAutofillCore instance...');
      autofillRef.current = new AddressAutofillCore({
        accessToken: token,
      });

      console.log('🎫 Creating SessionToken...');
      sessionTokenRef.current = new SessionToken();
      
      console.log('✅ Mapbox Address Autofill initialized successfully');
      return autofillRef.current;
    } catch (error: any) {
      console.error('❌ Failed to initialize Mapbox Address Autofill:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      return null;
    }
  }, []);

  const performSearch = useCallback(async (query: string, requestId: number, signal: AbortSignal) => {
    console.log(`🔍 [Request ${requestId}] Searching addresses for:`, query);
    let suggestions = [];

    // STEP 1: Try server-side Geoapify autocomplete first (avoids CORS issues!)
    try {
      if (!signal.aborted) {
        console.log(`🌍 [Request ${requestId}] Trying server-side Geoapify Address Autocomplete (primary)...`);
        
        try {
          const serverResponse = await fetch(
            `/api/geocode/autocomplete?query=${encodeURIComponent(query)}&limit=8`,
            { signal }
          );

          if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            console.log(`✅ [Request ${requestId}] Server-side Geoapify found suggestions:`, serverData.suggestions?.length || 0);
            
            if (serverData.suggestions && serverData.suggestions.length > 0) {
              suggestions = serverData.suggestions.map((result: any) => ({
                id: result.id,
                place_name: result.place_name,
                full_address: result.full_address,
                center: result.center, // Already in [lon, lat] format
                address_line1: result.address_line1,
                address_line2: result.address_line2,
                postcode: result.postcode,
                source: 'geoapify-server'
              }));
            }
          } else {
            console.log(`⚠️ [Request ${requestId}] Server-side Geoapify request failed, status:`, serverResponse.status);
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError' || signal.aborted) {
            console.log(`❌ [Request ${requestId}] Server-side Geoapify request aborted`);
            return null;
          }
          throw fetchError; // Re-throw non-abort errors
        }
      } else {
        console.log(`⚠️ [Request ${requestId}] Request already aborted`);
      }
    } catch (serverError: any) {
      if (serverError.name === 'AbortError' || signal.aborted) {
        console.log(`❌ [Request ${requestId}] Server-side Geoapify request aborted`);
        return null;
      }
      console.log(`⚠️ [Request ${requestId}] Server-side Geoapify failed:`, serverError);
    }

    // Check if request was aborted after Geoapify
    if (signal.aborted) {
      console.log(`❌ [Request ${requestId}] Aborted before Mapbox fallback`);
      return null;
    }

    // STEP 2: Fallback to Mapbox if Geoapify didn't return results
    if (suggestions.length === 0) {
      console.log(`📍 [Request ${requestId}] Falling back to Mapbox (when Geoapify has no results)...`);
      
      const mapboxToken = await getMapboxToken();
      if (mapboxToken) {
        // Try Mapbox Address Autofill first
        const autofill = await initializeAutofill();
        if (autofill) {
          try {
            const autofillResult = await autofill.suggest(query, {
              language: 'en',
              limit: 8,
              proximity: [79.8612, 6.9271],
              country: 'LK', // Restrict to Sri Lanka only
              sessionToken: sessionTokenRef.current
            });

            // Check if request was aborted
            if (signal.aborted) {
              console.log(`❌ [Request ${requestId}] Aborted during Mapbox Autofill`);
              return null;
            }

            if (autofillResult && autofillResult.suggestions && autofillResult.suggestions.length > 0) {
              console.log(`✅ [Request ${requestId}] Mapbox Autofill found suggestions:`, autofillResult.suggestions.length);
              suggestions = autofillResult.suggestions.map((suggestion: any) => ({
                id: suggestion.mapbox_id || suggestion.action?.id || Math.random().toString(),
                place_name: suggestion.place_name || suggestion.full_address,
                full_address: suggestion.full_address,
                center: suggestion.center,
                action: suggestion.action,
                source: 'mapbox-autofill'
              }));
            }
          } catch (autofillError: any) {
            if (autofillError.name === 'AbortError') {
              console.log(`❌ [Request ${requestId}] Mapbox Autofill aborted`);
              return null;
            }
            console.log(`⚠️ [Request ${requestId}] Mapbox Autofill failed:`, autofillError);
          }
        }

        // Final fallback to Mapbox Geocoding
        if (suggestions.length === 0 && !signal.aborted) {
          console.log(`🗺️ [Request ${requestId}] Final fallback: Mapbox Geocoding API...`);
          
          try {
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                `access_token=${mapboxToken}&` +
                `country=LK&` +
                `limit=6&` +
                `types=address,poi,place,locality&` +
                `proximity=79.8612,6.9271&` +
                `autocomplete=true&` +
                `language=en`,
                { signal }
              );

              if (response.ok) {
                const data = await response.json();
                console.log(`✅ [Request ${requestId}] Mapbox Geocoding found suggestions:`, data.features?.length || 0);
                
                if (data.features && data.features.length > 0) {
                  suggestions = data.features.map((feature: any) => ({
                    id: feature.id,
                    place_name: feature.place_name,
                    full_address: feature.place_name,
                    center: feature.center,
                    source: 'mapbox-geocoding'
                  }));
                }
              }
            } catch (fetchError: any) {
              if (fetchError.name === 'AbortError' || signal.aborted) {
                console.log(`❌ [Request ${requestId}] Mapbox Geocoding aborted`);
                return null;
              }
              throw fetchError; // Re-throw non-abort errors
            }
          } catch (geocodingError: any) {
            if (geocodingError.name === 'AbortError' || signal.aborted) {
              console.log(`❌ [Request ${requestId}] Mapbox Geocoding aborted`);
              return null;
            }
            console.log(`⚠️ [Request ${requestId}] Mapbox Geocoding failed:`, geocodingError);
          }
        }
      }
    }

    console.log(`💡 [Request ${requestId}] Final result: ${suggestions.length} suggestions from ${suggestions[0]?.source || 'no source'}`);
    return suggestions;
  }, [initializeAutofill]);

  const searchPlaces = useCallback((query: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear suggestions immediately for short queries
    if (query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce search with 350ms delay (optimal for autocomplete)
    debounceTimerRef.current = window.setTimeout(() => {
      // Generate unique request ID for monotonic ordering
      const requestId = ++currentRequestIdRef.current;
      
      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Wrap the entire operation in a proper promise chain to handle rejections
      (async () => {
        try {
          const result = await performSearch(query, requestId, abortController.signal);
          
          // Only update state if this is still the latest request (monotonic guard)
          if (requestId === currentRequestIdRef.current && result !== null) {
            setSuggestions(result);
          } else if (requestId !== currentRequestIdRef.current) {
            console.log(`🚫 [Request ${requestId}] Discarded stale response (current: ${currentRequestIdRef.current})`);
          }
          
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`❌ [Request ${requestId}] Search aborted`);
          } else {
            console.error(`❌ [Request ${requestId}] Search failed:`, error);
            // Only clear suggestions if this is still the latest request
            if (requestId === currentRequestIdRef.current) {
              setSuggestions([]);
            }
          }
        } finally {
          // Only update loading state if this is still the latest request
          if (requestId === currentRequestIdRef.current) {
            setIsLoading(false);
          }
        }
      })().catch((error: any) => {
        // Final catch for any unhandled rejections
        if (error.name !== 'AbortError') {
          console.error(`❌ [Request ${requestId}] Unhandled search error:`, error);
        }
      });
    }, 350);
  }, [performSearch]);

  const retrievePlace = useCallback(async (suggestion: LocationSuggestion) => {
    try {
      const autofill = await initializeAutofill();
      if (!autofill || !suggestion.action) {
        console.warn('Cannot retrieve coordinates - autofill not available or no action');
        return suggestion;
      }

      console.log('📍 Retrieving coordinates for:', suggestion.full_address);

      // Step 2: Retrieve the full details including coordinates
      const result = await autofill.retrieve(suggestion, {
        sessionToken: sessionTokenRef.current
      });

      if (result && result.features && result.features.length > 0) {
        const feature = result.features[0];
        return {
          ...suggestion,
          center: feature.geometry.coordinates as [number, number]
        };
      }

      return suggestion;
    } catch (error) {
      console.error('Error retrieving place details:', error);
      return suggestion;
    }
  }, [initializeAutofill]);

  return {
    suggestions,
    isLoading,
    searchPlaces,
    retrievePlace
  };
};