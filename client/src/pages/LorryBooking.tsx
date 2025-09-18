import React from 'react';
import ProductionRideBooking from '../components/ride/ProductionRideBooking';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileBottomNav from '../components/navigation/MobileBottomNav';

const LorryBooking: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef3c7] to-[#fde68a] flex flex-col">
      {/* Header - Hidden on mobile for native app feel */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile Native Header */}
      <div className="block md:hidden bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 text-center">Book a Lorry</h1>
        </div>
      </div>
      
      <main className="flex-1 overflow-y-auto">
        {/* Lorry booking interface with lorry vehicles */}
        <div className="pb-[calc(var(--bottom-nav-height,80px)+35px)] md:pb-6">
          <ProductionRideBooking vehicleFilter="lorry" />
        </div>
      </main>
      
      {/* Footer - Desktop only */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default LorryBooking;