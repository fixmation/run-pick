import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import FeaturesSection from "@/components/home/FeaturesSection";
import MobileBottomNavNew from "@/components/navigation/MobileBottomNavNew";
import HamburgerMenu from "@/components/navigation/HamburgerMenu";
import MobileFooterLinks from "@/components/navigation/MobileFooterLinks";
import LocationRecommendations from "@/components/recommendations/LocationRecommendations";
import OnboardingTutorial from "@/components/onboarding/OnboardingTutorial";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  // Check if user needs onboarding (deferred for performance)
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(`runpick-onboarding-${user?.role || 'customer'}`);

    // Show onboarding for new users (first visit) or if they haven't completed it
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 5000); // Delayed for better initial page load

      return () => clearTimeout(timer);
    }
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Hamburger Menu - Following PDF Page 3 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <HamburgerMenu />
          <h1 className="text-lg font-bold text-gray-900">Run Pick</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      <main className="pb-20 sm:pb-0 pt-16 md:pt-0">
        <HeroSection />
        <div className="container mx-auto px-4 max-w-6xl">
          <ServicesGrid />

          {/* Location-based recommendations section */}
          <div className="py-8">
            <LocationRecommendations 
              autoRefresh={false}
              maxRecommendations={3}
              onRecommendationClick={(recommendation, serviceType) => {
                console.log('Clicked recommendation:', recommendation, 'for service:', serviceType);
                // Handle recommendation click - could navigate to service page
              }}
            />
          </div>

          <FeaturesSection />
          <div className="py-4 flex justify-center">
          <Link href="/get-started">
            <Button size="xl" className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
              Ready to get started?
            </Button>
          </Link>
        </div>
        </div>
      </main>
      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNavNew />

      {/* Show onboarding tutorial for new users */}
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userRole={(user?.role as 'customer' | 'driver' | 'vendor') || 'customer'}
        onComplete={(completedSteps) => {
          console.log('Onboarding completed on homepage:', completedSteps);
          setShowOnboarding(false);
        }}
      />
    </div>
  );
};

export default Index;