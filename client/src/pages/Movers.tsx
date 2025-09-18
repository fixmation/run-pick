import { useState } from "react";
import { ArrowRight, MapPin, Clock, Shield, Star, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNavNew from "@/components/navigation/MobileBottomNavNew";
import LocationAutocomplete, { SelectedLocation } from "@/components/common/LocationAutocomplete";

const Movers = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    moveType: "",
    rooms: "",
    specialItems: "",
    preferredDate: "",
    preferredTime: "",
    contactName: "",
    contactPhone: "",
    additionalNotes: ""
  });

  // Additional state for autocomplete
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropoffSearch, setDropoffSearch] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{lat: number, lng: number} | null>(null);

  const moveTypes = [
    { id: "home", label: "Home Moving", description: "Residential moving services" },
    { id: "office", label: "Office Moving", description: "Commercial & office relocations" },
    { id: "partial", label: "Partial Move", description: "Moving specific items only" },
    { id: "storage", label: "Storage Moving", description: "Moving to/from storage" }
  ];

  const roomSizes = [
    { id: "studio", label: "Studio/1 Room", basePrice: 8000 },
    { id: "1br", label: "1 Bedroom", basePrice: 12000 },
    { id: "2br", label: "2 Bedroom", basePrice: 18000 },
    { id: "3br", label: "3 Bedroom", basePrice: 25000 },
    { id: "4br", label: "4+ Bedroom", basePrice: 35000 },
    { id: "office_small", label: "Small Office", basePrice: 15000 },
    { id: "office_large", label: "Large Office", basePrice: 30000 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final submission
    setIsSubmitted(true);
  };

  const selectedRoomSize = roomSizes.find(room => room.id === formData.rooms);

  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚛 Run Pick Moving Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Safe, reliable, and affordable home & office moving services across Sri Lanka
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className={`flex items-center ${stepNum < 3 ? 'space-x-4' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && <div className={`w-8 h-0.5 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-300'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        {isSubmitted ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-pink-100 border-pink-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-pink-800 mb-4">
                  Request Message Received!
                </h2>
                <div className="bg-pink-200 p-6 rounded-lg border border-pink-300">
                  <p className="text-pink-800 text-lg leading-relaxed mb-4">
                    Thank you for your moving service request. Our customer service team has received your message successfully.
                  </p>
                  <div className="space-y-3 text-pink-700">
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span className="font-semibold">We will call you within 24 hours</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">We will schedule a site visit for estimation</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setStep(1);
                    setFormData({
                      pickupLocation: "",
                      dropoffLocation: "",
                      moveType: "",
                      rooms: "",
                      specialItems: "",
                      preferredDate: "",
                      preferredTime: "",
                      contactName: "",
                      contactPhone: "",
                      additionalNotes: ""
                    });
                  }}
                  className="mt-6 bg-pink-600 hover:bg-pink-700 text-white"
                >
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Form Steps */
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Moving Details</CardTitle>
                  <CardDescription>Tell us about your moving requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <LocationAutocomplete
                        label="Pickup Location *"
                        placeholder="Enter pickup address"
                        value={pickupSearch}
                        onChange={setPickupSearch}
                        onLocationSelect={(location: SelectedLocation) => {
                          setFormData({...formData, pickupLocation: location.address});
                          setPickupCoords({lat: location.lat, lng: location.lng});
                        }}
                        showCurrentLocationButton={true}
                      />
                    </div>
                    <div>
                      <LocationAutocomplete
                        label="Drop-off Location *"
                        placeholder="Enter destination address"
                        value={dropoffSearch}
                        onChange={setDropoffSearch}
                        onLocationSelect={(location: SelectedLocation) => {
                          setFormData({...formData, dropoffLocation: location.address});
                          setDropoffCoords({lat: location.lat, lng: location.lng});
                        }}
                        showCurrentLocationButton={true}
                      />
                    </div>
                  </div>

                  {/* Move Type */}
                  <div>
                    <Label>Type of Move *</Label>
                    <RadioGroup value={formData.moveType} onValueChange={(value) => setFormData({...formData, moveType: value})}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {moveTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value={type.id} id={type.id} />
                            <div className="flex-1">
                              <Label htmlFor={type.id} className="font-medium cursor-pointer">{type.label}</Label>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Room Size */}
                  <div>
                    <Label>Size of Move *</Label>
                    <RadioGroup value={formData.rooms} onValueChange={(value) => setFormData({...formData, rooms: value})}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {roomSizes.map((room) => (
                          <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={room.id} id={room.id} />
                              <Label htmlFor={room.id} className="font-medium cursor-pointer">{room.label}</Label>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">
                              From LKR {room.basePrice.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Schedule & Preferences</CardTitle>
                  <CardDescription>When would you like to move?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Preferred Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Preferred Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="special">Special Items (Optional)</Label>
                    <Textarea
                      id="special"
                      placeholder="Piano, artwork, fragile items, heavy furniture, etc."
                      value={formData.specialItems}
                      onChange={(e) => setFormData({...formData, specialItems: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or requirements..."
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Contact Information</CardTitle>
                  <CardDescription>How can we reach you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="077 123 4567"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Moving Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>From:</strong> {formData.pickupLocation}</p>
                      <p><strong>To:</strong> {formData.dropoffLocation}</p>
                      <p><strong>Type:</strong> {moveTypes.find(t => t.id === formData.moveType)?.label}</p>
                      <p><strong>Size:</strong> {selectedRoomSize?.label}</p>
                      <p><strong>Date:</strong> {formData.preferredDate} at {formData.preferredTime}</p>
                      {selectedRoomSize && (
                        <p className="text-blue-600 font-semibold">
                          <strong>Estimated Cost:</strong> From LKR {selectedRoomSize.basePrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="min-h-[48px]"
                >
                  Previous
                </Button>
              )}
              <Button 
                type="submit" 
                className="ml-auto bg-blue-600 hover:bg-blue-700 min-h-[48px]"
              >
                {step < 3 ? "Next" : "Request Moving Service"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Moving Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Fully Insured</h3>
                <p className="text-sm text-gray-600">Your belongings are protected during the entire moving process</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Professional Team</h3>
                <p className="text-sm text-gray-600">Experienced movers who handle your items with care</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">On-Time Service</h3>
                <p className="text-sm text-gray-600">Punctual service that respects your schedule</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNavNew />
    </div>
  );
};

export default Movers;