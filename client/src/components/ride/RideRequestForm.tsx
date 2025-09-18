import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Clock, Car, DollarSign } from "lucide-react";

const rideRequestSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  pickupLatitude: z.string().optional(),
  pickupLongitude: z.string().optional(),
  dropoffLatitude: z.string().optional(),
  dropoffLongitude: z.string().optional(),
  pickupTime: z.string().min(1, "Pickup time is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
});

type RideRequestForm = z.infer<typeof rideRequestSchema>;

interface FareEstimate {
  fare: number;
  distance: number;
  duration: number;
}

export default function RideRequestForm() {
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RideRequestForm>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      pickupLocation: "",
      dropoffLocation: "",
      pickupLatitude: "",
      pickupLongitude: "",
      dropoffLatitude: "",
      dropoffLongitude: "",
      pickupTime: "",
      vehicleType: "",
    },
  });

  const requestRideMutation = useMutation({
    mutationFn: async (data: RideRequestForm) => {
      const response = await fetch("/api/rides/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to request ride");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Ride Requested Successfully",
        description: `Your ride has been requested. Estimated fare: LKR ${data.estimatedFare}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      form.reset();
      setFareEstimate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getFareEstimate = async () => {
    const values = form.getValues();
    
    if (!values.pickupLatitude || !values.pickupLongitude || 
        !values.dropoffLatitude || !values.dropoffLongitude || 
        !values.vehicleType) {
      toast({
        title: "Missing Information",
        description: "Please provide pickup/dropoff coordinates and vehicle type for fare estimate",
        variant: "destructive",
      });
      return;
    }

    setIsEstimating(true);
    try {
      const response = await fetch("/api/rides/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLatitude: values.pickupLatitude,
          pickupLongitude: values.pickupLongitude,
          dropoffLatitude: values.dropoffLatitude,
          dropoffLongitude: values.dropoffLongitude,
          vehicleType: values.vehicleType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get fare estimate");
      }

      const estimate = await response.json();
      setFareEstimate(estimate);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get fare estimate",
        variant: "destructive",
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const onSubmit = (data: RideRequestForm) => {
    requestRideMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Request a Ride
        </CardTitle>
        <CardDescription>
          Book a taxi for your journey in Sri Lanka
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Pickup Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pickup address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dropoffLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dropoff Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter destination address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupLatitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 6.9271" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickupLongitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 79.8612" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dropoffLatitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dropoff Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 6.9271" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dropoffLongitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dropoff Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 79.8612" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Pickup Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tuk-tuk">Tuk-Tuk</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={getFareEstimate}
                disabled={isEstimating}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {isEstimating ? "Estimating..." : "Get Fare Estimate"}
              </Button>

              <Button 
                type="submit" 
                disabled={requestRideMutation.isPending}
                className="flex-1"
              >
                {requestRideMutation.isPending ? "Requesting..." : "Request Ride"}
              </Button>
            </div>

            {fareEstimate && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Fare Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        LKR {fareEstimate.fare}
                      </p>
                      <p className="text-sm text-gray-600">Estimated Fare</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {fareEstimate.distance} km
                      </p>
                      <p className="text-sm text-gray-600">Distance</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {fareEstimate.duration} min
                      </p>
                      <p className="text-sm text-gray-600">Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}