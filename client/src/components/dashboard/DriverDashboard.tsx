import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Package, DollarSign, Star, TrendingUp, Clock, MapPin, Phone, Navigation, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import DriverMap from "@/components/driver/DriverMap";
import DriverCommissionCard from "@/components/commission/DriverCommissionCard";
import { DriverNotificationManager } from "@/components/driver/DriverNotificationManager";

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleMakeModel, setVehicleMakeModel] = useState("");

  useEffect(() => {
    if (!licenseNumber || !insurancePolicyNumber || !vehicleNumber || !vehicleMakeModel) {
      console.log("Please ensure all vehicle and license details are entered.");
    }
  }, [licenseNumber, insurancePolicyNumber, vehicleNumber, vehicleMakeModel]);

  const stats = [
    {
      title: "Today's Earnings",
      value: "LKR 3,450",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12% from yesterday"
    },
    {
      title: "Completed Rides",
      value: "18",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "3 hours online"
    },
    {
      title: "Rating",
      value: "4.8",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "Based on 124 reviews"
    },
    {
      title: "This Week",
      value: "LKR 18,900",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+8% from last week"
    }
  ];

  const activeRequests = [
    {
      id: 1,
      type: "ride",
      customer: "Nimal Perera",
      from: "Colombo Fort",
      to: "Airport",
      distance: "32 km",
      fare: "LKR 2,100",
      pickupTime: "5 mins",
      phone: "+94 77 123 4567"
    },
    {
      id: 2,
      type: "parcel",
      customer: "Kamala Silva",
      from: "Kandy",
      to: "Galle",
      distance: "120 km",
      fare: "LKR 800",
      pickupTime: "10 mins",
      phone: "+94 71 234 5678"
    }
  ];

  const recentTrips = [
    {
      id: 1,
      customer: "Saman Fernando",
      from: "Malabe",
      to: "Negombo",
      distance: "45 km",
      fare: "LKR 1,800",
      time: "2 hours ago",
      rating: 5
    },
    {
      id: 2,
      customer: "Priya Wickramasinghe",
      from: "Kandy",
      to: "Matara",
      distance: "78 km",
      fare: "LKR 3,200",
      time: "4 hours ago",
      rating: 4
    }
  ];

  const driverLocation = { lat: 6.9271, lng: 79.8612 }; // Mock driver location

  return (
    <div className="space-y-4 md:space-y-6 bg-[#ffeed8] p-3 md:p-6 rounded-lg">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 text-base md:text-lg">Manage your rides and earnings</p>
        </div>
        <div className="flex items-center justify-between md:gap-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">
              {isOnline ? "Online" : "Offline"}
            </span>
            <Switch
              checked={isOnline}
              onCheckedChange={setIsOnline}
            />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="px-4 py-2">
                Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="px-4 py-2 text-red-600 hover:text-red-700" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex min-w-full justify-start md:grid md:grid-cols-4 md:w-full">
            <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="live-map" className="whitespace-nowrap px-3 py-2">Live Map</TabsTrigger>
            <TabsTrigger value="earnings" className="whitespace-nowrap px-3 py-2">Earnings</TabsTrigger>
            <TabsTrigger value="commission" className="whitespace-nowrap px-3 py-2">Commission</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {/* Active Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Active Ride Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={request.type === "ride" ? "default" : "secondary"}>
                          {request.type === "ride" ? "Ride" : "Parcel"}
                        </Badge>
                        <span className="font-medium">{request.customer}</span>
                      </div>
                      <div className="flex justify-between md:text-right">
                        <p className="font-bold text-green-600">{request.fare}</p>
                        <p className="text-sm text-gray-500 md:mt-1">Distance: {request.distance}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-4 md:space-y-0 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>From: {request.from}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        <span>To: {request.to}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>ETA: {request.pickupTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{request.phone}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">Decline</Button>
                        <Button size="sm" className="flex-1 md:flex-none">Accept</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-map" className="space-y-6">
          <DriverMap 
            driverLocation={driverLocation}
            isOnline={isOnline}
            onToggleOnline={setIsOnline}
          />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Today</p>
                    <p className="text-2xl font-bold text-green-700">LKR 3,450</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">This Week</p>
                    <p className="text-2xl font-bold text-blue-700">LKR 18,900</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-6">
          <DriverCommissionCard driverId={1} />
        </TabsContent>
      </Tabs>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Recent Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{trip.customer}</p>
                  <p className="text-sm text-gray-600">{trip.from} → {trip.to}</p>
                  <p className="text-xs text-gray-500">{trip.distance} • {trip.time}</p>
                </div>
                <div className="flex justify-between md:text-right">
                  <p className="font-bold text-green-600">{trip.fare}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{trip.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Notification Manager - Real-time order notifications */}
      <DriverNotificationManager />
    </div>
  );
};

export default DriverDashboard;