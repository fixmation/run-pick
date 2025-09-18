import { Car, UtensilsCrossed, Package, Users, TrendingUp, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Rides",
      value: "12,546",
      change: "+12%",
      icon: Car,
      color: "text-primary"
    },
    {
      title: "Food Orders",
      value: "8,932",
      change: "+18%", 
      icon: UtensilsCrossed,
      color: "text-secondary"
    },
    {
      title: "Parcels Delivered",
      value: "5,721",
      change: "+25%",
      icon: Package,
      color: "text-success"
    },
    {
      title: "Active Users",
      value: "45,892",
      change: "+8%",
      icon: Users,
      color: "text-primary"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "ride",
      description: "Ride booked from Colombo to Kandy",
      time: "2 min ago",
      status: "completed"
    },
    {
      id: 2,
      type: "food",
      description: "Food order from Pizza Palace",
      time: "5 min ago",
      status: "preparing"
    },
    {
      id: 3,
      type: "parcel",
      description: "Parcel delivery to Galle",
      time: "10 min ago",
      status: "in-transit"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-success">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="font-medium">4.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completion Rate</span>
              <span className="font-medium text-success">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Response Time</span>
              <span className="font-medium">&lt; 2 min</span>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Detailed Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;