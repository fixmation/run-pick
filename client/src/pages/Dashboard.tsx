import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  UtensilsCrossed, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Settings,
  BarChart3,
  Star,
  Clock,
  Wallet
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from 'wouter';

const Dashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // If no user is authenticated, show a simple dashboard
  const renderGuestDashboard = () => (
    <div className="space-y-6 bg-[#ffeed8] p-6 rounded-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Run Pick Dashboard</h1>
        <p className="text-gray-600 text-lg mb-8">Please sign in to access your personalized dashboard</p>
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          Sign In
        </Button>
      </div>
      
      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,543</div>
            <p className="text-xs text-gray-600">+20% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-gray-600">89% online now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,942</div>
            <p className="text-xs text-gray-600">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 1.2M</div>
            <p className="text-xs text-gray-600">+18% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUserDashboard = () => {
    if (!user) return renderGuestDashboard();

    const getDashboardByRole = () => {
      switch (user.role) {
        case "admin":
          return (
            <div className="space-y-6 bg-[#ffeed8] p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 text-lg">Welcome {user.username}! Monitor and manage the platform</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12,543</div>
                    <p className="text-xs text-green-600">+243 this month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Platform Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">LKR 1.2M</div>
                    <p className="text-xs text-green-600">+18% growth</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Active Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-blue-600">89% online</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Commission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">LKR 180K</div>
                    <p className="text-xs text-purple-600">15% rate</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          );

        case "driver":
          return (
            <div className="space-y-6 bg-[#ffeed8] p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                  <p className="text-gray-600 text-lg">Welcome {user.username}! Track your rides and earnings</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Today's Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">LKR 3,450</div>
                    <p className="text-xs text-green-600">+12% from yesterday</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Completed Rides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-blue-600">Today</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <p className="text-xs text-orange-600">⭐ Excellent</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Online Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6.5h</div>
                    <p className="text-xs text-purple-600">Today</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          );

        case "vendor":
          return (
            <div className="space-y-6 bg-[#ffeed8] p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
                  <p className="text-gray-600 text-lg">Welcome {user.username}! Manage your restaurants</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  Add Restaurant
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Today's Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">LKR 15,450</div>
                    <p className="text-xs text-green-600">+8% from yesterday</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Orders Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-blue-600">+5 pending</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.6</div>
                    <p className="text-xs text-orange-600">⭐ Very Good</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Active Restaurants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-purple-600">All online</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          );

        default: // customer
          return (
            <div className="space-y-6 bg-[#ffeed8] p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
                  <p className="text-gray-600 text-lg">Welcome {user.username}! Your activity summary</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Top Up Wallet
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Rides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-green-600">+3 this month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Food Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">18</div>
                    <p className="text-xs text-blue-600">+5 this month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Parcels Sent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-orange-600">+2 this month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Wallet Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">LKR 2,450</div>
                    <p className="text-xs text-purple-600">Last topped up: 2 days ago</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
      }
    };

    return getDashboardByRole();
  };

  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
        {renderUserDashboard()}
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
      
    </div>
  );
};

export default Dashboard;