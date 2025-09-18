import { useEffect, useState, useCallback } from 'react';

interface AccessibilityOptions {
  announceSteps?: boolean;
  keyboardNavigation?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Voice announcement function
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.announceSteps) return;

    // Create a live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Add to announcements state for logging
    setAnnouncements(prev => [...prev.slice(-4), message]);
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }, [options.announceSteps]);

  // Keyboard navigation helper
  const handleKeyNavigation = useCallback((event: KeyboardEvent, onEnter?: () => void, onEscape?: () => void) => {
    if (!options.keyboardNavigation) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [options.keyboardNavigation]);

  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => {
      const newValue = !prev;
      document.documentElement.classList.toggle('high-contrast', newValue);
      announce(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled');
      return newValue;
    });
  }, [announce]);

  // Toggle large text mode
  const toggleLargeText = useCallback(() => {
    setIsLargeText(prev => {
      const newValue = !prev;
      document.documentElement.classList.toggle('large-text', newValue);
      announce(newValue ? 'Large text mode enabled' : 'Large text mode disabled');
      return newValue;
    });
  }, [announce]);

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Skip to main content
  const skipToMain = useCallback(() => {
    focusElement('main, [role="main"], .main-content');
    announce('Skipped to main content');
  }, [focusElement, announce]);

  // Add accessibility styles on mount
  useEffect(() => {
    if (options.highContrast) {
      document.documentElement.classList.add('accessibility-enabled');
    }
    
    return () => {
      document.documentElement.classList.remove('accessibility-enabled', 'high-contrast', 'large-text');
    };
  }, [options.highContrast]);

  return {
    announce,
    handleKeyNavigation,
    toggleHighContrast,
    toggleLargeText,
    focusElement,
    skipToMain,
    isHighContrast,
    isLargeText,
    announcements
  };
};

export default useAccessibility;