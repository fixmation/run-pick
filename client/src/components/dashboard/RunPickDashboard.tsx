import { useState } from "react";
import { 
  Car, 
  UtensilsCrossed, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star,
  Clock,
  MapPin,
  Settings,
  Bell,
  CreditCard,
  BarChart3,
  Activity,
  Wallet,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

interface RunPickDashboardProps {
  role?: 'customer' | 'driver' | 'vendor' | 'admin';
  userName?: string;
}

const RunPickDashboard = ({ role = 'customer', userName = 'Guest User' }: RunPickDashboardProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Run Pick!</h1>
          <p className="text-gray-600 text-lg">Hello {userName}, manage your services and bookings</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <CreditCard className="w-4 h-4 mr-2" />
          Top Up Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-600">+3 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Orders</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-blue-600">+5 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcels Sent</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-orange-600">+2 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 2,450</div>
            <p className="text-xs text-purple-600">Last topped up: 2 days ago</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDriverDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome {userName}! Track your rides and earnings</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-green-100 text-green-800">Online</Badge>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 3,450</div>
            <p className="text-xs text-green-600">+12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-blue-600">Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-orange-600">⭐ Excellent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5h</div>
            <p className="text-xs text-purple-600">Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVendorDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome {userName}! Manage your restaurants</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Add New Restaurant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 15,450</div>
            <p className="text-xs text-green-600">+8% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-blue-600">+5 pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-orange-600">⭐ Very Good</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Restaurants</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-purple-600">All online</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome {userName}! Monitor and manage Run Pick platform</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Shield className="w-4 h-4 mr-2" />
            Admin Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,543</div>
            <p className="text-xs text-green-600">+243 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 1.2M</div>
            <p className="text-xs text-green-600">+18% growth</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Car className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-blue-600">89% online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission (8%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 180K</div>
            <p className="text-xs text-purple-600">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center p-4">
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4">
              <Activity className="w-5 h-5 mr-2" />
              System Health
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getRoleBasedContent = () => {
    switch (role) {
      case "admin":
        return renderAdminDashboard();
      case "driver":
        return renderDriverDashboard();
      case "vendor":
        return renderVendorDashboard();
      case "customer":
      default:
        return renderCustomerDashboard();
    }
  };

  return (
    <div className="space-y-8">
      {getRoleBasedContent()}
    </div>
  );
};

export default RunPickDashboard;