import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Car, 
  UtensilsCrossed, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  BarChart3,
  UserCheck,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import SimpleAdminCommission from '../commission/SimpleAdminCommission';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();

  const stats = [
    {
      title: "Total Users",
      value: "12,543",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+243 this month"
    },
    {
      title: "Active Drivers",
      value: "1,234",
      icon: Car,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "89% online now"
    },
    {
      title: "Total Revenue",
      value: "LKR 1.2M",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+18% from last month"
    },
    {
      title: "Commission",
      value: "LKR 180K",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "15% commission rate"
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "user",
      action: "New user registered",
      details: "Nimal Perera joined as customer",
      time: "2 mins ago",
      status: "info"
    },
    {
      id: 2,
      type: "driver",
      action: "Driver verification completed",
      details: "Kamal Silva verified and approved",
      time: "15 mins ago",
      status: "success"
    },
    {
      id: 3,
      type: "complaint",
      action: "Customer complaint received",
      details: "Late delivery complaint - Order #1234",
      time: "1 hour ago",
      status: "warning"
    },
    {
      id: 4,
      type: "payment",
      action: "Payment processed",
      details: "LKR 25,000 commission payout",
      time: "2 hours ago",
      status: "success"
    }
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "driver",
      name: "Saman Fernando",
      email: "saman@email.com",
      vehicle: "Toyota Prius - CAR-1234",
      documents: "License, Insurance, Registration",
      submittedAt: "2 hours ago"
    },
    {
      id: 2,
      type: "vendor",
      name: "Pizza Palace",
      email: "contact@pizzapalace.lk",
      category: "Restaurant",
      documents: "Business License, Health Certificate",
      submittedAt: "5 hours ago"
    }
  ];

  const systemStats = [
    { label: "Server Uptime", value: "99.9%", status: "good" },
    { label: "API Response Time", value: "150ms", status: "good" },
    { label: "Database Load", value: "67%", status: "warning" },
    { label: "Active Sessions", value: "2,341", status: "good" },
  ];

  const userGrowth = [
    { month: "Jan", customers: 800, drivers: 120, vendors: 45 },
    { month: "Feb", customers: 950, drivers: 145, vendors: 52 },
    { month: "Mar", customers: 1200, drivers: 180, vendors: 68 },
    { month: "Apr", customers: 1450, drivers: 220, vendors: 78 },
    { month: "May", customers: 1680, drivers: 265, vendors: 89 },
    { month: "Jun", customers: 1920, drivers: 310, vendors: 95 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 bg-[#ffeed8] p-3 md:p-6 rounded-lg">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-base md:text-lg">Monitor and manage the platform</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
          <Link href="/report-generator">
            <Button variant="outline" size="sm" className="w-full md:w-auto px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </Link>
          <Link href="/settings">
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
            <TabsTrigger value="users" className="whitespace-nowrap px-3 py-2">Users</TabsTrigger>
            <TabsTrigger value="approvals" className="whitespace-nowrap px-3 py-2">Approvals</TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap px-3 py-2">Analytics</TabsTrigger>
            <TabsTrigger value="commissions" className="whitespace-nowrap px-3 py-2">Commissions</TabsTrigger>
            <TabsTrigger value="system" className="whitespace-nowrap px-3 py-2">System</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-gray-600">{activity.details}</div>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getSystemStatusColor(stat.status)}`}>
                          {stat.value}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          stat.status === 'good' ? 'bg-green-500' : 
                          stat.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage customers, drivers, and vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:gap-4 md:space-y-0 mb-6">
                <Input placeholder="Search users..." className="w-full md:max-w-sm" />
                <div className="flex space-x-2 md:space-x-0 md:gap-2">
                  <Button variant="outline" className="flex-1 md:flex-none">Filter</Button>
                  <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: "Nimal Perera", email: "nimal@email.com", role: "Customer", status: "Active", joinDate: "2024-01-15" },
                  { name: "Kamal Silva", email: "kamal@email.com", role: "Driver", status: "Active", joinDate: "2024-02-20" },
                  { name: "Pizza Palace", email: "contact@pizzapalace.lk", role: "Vendor", status: "Pending", joinDate: "2024-03-10" }
                ].map((user, index) => (
                  <div key={index} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-gray-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500">Joined: {user.joinDate}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {user.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="mt-2 md:mt-0">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve driver and vendor applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {approval.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{approval.name}</div>
                          <div className="text-sm text-gray-600">{approval.email}</div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 capitalize">
                        {approval.type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          {approval.type === 'driver' ? 'Vehicle' : 'Category'}
                        </div>
                        <div className="font-medium">
                          {approval.type === 'driver' ? approval.vehicle : approval.category}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Documents</div>
                        <div className="font-medium">{approval.documents}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <span className="text-sm text-gray-500">Submitted {approval.submittedAt}</span>
                      <div className="flex flex-col space-y-2 md:flex-row md:gap-2 md:space-y-0">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          View Documents
                        </Button>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          Reject
                        </Button>
                        <Button size="sm" className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <SimpleAdminCommission />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userGrowth.map((month) => (
                  <div key={month.month} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{month.month} 2024</span>
                      <span className="text-sm text-gray-600">
                        Total: {month.customers + month.drivers + month.vendors}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{month.customers}</div>
                        <div className="text-sm text-gray-600">Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{month.drivers}</div>
                        <div className="text-sm text-gray-600">Drivers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{month.vendors}</div>
                        <div className="text-sm text-gray-600">Vendors</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Commission Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Taxi Commission (%)</label>
                      <Input type="number" defaultValue="15" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Food Commission (%)</label>
                      <Input type="number" defaultValue="20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Parcel Commission (%)</label>
                      <Input type="number" defaultValue="10" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Platform Settings</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 p-3 bg-gray-50 rounded-lg">
                      <span>Maintenance Mode</span>
                      <Button variant="outline" size="sm" className="w-full md:w-auto">Configure</Button>
                    </div>
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 p-3 bg-gray-50 rounded-lg">
                      <span>Notification Settings</span>
                      <Button variant="outline" size="sm" className="w-full md:w-auto">Configure</Button>
                    </div>
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 p-3 bg-gray-50 rounded-lg">
                      <span>Payment Gateway</span>
                      <Button variant="outline" size="sm" className="w-full md:w-auto">Configure</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;