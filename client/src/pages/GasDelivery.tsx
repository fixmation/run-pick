
import { useState } from "react";
import { Flame, MapPin, Clock, Phone, ShieldCheck, ArrowRight, Map, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import LocationAutocomplete, { type SelectedLocation } from "@/components/common/LocationAutocomplete";
import { useToast } from "@/hooks/use-toast";
import GasAgentMap from "@/components/gas/GasAgentMap";

interface GasAgent {
  id: number;
  businessName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  isVerified: boolean;
  distance?: number;
  businessType: string;
}

const GasDelivery = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("book");
  const [selectedCylinder, setSelectedCylinder] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState<SelectedLocation | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [selectedGasAgent, setSelectedGasAgent] = useState<GasAgent | null>(null);

  const cylinderTypes = [
    { id: "12.5kg", name: "12.5kg LP Gas Cylinder", price: "LKR 3,500", popular: true },
    { id: "5kg", name: "5kg LP Gas Cylinder", price: "LKR 1,800", popular: false },
    { id: "2.5kg", name: "2.5kg LP Gas Cylinder", price: "LKR 950", popular: false },
    { id: "37.5kg", name: "37.5kg Commercial Cylinder", price: "LKR 9,500", popular: false },
  ];

  const gasProviders = [
    "Litro Gas Lanka",
    "Laugfs Gas",
    "Shell Gas",
    "Primogas",
    "Sungas"
  ];

  const handleBooking = () => {
    if (!selectedCylinder) {
      toast({
        title: "Gas cylinder required",
        description: "Please select a gas cylinder type",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please enter your delivery address",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryLocation) {
      toast({
        title: "Please select a valid address",
        description: "Choose an address from the suggestions for accurate delivery",
        variant: "destructive"
      });
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your contact number",
        variant: "destructive"
      });
      return;
    }
    
    // Enhanced booking with location data
    const bookingData = {
      cylinderType: selectedCylinder,
      deliveryAddress,
      deliveryLocation,
      phoneNumber,
      preferredTime: preferredTime || "anytime"
    };
    
    console.log('Gas delivery booking:', bookingData);
    toast({
      title: "Gas cylinder delivery booked successfully!",
      description: "We'll contact you shortly to confirm your order."
    });
    
    // Clear form after successful booking
    setSelectedCylinder("");
    setDeliveryAddress("");
    setDeliveryLocation(null);
    setPhoneNumber("");
    setPreferredTime("");
  };

  return (
    <div className="min-h-screen bg-[#fef3c7]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-[calc(var(--bottom-nav-height,80px)+35px)] sm:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <Flame className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gas Cylinder Delivery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Safe and reliable delivery of cooking gas cylinders to your doorstep. 
              Fast service with certified handling.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="book" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Book Gas Delivery
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Find Gas Agents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="book">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Booking Form */}
                <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  Book Your Gas Cylinder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="cylinder-type">Gas Cylinder Type *</Label>
                  <Select value={selectedCylinder} onValueChange={setSelectedCylinder} data-testid="select-cylinder-type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select cylinder type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cylinderTypes.map((cylinder) => (
                        <SelectItem key={cylinder.id} value={cylinder.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{cylinder.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-orange-600">{cylinder.price}</span>
                              {cylinder.popular && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gas-provider">Preferred Gas Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gas provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {gasProviders.map((provider) => (
                        <SelectItem key={provider} value={provider.toLowerCase().replace(/\s+/g, '-')}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <LocationAutocomplete
                  label="Delivery Address *"
                  placeholder="Enter your complete delivery address..."
                  value={deliveryAddress}
                  onChange={setDeliveryAddress}
                  onLocationSelect={(location) => setDeliveryLocation(location)}
                  showCurrentLocationButton={true}
                  onCurrentLocation={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setDeliveryLocation({
                            lat: latitude,
                            lng: longitude,
                            address: "Current Location"
                          });
                          setDeliveryAddress("Current Location");
                        },
                        (error) => {
                          console.error('Error getting current location:', error);
                          alert('Unable to get current location. Please enter address manually.');
                        }
                      );
                    }
                  }}
                />

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="077 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-phone-number"
                  />
                </div>

                <div>
                  <Label htmlFor="preferred-time">Preferred Delivery Time</Label>
                  <Select value={preferredTime} onValueChange={setPreferredTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12:00 PM - 4:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (4:00 PM - 8:00 PM)</SelectItem>
                      <SelectItem value="anytime">Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  size="lg"
                  data-testid="button-book-gas-delivery"
                >
                  Book Gas Delivery
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Service Features */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose Our Gas Delivery?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Safety First</h4>
                      <p className="text-sm text-gray-600">Certified handlers and proper safety equipment</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Fast Delivery</h4>
                      <p className="text-sm text-gray-600">Same-day delivery available in most areas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Customer support available round the clock</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Island-wide Service</h4>
                      <p className="text-sm text-gray-600">Delivery available across Sri Lanka</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cylinder Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cylinderTypes.map((cylinder) => (
                      <div key={cylinder.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-medium">{cylinder.name}</span>
                          {cylinder.popular && (
                            <Badge variant="secondary" className="ml-2 text-xs">Most Popular</Badge>
                          )}
                        </div>
                        <span className="font-semibold text-orange-600">{cylinder.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="map">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-orange-600" />
                      Gas Agents Near You
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Find certified gas agents in your area and book directly
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Flame className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Gas Agent Map</h3>
                        <p className="text-gray-600 mb-4">Interactive map showing certified gas agents in your area</p>
                        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                          {[
                            { name: "Lanka Gas Center", address: "Colombo 07", distance: "2.3km" },
                            { name: "Quick Gas Delivery", address: "Colombo 03", distance: "3.1km" },
                            { name: "City Gas Service", address: "Colombo 05", distance: "1.8km" }
                          ].map((agent, index) => (
                            <div 
                              key={index}
                              className="bg-white p-3 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedGasAgent({
                                id: index + 1,
                                businessName: agent.name,
                                address: agent.address,
                                latitude: 6.9271,
                                longitude: 79.8612,
                                distance: parseFloat(agent.distance),
                                isVerified: true,
                                businessType: "gas_agent"
                              })}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{agent.name}</h4>
                                  <p className="text-sm text-gray-600">{agent.address}</p>
                                </div>
                                <span className="text-sm text-orange-600">{agent.distance}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedGasAgent && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        Selected Gas Agent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold">{selectedGasAgent.businessName}</h3>
                            <p className="text-sm text-gray-600">{selectedGasAgent.address}</p>
                            <p className="text-sm text-gray-500">Distance: {selectedGasAgent.distance}km away</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{selectedGasAgent.phone || '+94 71 XXX XXXX'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">Available: 8:00 AM - 6:00 PM</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            setActiveTab("book");
                            setDeliveryAddress(selectedGasAgent.address);
                          }}
                        >
                          Book from this Agent
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default GasDelivery;
