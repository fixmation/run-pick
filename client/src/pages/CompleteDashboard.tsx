import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import DriverDashboard from "@/components/dashboard/DriverDashboard";
import VendorDashboard from "@/components/dashboard/VendorDashboard";
import { useAuth } from "@/contexts/AuthContext";

const CompleteDashboard = () => {
  const { user, isLoading } = useAuth();
  const [userRole, setUserRole] = useState<string>('customer');
  const [userName, setUserName] = useState<string>('Guest User');
  
  // Update role and name when user changes
  useEffect(() => {
    if (user) {
      setUserRole(user.role);
      setUserName(user.username);
      console.log('User authenticated with role:', user.role, 'username:', user.username);
    } else {
      setUserRole('customer');
      setUserName('Guest User');
      console.log('No user authenticated, using guest defaults');
    }
  }, [user]);

  const renderDashboard = () => {
    console.log('Rendering dashboard for role:', userRole, 'user:', user);
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "driver":
        return <DriverDashboard />;
      case "vendor":
        return <VendorDashboard />;
      case "customer":
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
        {renderDashboard()}
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default CompleteDashboard;