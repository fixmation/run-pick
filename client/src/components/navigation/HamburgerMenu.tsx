import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar';
import LanguageSelector from '@/components/common/LanguageSelector';
import { 
  Menu,
  Car,
  Truck,
  UtensilsCrossed,
  Package,
  Flame,
  ShoppingCart,
  Bus,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Shield,
  BarChart3,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  LogIn,
  Accessibility,
  AlertTriangle
} from 'lucide-react';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  authRequired?: boolean;
  adminOnly?: boolean;
  comingSoon?: boolean;
  isContactInfo?: boolean;
  contactData?: string;
  isAccessibility?: boolean;
}

const menuSections: MenuSection[] = [
  {
    title: "Services",
    items: [
      { path: "/taxi", icon: Car, label: "Car Booking" },
      { path: "/lorry", icon: Truck, label: "Lorry Booking" },
      { path: "/movers", icon: Truck, label: "Movers" },
      { path: "/food", icon: UtensilsCrossed, label: "Food Delivery" },
      { path: "/supermarket-shopping", icon: ShoppingCart, label: "Supermarket" },
      { path: "/gas-delivery", icon: Flame, label: "Gas Delivery" },
      { path: "/parcel", icon: Package, label: "Parcel Delivery" },
      { path: "#", icon: Bus, label: "Bus Booking", comingSoon: true },
    ]
  },
  {
    title: "Account",
    items: [
      { path: "/dashboard", icon: User, label: "Dashboard", authRequired: true },
      { path: "/settings", icon: Settings, label: "Settings" },
      { path: "/admin-dashboard", icon: Shield, label: "Admin Panel", authRequired: true, adminOnly: true },
      { path: "/analytics", icon: BarChart3, label: "Analytics", authRequired: true, adminOnly: true },
    ]
  },
  {
    title: "Partners",
    items: [
      { path: "/driver-application", icon: Car, label: "Become a Driver" },
      { path: "/restaurant-application", icon: UtensilsCrossed, label: "Restaurant Partner" },
      { path: "/delivery-partner", icon: Package, label: "Delivery Partner" },
      { path: "/partner-support", icon: HelpCircle, label: "Partner Support" },
    ]
  },
  {
    title: "Contact Us",
    items: [
      { path: "#", icon: Phone, label: "071 1558 055", isContactInfo: true },
      { path: "#", icon: Phone, label: "077 637 8630", isContactInfo: true },
      { path: "#", icon: Phone, label: "075 1111 221", isContactInfo: true },
      { path: "#", icon: Mail, label: "runpicktransport@gmail.com", isContactInfo: true },
      { path: "#", icon: MapPin, label: "BL-1/6, Gunasinghapura, Colombo 12, Sri Lanka", isContactInfo: true },
    ]
  },
  {
    title: "Support",
    items: [
      { path: "/become-partner", icon: UserPlus, label: "Become Partner" },
      { path: "/help", icon: HelpCircle, label: "Help & Support" },
      { path: "#", icon: Accessibility, label: "Accessibility", isAccessibility: true },
    ]
  }
];

export default function HamburgerMenu() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showAccessibilityToolbar, setShowAccessibilityToolbar] = useState(false);

  const handleEmergencySOS = () => {
    // Emergency SOS functionality for mobile
    const emergencyNumber = "+94776378630"; // E.164 format
    const displayNumber = "077 637 8630";
    
    // Add vibration feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Always try tel: link first - mobile browsers handle this well
    window.location.href = `tel:${emergencyNumber}`;
    
    // Close the menu after action
    setOpen(false);
  };

  const handleNavClick = (path: string, authRequired?: boolean, adminOnly?: boolean, comingSoon?: boolean, isContactInfo?: boolean, isAccessibility?: boolean) => {
    if (comingSoon || isContactInfo) return;
    
    if (isAccessibility) {
      setShowAccessibilityToolbar(true);
      setOpen(false);
      return;
    }
    
    if (authRequired && !user) {
      navigate('/auth');
      setOpen(false);
      return;
    }
    
    if (adminOnly && user?.role !== 'admin') {
      return;
    }
    
    navigate(path);
    setOpen(false);
  };

  const handleSignInClick = () => {
    navigate('/auth');
    setOpen(false);
  };

  const handleContactClick = (label: string, icon: React.ComponentType) => {
    if (label.includes('@')) {
      // Email
      window.location.href = `mailto:${label}`;
    } else if (label.match(/\d{3}.*\d{3}.*\d{3}/)) {
      // Phone numbers
      const phoneNumber = label.split(',')[0].trim().replace(/\s/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
    // For address, do nothing - just display
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <SheetTitle className="text-white text-left">
            Run Pick
          </SheetTitle>
          <div className="text-sm opacity-90">
            Everything. Everywhere.
          </div>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Emergency SOS Button - Top Priority */}
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <Button
              onClick={handleEmergencySOS}
              className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg motion-safe:animate-pulse hover:animate-none transition-all duration-200 font-semibold h-12"
              data-testid="mobile-emergency-sos-button"
              aria-label="Emergency SOS - Call emergency services"
            >
              <AlertTriangle className="w-5 h-5 mr-2" aria-hidden="true" />
              <span className="text-base font-bold">EMERGENCY SOS</span>
              <Phone className="w-4 h-4 ml-2" aria-hidden="true" />
              <span className="sr-only">Emergency SOS Button - Click to call emergency services</span>
            </Button>
            <p className="text-xs text-red-600 text-center mt-2">
              24/7 Emergency Hotline: 077 637 8630
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <h3 className="px-6 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    const isDisabled = (item.adminOnly && user?.role !== 'admin');
                    const needsAuth = (item.authRequired && !user);
                    
                    return (
                      <Button
                        key={itemIndex}
                        variant="ghost"
                        className={`w-full justify-start px-6 py-4 h-12 min-h-[48px] ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600 font-medium' 
                            : isDisabled 
                            ? 'text-gray-500 bg-gray-50 cursor-not-allowed border border-gray-200' 
                            : needsAuth
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200'
                            : item.comingSoon
                            ? 'text-gray-500 bg-gray-50 cursor-not-allowed border border-gray-200'
                            : item.isContactInfo
                            ? 'text-gray-800 bg-white hover:bg-blue-50 hover:text-blue-700 cursor-pointer border border-gray-100'
                            : 'text-gray-800 bg-white hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                        }`}
                        onClick={() => 
                          item.isContactInfo 
                            ? handleContactClick(item.label, item.icon)
                            : handleNavClick(item.path, item.authRequired, item.adminOnly, item.comingSoon, item.isContactInfo, item.isAccessibility)
                        }
                        disabled={isDisabled || item.comingSoon}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${item.isContactInfo ? 'text-blue-500' : ''}`} />
                        <span className={`flex-1 text-left text-sm ${item.isContactInfo ? 'break-words' : ''}`}>
                          {item.label}
                        </span>
                        {item.comingSoon && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            Soon
                          </span>
                        )}
                        {needsAuth && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            Sign In
                          </span>
                        )}
                        {item.adminOnly && user?.role === 'admin' && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            Admin
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Language Selector Section */}
            <div className="mb-6">
              <h3 className="px-6 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {t('language.selector')}
              </h3>
              <div className="px-6">
                <LanguageSelector variant="mobile" showLabel={false} />
              </div>
            </div>
          </div>
          
          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0) || user.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.username || user.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role || 'Customer'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 min-h-[48px] bg-white border-gray-300 text-gray-800 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button
                  className="w-full justify-start h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  onClick={handleSignInClick}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In / Sign Up
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Join Run Pick to access all features
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
      
      
      {/* Accessibility Toolbar */}
      {showAccessibilityToolbar && (
        <div className="fixed inset-0 z-50">
          <div className="absolute top-4 right-4">
            <AccessibilityToolbar />
            <button 
              onClick={() => setShowAccessibilityToolbar(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}