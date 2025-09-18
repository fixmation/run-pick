import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Home, 
  User, 
  CreditCard, 
  Gift, 
  Settings,
  LogIn
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  authRequired?: boolean;
}

// Mobile navigation based on PDF page 3 specifications: Profile, Payment, Home, Promo, Settings
const navItems: NavItem[] = [
  { path: "/profile", icon: User, label: "Profile", authRequired: true },
  { path: "/payment", icon: CreditCard, label: "Payment", authRequired: true },
  { path: "/", icon: Home, label: "Home" },
  { path: "/promo", icon: Gift, label: "Promo" },
  { path: "/settings", icon: Settings, label: "Settings", authRequired: true },
];

export default function MobileBottomNavNew() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);

  // Update CSS variable for floating button positioning
  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        const height = navRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--bottom-nav-height', `${height}px`);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    window.addEventListener('orientationchange', updateNavHeight);

    return () => {
      window.removeEventListener('resize', updateNavHeight);
      window.removeEventListener('orientationchange', updateNavHeight);
    };
  }, []);

  const handleNavClick = (path: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      navigate('/auth');
      return;
    }
    
    if (path === "/promo") {
      toast.info("Promo section coming soon! 🎁", {
        duration: 5000,
        dismissible: true,
        closeButton: true
      });
      return;
    }
    
    navigate(path);
  };

  return (
    <>      
      <div ref={navRef} className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-3 sm:hidden shadow-lg">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isSettingsButton = item.path === "/settings";
          const Icon = isSettingsButton && !user ? LogIn : item.icon;
          const label = isSettingsButton && !user ? "Sign In" : item.label;
          const isActive = location === item.path;
          const isDisabled = item.authRequired && !user && !isSettingsButton;

          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex-col h-14 flex-1 max-w-[75px] p-1 min-h-[56px] ${
                isActive 
                  ? 'text-blue-600 bg-blue-100 border border-blue-200' 
                  : isDisabled 
                  ? 'text-gray-500 bg-gray-50 border border-gray-200' 
                  : 'text-gray-700 bg-white border border-gray-100 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
              } rounded-lg transition-all duration-200 shadow-sm`}
              onClick={() => handleNavClick(item.path, item.authRequired)}
              disabled={isDisabled}
            >
              <Icon className={`h-5 w-5 mb-1 ${
                isActive ? 'text-blue-600' : 
                isDisabled ? 'text-gray-500' : 'text-gray-700'
              }`} />
              <span className={`text-[10px] font-medium leading-tight ${
                isActive ? 'text-blue-600' : 
                isDisabled ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-b-full"></div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
      
    </>
  );
}