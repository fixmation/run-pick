import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MapboxHybridMap from "@/components/maps/MapboxHybridMap";
import LocationAutocomplete, { SelectedLocation } from "@/components/common/LocationAutocomplete";
import { Plus, X, MapPin, Navigation } from "lucide-react";

export default function MultiStopRouteTest() {
  const [stops, setStops] = useState<SelectedLocation[]>([]);
  const [currentStop, setCurrentStop] = useState("");

  const addStop = (location: SelectedLocation) => {
    if (stops.length < 10) { // Max 10 stops for testing
      setStops([...stops, location]);
      setCurrentStop("");
    }
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const clearAllStops = () => {
    setStops([]);
  };

  // Convert stops to waypoints for the map
  const waypoints = stops.map(stop => [stop.lng, stop.lat] as [number, number]);

  return (
    <div className="min-h-screen bg-[#ffeed8] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Multi-Stop Route Testing</h1>
          <p className="text-lg text-gray-600">Test routing with multiple waypoints across Sri Lanka</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Planning Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Route Planning
              </CardTitle>
              <CardDescription>
                Add up to 10 stops to test multi-waypoint routing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Stop Input */}
              <div className="space-y-2">
                <Label htmlFor="new-stop">Add Stop</Label>
                <LocationAutocomplete
                  label=""
                  placeholder="Enter a location in Sri Lanka..."
                  value={currentStop}
                  onChange={setCurrentStop}
                  onLocationSelect={addStop}
                  className="w-full"
                />
              </div>

              {/* Current Stops List */}
              {stops.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Route Stops ({stops.length})</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllStops}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stops.map((stop, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {stop.address}
                          </p>
                          <p className="text-xs text-gray-500">
                            {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStop(index)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Route Summary */}
              {stops.length >= 2 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Route Ready
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {stops.length} stops • Multi-waypoint route will be displayed on the map
                  </p>
                </div>
              )}

              {/* Test Suggestions */}
              <div className="space-y-2">
                <Label>Quick Test Routes</Label>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      const testRoute1 = [
                        { lat: 8.0302, lng: 79.8287, address: "Puttalam" },
                        { lat: 7.2906, lng: 80.6337, address: "Kurunegala" }, 
                        { lat: 6.9388, lng: 79.8542, address: "Colombo" }
                      ];
                      setStops(testRoute1);
                    }}
                  >
                    Puttalam → Kurunegala → Colombo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      const testRoute2 = [
                        { lat: 6.9388, lng: 79.8542, address: "Colombo" },
                        { lat: 6.0535, lng: 80.2210, address: "Galle" },
                        { lat: 5.9549, lng: 80.5550, address: "Matara" },
                        { lat: 6.1319, lng: 81.1185, address: "Hambantota" }
                      ];
                      setStops(testRoute2);
                    }}
                  >
                    Colombo → Galle → Matara → Hambantota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Display */}
          <Card>
            <CardHeader>
              <CardTitle>Live Route Map</CardTitle>
              <CardDescription>
                {stops.length >= 2 
                  ? `Showing route with ${stops.length} stops` 
                  : "Add at least 2 stops to see the route"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <MapboxHybridMap
                  center={stops.length > 0 ? [stops[0].lng, stops[0].lat] : [79.8612, 6.9271]}
                  zoom={stops.length > 5 ? 8 : 10}
                  markers={stops.map((stop, index) => ({
                    id: `stop-${index}`,
                    lat: stop.lat,
                    lng: stop.lng,
                    type: index === 0 ? 'pickup' : index === stops.length - 1 ? 'dropoff' : 'shop',
                    title: `Stop ${index + 1}: ${stop.address}`
                  }))}
                  routes={stops.length >= 2 ? [{
                    coordinates: waypoints,
                    color: '#8b5cf6' // Purple route
                  }] : []}
                  className="w-full h-full rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}