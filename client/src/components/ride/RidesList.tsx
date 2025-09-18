import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Car, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface TaxiBooking {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  vehicleType: string;
  status: string;
  fare: string;
  distance: string;
  duration: number;
  createdAt: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RidesList() {
  const { data: rides, isLoading, error } = useQuery<{ rides: TaxiBooking[] }>({
    queryKey: ["/api/rides"],
    queryFn: async () => {
      const response = await fetch("/api/rides");
      if (!response.ok) {
        throw new Error("Failed to fetch rides");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading rides: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!rides?.rides || rides.rides.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No rides found. Request your first ride!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Rides</h2>
      {rides.rides.map((ride) => (
        <Card key={ride.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Ride #{ride.id}
              </CardTitle>
              <Badge className={statusColors[ride.status as keyof typeof statusColors]}>
                {ride.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-medium">From:</span>
                <span>{ride.pickupLocation}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="font-medium">To:</span>
                <span>{ride.dropoffLocation}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Pickup Time</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(ride.pickupTime), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Vehicle</p>
                    <p className="text-sm text-gray-600 capitalize">{ride.vehicleType}</p>
                  </div>
                </div>

                {ride.fare && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Fare</p>
                      <p className="text-sm text-gray-600">LKR {ride.fare}</p>
                    </div>
                  </div>
                )}

                {ride.distance && (
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p className="text-sm text-gray-600">{ride.distance} km</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <span className="text-sm text-gray-500">
                  Requested: {format(new Date(ride.createdAt), "MMM dd, yyyy HH:mm")}
                </span>
                
                <div className="flex gap-2">
                  {ride.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}