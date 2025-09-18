import { useState } from "react";
import { 
  Store, 
  Plus, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Star, 
  MapPin, 
  Settings,
  Eye,
  Edit3,
  MoreHorizontal,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = [
    { label: "Total Revenue", value: "LKR 125,450", change: "+12%", icon: DollarSign },
    { label: "Orders Today", value: "47", change: "+8%", icon: BarChart3 },
    { label: "Average Rating", value: "4.8", change: "+0.2", icon: Star },
    { label: "Delivery Time", value: "28 min", change: "-3 min", icon: Clock },
  ];

  const restaurants = [
    {
      id: 1,
      name: "Golden Dragon Restaurant",
      address: "123 Main St, Colombo",
      status: "active",
      orders: 234,
      revenue: "LKR 89,500",
      rating: 4.7
    },
    {
      id: 2,
      name: "Spice Garden",
      address: "456 Galle Rd, Dehiwala",
      status: "pending",
      orders: 156,
      revenue: "LKR 65,200",
      rating: 4.5
    }
  ];

  const recentOrders = [
    { id: "#ORD-001", customer: "John Silva", items: "Chicken Rice, Kottu", amount: "LKR 1,250", status: "preparing", time: "2 min ago" },
    { id: "#ORD-002", customer: "Mary Fernando", items: "Fish Curry, Rice", amount: "LKR 980", status: "ready", time: "5 min ago" },
    { id: "#ORD-003", customer: "David Perera", items: "Fried Rice, Soup", amount: "LKR 1,100", status: "delivered", time: "12 min ago" },
    { id: "#ORD-004", customer: "Sarah Jayawardena", items: "Biriyani, Raita", amount: "LKR 1,450", status: "cancelled", time: "15 min ago" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 bg-[#ffeed8] p-3 md:p-6 rounded-lg">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 text-base md:text-lg">Manage your restaurants and orders</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
          <Link href="/analytics">
            <Button variant="outline" size="sm" className="w-full md:w-auto px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/add-restaurant">
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="w-full md:w-auto px-4 py-2 text-red-600 hover:text-red-700" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex min-w-full justify-start md:grid md:grid-cols-4 md:w-full">
            <TabsTrigger value="overview" className="whitespace-nowrap px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="restaurants" className="whitespace-nowrap px-3 py-2">Restaurants</TabsTrigger>
            <TabsTrigger value="orders" className="whitespace-nowrap px-3 py-2">Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap px-3 py-2">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Order ID</TableHead>
                      <TableHead className="whitespace-nowrap">Customer</TableHead>
                      <TableHead className="whitespace-nowrap">Items</TableHead>
                      <TableHead className="whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">{order.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle>My Restaurants</CardTitle>
              <Button size="sm" className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Restaurant
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{restaurant.address}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-sm">
                          <span>{restaurant.orders} orders</span>
                          <span>{restaurant.revenue}</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {restaurant.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2">
                      <Badge className={getStatusColor(restaurant.status)}>
                        {restaurant.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Order ID</TableHead>
                    <TableHead className="whitespace-nowrap">Customer</TableHead>
                    <TableHead className="whitespace-nowrap">Restaurant</TableHead>
                    <TableHead className="whitespace-nowrap">Items</TableHead>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Time</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>Golden Dragon</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">{order.time}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                            <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue chart will be displayed here
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Order statistics chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}