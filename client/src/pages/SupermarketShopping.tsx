
import { useState } from "react";
import { ShoppingCart, MapPin, Clock, Phone, ShieldCheck, ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

const SupermarketShopping = () => {
  const [selectedSupermarket, setSelectedSupermarket] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [shoppingList, setShoppingList] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");

  const supermarkets = [
    { name: "Keells Super", locations: "Island-wide", popular: true },
    { name: "Cargills FoodCity", locations: "Major cities", popular: true },
    { name: "Arpico Supercenter", locations: "Colombo & suburbs", popular: false },
    { name: "Laughs Supermarket", locations: "Selected areas", popular: false },
    { name: "Spar", locations: "Colombo district", popular: false },
    { name: "Glomark", locations: "All provinces", popular: true },
    { name: "Convenience stores", locations: "Local areas", popular: false }
  ];

  const shoppingCategories = [
    "Groceries & Food Items",
    "Fresh Vegetables & Fruits",
    "Dairy & Frozen Products",
    "Household Items",
    "Personal Care",
    "Baby Products",
    "Beverages",
    "Snacks & Confectionery"
  ];

  const handleBooking = () => {
    if (!selectedSupermarket || !deliveryAddress || !phoneNumber || !shoppingList) {
      alert("Please fill in all required fields");
      return;
    }
    alert("Personal shopping service booked successfully! Our shopper will contact you shortly.");
  };

  return (
    <div className="min-h-screen bg-[#fef3c7]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Supermarket Shopping Service
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Personal shopping service from your favorite supermarkets. 
              Fresh groceries and household items delivered to your doorstep.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                  Book Shopping Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="supermarket">Choose Supermarket *</Label>
                  <Select value={selectedSupermarket} onValueChange={setSelectedSupermarket}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred supermarket" />
                    </SelectTrigger>
                    <SelectContent>
                      {supermarkets.map((supermarket) => (
                        <SelectItem key={supermarket.name} value={supermarket.name.toLowerCase().replace(/\s+/g, '-')}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <span className="font-medium">{supermarket.name}</span>
                              <div className="text-xs text-gray-500">{supermarket.locations}</div>
                            </div>
                            {supermarket.popular && (
                              <Badge variant="secondary" className="text-xs ml-2">Popular</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shopping-list">Shopping List *</Label>
                  <Textarea
                    id="shopping-list"
                    placeholder="List your items here (e.g., Rice 5kg, Milk 1L, Bread 2 loaves, Vegetables, etc.)"
                    value={shoppingList}
                    onChange={(e) => setShoppingList(e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be as specific as possible with quantities and preferences
                  </p>
                </div>

                <div>
                  <Label htmlFor="estimated-budget">Estimated Budget (Optional)</Label>
                  <Input
                    id="estimated-budget"
                    placeholder="LKR 5,000"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery-address">Delivery Address *</Label>
                  <Input
                    id="delivery-address"
                    placeholder="Enter your complete address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="077 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                  size="lg"
                >
                  Book Shopping Service
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Service Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Submit Your List</h4>
                      <p className="text-sm text-gray-600">Provide your shopping list and preferences</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Personal Shopper</h4>
                      <p className="text-sm text-gray-600">Our trained shopper visits the supermarket</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Quality Check</h4>
                      <p className="text-sm text-gray-600">Fresh items selected with care</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-semibold">Doorstep Delivery</h4>
                      <p className="text-sm text-gray-600">Items delivered fresh to your address</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Quality Guarantee</h4>
                      <p className="text-sm text-gray-600">Fresh products with quality assurance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Time Saving</h4>
                      <p className="text-sm text-gray-600">Save hours of shopping time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Live Updates</h4>
                      <p className="text-sm text-gray-600">Real-time updates on your shopping</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Multiple Stores</h4>
                      <p className="text-sm text-gray-600">Access to various supermarket chains</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span>Service Fee</span>
                      <span className="font-semibold text-amber-600">LKR 200</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span>Item Cost</span>
                      <span className="text-gray-600">As per receipt</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>Delivery</span>
                      <span className="text-green-600">Free within 5km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default SupermarketShopping;
