import { useState } from "react";
import { User, LogOut, Settings, ChevronDown, LayoutDashboard, Search, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import OnboardingAuth from "@/components/auth/OnboardingAuth";
import NotificationBell from "@/components/notifications/NotificationBell";
import LocationPicker from "@/components/common/LocationPicker";
import QuickSearch from "@/components/search/QuickSearch";
import OnboardingTutorial from "@/components/onboarding/OnboardingTutorial";
import HamburgerMenu from "@/components/navigation/HamburgerMenu";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import runpickLogoPath from "@assets/runpick-logo_1752764200329.png";

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleEmergencySOS = () => {
    // Emergency SOS functionality
    const emergencyNumber = "+94776378630"; // E.164 format
    const displayNumber = "077 637 8630";
    
    // Add vibration feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Always try tel: link first - modern browsers handle fallback gracefully
    const telLink = document.createElement('a');
    telLink.href = `tel:${emergencyNumber}`;
    telLink.click();
    
    // Fallback: Copy to clipboard with toast notification
    setTimeout(() => {
      navigator.clipboard.writeText(emergencyNumber).then(() => {
        // Use toast instead of alert for better UX
        const event = new CustomEvent('show-toast', {
          detail: {
            title: 'Emergency Number Copied',
            description: `${displayNumber} copied to clipboard`,
            type: 'success'
          }
        });
        window.dispatchEvent(event);
      }).catch(() => {
        // Graceful fallback for clipboard failure
        console.log('Emergency number:', displayNumber);
      });
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Floating Hamburger Menu for Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <HamburgerMenu />
      </div>

      {/* Desktop Header Only */}
      <header className="hidden md:block sticky top-0 z-50 w-full border-b border-orange-200/20 bg-gradient-to-r from-orange-100/80 via-orange-50/70 to-yellow-50/80 backdrop-blur-md supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-orange-100/60 supports-[backdrop-filter]:via-orange-50/50 supports-[backdrop-filter]:to-yellow-50/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src={runpickLogoPath} 
                alt="Run Pick" 
                className="w-10 h-10 rounded object-contain"
                style={{ borderRadius: '5px' }}
              />
            </Link>

            <div className="block">
              <LocationPicker />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/taxi" className="text-gray-600 hover:text-blue-600 transition-colors">
              {t('nav.taxi')}
            </Link>
            <Link href="/lorry" className="text-gray-600 hover:text-blue-600 transition-colors">
              Lorry
            </Link>
            <Link href="/movers" className="text-gray-600 hover:text-blue-600 transition-colors">
              Movers
            </Link>
            <Link href="/food" className="text-gray-600 hover:text-blue-600 transition-colors">
              {t('nav.food')}
            </Link>
            <Link href="/supermarket-shopping" className="text-gray-600 hover:text-blue-600 transition-colors">
              Supermarket
            </Link>
            <Link href="/gas-delivery" className="text-gray-600 hover:text-blue-600 transition-colors">
              Gas
            </Link>
            <Link href="/parcel" className="text-gray-600 hover:text-blue-600 transition-colors">
              {t('nav.parcel')}
            </Link>
            <span className="text-gray-400 cursor-not-allowed">
              Bus
            </span>
            <span className="text-gray-400 cursor-not-allowed">
              JCB
            </span>
            {user && (
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('nav.dashboard')}
              </Link>
            )}
          </nav>

          <Link href="/become-partner">
            <Button variant="ghost" size="sm">
              Become a Partner
            </Button>
          </Link>

          <LanguageSelector variant="desktop" />

          <NotificationBell 
            userId={user?.id} 
            userRole={user?.role} 
            onSignInRequested={() => setIsAuthModalOpen(true)}
          />

          {/* Emergency SOS Button */}
          <Button
            onClick={handleEmergencySOS}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg hover:shadow-red-200/50 motion-safe:animate-pulse hover:animate-none transition-all duration-200 font-semibold"
            size="sm"
            data-testid="emergency-sos-button"
            aria-label="Emergency SOS - Call emergency services"
            title="Emergency Contact: 077 637 8630"
          >
            <AlertTriangle className="w-4 h-4 mr-1" aria-hidden="true" />
            <span className="hidden lg:inline">SOS</span>
            <Phone className="w-3 h-3 ml-1 lg:hidden" aria-hidden="true" />
            <span className="sr-only">Emergency SOS Button - Click to call emergency services</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSearchOpen(true)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>Quick Search</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOnboardingOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Tutorial</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
          </div>
        </div>
      </header>

      <OnboardingAuth 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Quick Search Modal */}
      <QuickSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onResultSelect={(result) => {
          console.log('Selected result:', result);
          // Handle navigation based on result type
          if (result.type === 'taxi' || result.type === 'driver') {
            window.location.href = '/taxi';
          } else if (result.type === 'restaurant') {
            window.location.href = '/food';
          } else if (result.metadata?.service === 'parcel') {
            window.location.href = '/parcel';
          }
        }}
      />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userRole={(user?.role as 'customer' | 'driver' | 'vendor') || 'customer'}
        onComplete={(completedSteps) => {
          console.log('Onboarding completed:', completedSteps);
        }}
      />
    </>
  );
};

export default Header;