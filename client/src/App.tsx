import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong:</h2>
        <pre className="text-sm bg-gray-200 p-4 rounded mb-4 max-w-lg overflow-auto">
          {error.message}
        </pre>
        <button 
          onClick={resetErrorBoundary}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import TaxiBooking from "@/pages/TaxiBooking";
import LorryBooking from "@/pages/LorryBooking";
import FoodDelivery from "@/pages/FoodDelivery";
import ParcelDelivery from "@/pages/ParcelDelivery";
import GasDelivery from "@/pages/GasDelivery";
import SupermarketShopping from "@/pages/SupermarketShopping";
import Movers from "@/pages/Movers";
import CompleteDashboard from "@/pages/CompleteDashboard";
import Dashboard from "@/pages/Dashboard";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import DriverDashboardPage from "@/pages/DriverDashboardPage";
import VendorDashboardPage from "@/pages/VendorDashboardPage";
import CustomerDashboardPage from "@/pages/CustomerDashboardPage";
import BecomePartner from "@/pages/BecomePartner";
import DriverApplication from "@/pages/DriverApplication";
import RestaurantApplication from "@/pages/RestaurantApplication";
import GetStarted from "@/pages/GetStarted";
import GetStartedPage from "@/pages/GetStartedPage";
import AuthPage from "@/pages/Auth";
import LearnMore from "@/pages/LearnMore";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Cookies from "@/pages/Cookies";
import ResetPassword from "@/pages/ResetPassword";
import DeliveryPartner from "@/pages/DeliveryPartner";
import PartnerSupport from "@/pages/PartnerSupport";
import ProgressDemo from "@/pages/ProgressDemo";
import Settings from "@/pages/Settings";
import SettingsPage from "@/pages/SettingsPage";
import Analytics from "@/pages/Analytics";
import ReportGenerator from "@/pages/ReportGenerator";
import AddRestaurant from "@/pages/AddRestaurant";
import TopUpWallet from "@/pages/TopUpWallet";
import Profile from "@/pages/Profile";
import Payment from "@/pages/Payment";
import Promo from "@/pages/Promo";
import PromoPage from "@/pages/PromoPage";
import MultiStopRouteTest from "@/pages/MultiStopRouteTest";

import { queryClient } from "@/lib/queryClient";

const App = () => (
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      console.error('App Error:', error, errorInfo);
    }}
  >
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <Switch>
            <Route path="/" component={Index} />
            <Route path="/taxi" component={TaxiBooking} />
            <Route path="/lorry" component={LorryBooking} />
            <Route path="/lorry-booking" component={LorryBooking} />
            <Route path="/food" component={FoodDelivery} />
            <Route path="/parcel" component={ParcelDelivery} />
            <Route path="/gas-delivery" component={GasDelivery} />
            <Route path="/supermarket-shopping" component={SupermarketShopping} />
            <Route path="/movers" component={Movers} />
            <Route path="/dashboard">
              <ProtectedRoute>
                <CompleteDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/admin-dashboard">
              <ProtectedRoute requiredRole={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/driver-dashboard">
              <ProtectedRoute requiredRole={['driver']}>
                <DriverDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/vendor-dashboard">
              <ProtectedRoute requiredRole={['vendor']}>
                <VendorDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/customer-dashboard">
              <ProtectedRoute requiredRole={['customer']}>
                <CustomerDashboardPage />
              </ProtectedRoute>
            </Route>
            <Route path="/simple-dashboard">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/learn-more" component={LearnMore} />
            <Route path="/become-partner" component={BecomePartner} />
            <Route path="/driver-application" component={DriverApplication} />
            <Route path="/restaurant-application" component={RestaurantApplication} />
            <Route path="/get-started" component={GetStartedPage} />
            <Route path="/get-started-old" component={GetStarted} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms-of-service" component={TermsOfService} />
            <Route path="/cookies" component={Cookies} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/delivery-partner" component={DeliveryPartner} />
            <Route path="/partner-support" component={PartnerSupport} />
            <Route path="/progress-demo" component={ProgressDemo} />
            <Route path="/settings">
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/analytics">
              <ProtectedRoute requiredRole={['admin', 'vendor']}>
                <Analytics />
              </ProtectedRoute>
            </Route>
            <Route path="/report-generator">
              <ProtectedRoute requiredRole={['admin']}>
                <ReportGenerator />
              </ProtectedRoute>
            </Route>
            <Route path="/add-restaurant">
              <ProtectedRoute requiredRole={['admin', 'vendor']}>
                <AddRestaurant />
              </ProtectedRoute>
            </Route>
            <Route path="/top-up-wallet">
              <ProtectedRoute>
                <TopUpWallet />
              </ProtectedRoute>
            </Route>
            <Route path="/profile">
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Route>
            <Route path="/payment">
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            </Route>
            <Route path="/promo" component={PromoPage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/multi-stop-test" component={MultiStopRouteTest} />
            <Route component={NotFound} />
          </Switch>
            </TooltipProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;