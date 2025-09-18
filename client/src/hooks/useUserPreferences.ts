import { useState, useEffect } from 'react';

export interface UserPreferences {
  // Theme & Display
  darkMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  soundEffects: boolean;
  notificationSound: string;
  
  // Location & Privacy
  locationServices: boolean;
  autoLocation: boolean;
  shareLocation: boolean;
  trackingOptOut: boolean;
  
  // Service Preferences
  defaultVehicleType: string;
  favoriteRestaurants: string[];
  frequentAddresses: Array<{ label: string; address: string }>;
  paymentMethod: string;
  
  // App Behavior
  autoRefresh: boolean;
  offlineMode: boolean;
  dataCompression: boolean;
  language: 'en' | 'si' | 'ta';
  
  // Security
  biometricAuth: boolean;
  sessionTimeout: number;
  twoFactorAuth: boolean;
}

const defaultPreferences: UserPreferences = {
  // Theme & Display
  darkMode: false,
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  
  // Notifications
  pushNotifications: true,
  emailNotifications: false,
  smsNotifications: true,
  soundEffects: true,
  notificationSound: 'default',
  
  // Location & Privacy
  locationServices: true,
  autoLocation: true,
  shareLocation: false,
  trackingOptOut: false,
  
  // Service Preferences
  defaultVehicleType: 'car',
  favoriteRestaurants: [],
  frequentAddresses: [],
  paymentMethod: 'cash',
  
  // App Behavior
  autoRefresh: true,
  offlineMode: false,
  dataCompression: true,
  language: 'en',
  
  // Security
  biometricAuth: false,
  sessionTimeout: 30,
  twoFactorAuth: false,
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('runpick_user_preferences');
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return defaultPreferences;
    }
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('runpick_user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [preferences]);

  // Apply theme changes to document
  useEffect(() => {
    const html = document.documentElement;
    
    if (preferences.darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    if (preferences.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    
    if (preferences.largeText) {
      html.classList.add('large-text');
    } else {
      html.classList.remove('large-text');
    }
    
    if (preferences.reducedMotion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }
  }, [preferences.darkMode, preferences.highContrast, preferences.largeText, preferences.reducedMotion]);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const exportPreferences = () => {
    return JSON.stringify(preferences, null, 2);
  };

  const importPreferences = (preferencesJson: string) => {
    try {
      const imported = JSON.parse(preferencesJson);
      setPreferences({ ...defaultPreferences, ...imported });
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  };

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences
  };
};