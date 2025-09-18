import { useLocation } from "wouter";
import { Home, Car, UtensilsCrossed, Package, User, LayoutDashboard, Flame, ShoppingCart, Truck, Cylinder, Store, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";


interface SubMenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  authRequired?: boolean;
}

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  authRequired?: boolean;
  subMenu?: SubMenuItem[];
}

const navItems: NavItem[] = [
  { path: "/", icon: Home, label: "Home" },
  { 
    path: "/ride", 
    icon: Car, 
    label: "Ride",
    subMenu: [
      { path: "/taxi", icon: Car, label: "Taxi" },
      { path: "/lorry", icon: Truck, label: "Lorry" },
    ]
  },
  { 
    path: "/shopping", 
    icon: ShoppingCart, 
    label: "Shopping",
    subMenu: [
      { path: "/food", icon: UtensilsCrossed, label: "Food" },
      { path: "/supermarket-shopping", icon: Store, label: "Supermarket" },
      { path: "/gas-delivery", icon: Cylinder, label: "Gas" },
    ]
  },
  { path: "/parcel", icon: Package, label: "Parcel" },
  { path: "/profile", icon: User, label: "Profile", authRequired: true },
];

export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const handleNavClick = (item: NavItem, authRequired?: boolean) => {
    if (authRequired && !user) {
      navigate('/auth');
      return;
    }
    
    // If item has submenu, toggle popup
    if (item.subMenu) {
      setActivePopup(activePopup === item.path ? null : item.path);
      return;
    }
    
    // For profile, redirect to appropriate dashboard based on user role
    if (item.path === "/profile" && user) {
      switch(user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'driver':
          navigate('/driver-dashboard');
          break;
        case 'vendor':
          navigate('/vendor-dashboard');
          break;
        case 'customer':
        default:
          navigate('/customer-dashboard');
          break;
      }
      return;
    }
    
    navigate(item.path);
    setActivePopup(null);
  };
  
  const handleSubMenuClick = (path: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      navigate('/auth');
      return;
    }
    
    navigate(path);
    setActivePopup(null);
  };

  const getDashboardPath = () => {
    if (!user) return '/profile';
    switch(user.role) {
      case 'admin': return '/admin-dashboard';
      case 'driver': return '/driver-dashboard';
      case 'vendor': return '/vendor-dashboard';
      case 'customer':
      default: return '/customer-dashboard';
    }
  };

  return (
    <>
      {/* Popup Menus */}
      {activePopup && (
        <div 
          className="fixed inset-0 z-[10000] sm:hidden" 
          onClick={() => setActivePopup(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setActivePopup(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          data-testid="nav-popup-overlay"
        >
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[200px]">
              {navItems.find(item => item.path === activePopup)?.subMenu?.map((subItem) => {
                const SubIcon = subItem.icon;
                const isDisabled = subItem.authRequired && !user;
                
                return (
                  <Button
                    key={subItem.path}
                    variant="ghost"
                    className={`w-full justify-start h-12 px-4 rounded-none border-b border-gray-100 last:border-b-0 ${
                      isDisabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubMenuClick(subItem.path, subItem.authRequired);
                    }}
                    disabled={isDisabled}
                    data-testid={`nav-submenu-${subItem.label.toLowerCase()}`}
                    role="menuitem"
                  >
                    <SubIcon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{subItem.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-50/95 via-orange-25/90 to-yellow-50/95 backdrop-blur-md border-t border-orange-200/30 px-1 py-1 sm:hidden">
        <div className="flex justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isProfileButton = item.path === "/profile";
            const currentPath = isProfileButton ? getDashboardPath() : item.path;
            const isActive = location === currentPath || (item.subMenu && item.subMenu.some(sub => sub.path === location)) || 
                             (item.path === '/ride' && (location === '/taxi' || location === '/lorry')) ||
                             (item.path === '/shopping' && (location === '/food' || location === '/supermarket-shopping' || location === '/gas-delivery'));
            const isDisabled = item.authRequired && !user;
            const hasPopup = !!item.subMenu;
            const isPopupOpen = activePopup === item.path;

            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={`flex-col h-14 flex-1 max-w-[60px] p-1 relative ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : isDisabled 
                    ? 'text-gray-400' 
                    : 'text-gray-600 hover:text-blue-600'
                } ${
                  isPopupOpen ? 'bg-blue-100 text-blue-700' : ''
                }`}
                onClick={() => handleNavClick(item, item.authRequired)}
                data-testid={`nav-button-${item.label.toLowerCase()}`}
                role={hasPopup ? "button" : "link"}
                aria-expanded={hasPopup ? isPopupOpen : undefined}
                aria-haspopup={hasPopup ? "menu" : undefined}
              >
                <div className="flex items-center justify-center relative">
                  <Icon className="h-4 w-4" />
                  {hasPopup && (
                    <ChevronUp className={`h-2 w-2 absolute -top-1 -right-2 transition-transform duration-200 ${
                      isPopupOpen ? 'rotate-180' : ''
                    }`} />
                  )}
                </div>
                <span className="text-xs mt-1">
                  {isProfileButton && !user ? "Sign In" : item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}