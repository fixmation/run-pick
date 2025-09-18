import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, Package, Wallet, Star, Clock, MapPin, CreditCard, History, Navigation, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RideBooking from "@/components/ride/RideBooking";
import AchievementDashboard from "@/components/achievements/AchievementDashboard";

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();

  const stats = [
    {
      title: "Total Rides",
      value: "24",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+3 this month"
    },
    {
      title: "Food Orders",
      value: "18",
      icon: UtensilsCrossed,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+5 this month"
    },
    {
      title: "Parcels Sent",
      value: "12",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+2 this month"
    },
    {
      title: "Wallet Balance",
      value: "LKR 2,450",
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "Last topped up: 2 days ago"
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "ride",
      title: "Ride to Colombo Airport",
      status: "completed",
      time: "2 hours ago",
      amount: "LKR 1,200",
      icon: Car,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "food",
      title: "Pizza Hut Order",
      status: "delivered",
      time: "1 day ago",
      amount: "LKR 850",
      icon: UtensilsCrossed,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "parcel",
      title: "Package to Kandy",
      status: "delivered",
      time: "3 days ago",
      amount: "LKR 400",
      icon: Package,
      color: "text-purple-600"
    },
    {
      id: 4,
      type: "ride",
      title: "Ride to Galle Fort",
      status: "completed",
      time: "5 days ago",
      amount: "LKR 2,100",
      icon: Car,
      color: "text-blue-600"
    }
  ];

  const favoriteRestaurants = [
    { name: "Pizza Hut", orders: 8, rating: 4.5 },
    { name: "KFC", orders: 6, rating: 4.2 },
    { name: "Perera Family Restaurant", orders: 4, rating: 4.8 }
  ];

  const frequentRoutes = [
    { from: "Home", to: "Office", rides: 15 },
    { from: "Office", to: "Airport", rides: 3 },
    { from: "Home", to: "Mall", rides: 6 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 bg-[#ffeed8] p-3 md:p-6 rounded-lg">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600 text-base md:text-lg">Welcome back! Here's your activity summary</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:gap-2 md:space-y-0">
          <Link href="/top-up-wallet">
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              <CreditCard className="w-4 h-4 mr-2" />
              Top Up Wallet
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="w-full md:w-auto px-4 py-2 text-red-600 hover:text-red-700" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex min-w-full justify-start md:grid md:grid-cols-6 md:w-full">
            <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="book-ride" className="whitespace-nowrap px-3 py-2">Book Ride</TabsTrigger>
            <TabsTrigger value="rides" className="whitespace-nowrap px-3 py-2">Rides</TabsTrigger>
            <TabsTrigger value="orders" className="whitespace-nowrap px-3 py-2">Orders</TabsTrigger>
            <TabsTrigger value="parcels" className="whitespace-nowrap px-3 py-2">Parcels</TabsTrigger>
            <TabsTrigger value="achievements" className="whitespace-nowrap px-3 py-2">🏆 Achievements</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="book-ride" className="space-y-6">
          <RideBooking />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full bg-white`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.time}</div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <div className="text-sm font-medium mt-1">{activity.amount}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Favorite Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoriteRestaurants.map((restaurant) => (
                    <div key={restaurant.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-600">{restaurant.orders} orders</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{restaurant.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Frequent Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Frequent Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {frequentRoutes.map((route, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <div>
                        <div className="font-medium">{route.from} → {route.to}</div>
                        <div className="text-sm text-gray-600">{route.rides} rides</div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        Book Again
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ride History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.filter(a => a.type === "ride").map((ride) => (
                  <div key={ride.id} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{ride.title}</div>
                        <div className="text-sm text-gray-600">{ride.time}</div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between md:text-right">
                      <div className="font-medium">{ride.amount}</div>
                      <Badge className={getStatusColor(ride.status)}>
                        {ride.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Food Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.filter(a => a.type === "food").map((order) => (
                  <div key={order.id} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">{order.title}</div>
                        <div className="text-sm text-gray-600">{order.time}</div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between md:text-right">
                      <div className="font-medium">{order.amount}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parcel History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.filter(a => a.type === "parcel").map((parcel) => (
                  <div key={parcel.id} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">{parcel.title}</div>
                        <div className="text-sm text-gray-600">{parcel.time}</div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between md:text-right">
                      <div className="font-medium">{parcel.amount}</div>
                      <Badge className={getStatusColor(parcel.status)}>
                        {parcel.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;