// Environment configuration
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv & {
      readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
      readonly VITE_GEOAPIFY_API_KEY?: string;
    }
  }
}

let cachedMapboxToken: string | null = null;
let cachedGeoapifyKey: string | null = null;

export const getMapboxToken = async (): Promise<string> => {
  // Check if we have the environment variable directly
  if (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
    return import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  }
  
  // Check if we have a cached token
  if (cachedMapboxToken) {
    return cachedMapboxToken;
  }
  
  // Fetch from server
  try {
    const response = await fetch('/api/config/mapbox');
    const data = await response.json();
    
    if (data.accessToken) {
      cachedMapboxToken = data.accessToken;
      return data.accessToken;
    }
  } catch (error) {
    console.error('Failed to fetch Mapbox token:', error);
  }
  
  // If no token is found, return empty string and warn
  console.warn('Mapbox access token not found');
  return '';
};

export const getGeoapifyKey = async (): Promise<string> => {
  // Check if we have the environment variable directly
  if (import.meta.env.VITE_GEOAPIFY_API_KEY) {
    return import.meta.env.VITE_GEOAPIFY_API_KEY;
  }
  
  // Check if we have a cached key
  if (cachedGeoapifyKey) {
    return cachedGeoapifyKey;
  }
  
  // Fetch from server
  try {
    const response = await fetch('/api/config/geoapify');
    const data = await response.json();
    
    if (data.apiKey) {
      cachedGeoapifyKey = data.apiKey;
      return data.apiKey;
    }
  } catch (error) {
    console.error('Failed to fetch Geoapify key:', error);
  }
  
  // If no key is found, return empty string and warn
  console.warn('Geoapify API key not found');
  return '';
};