import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import DriverDashboard from "@/components/dashboard/DriverDashboard";

const DriverDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
        <DriverDashboard />
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DriverDashboardPage;