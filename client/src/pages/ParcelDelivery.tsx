import { useState } from "react";
import { Package, MapPin, Clock, ArrowLeft, User, Phone, CreditCard, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import ParcelTrackingMap from "@/components/parcel/ParcelTrackingMap";
import LocationAutocomplete, { type SelectedLocation } from "@/components/common/LocationAutocomplete";
import { useToast } from "@/hooks/use-toast";

const ParcelDelivery = () => {
  const { toast } = useToast();
  const [parcelSize, setParcelSize] = useState("");
  const [isCOD, setIsCOD] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{lat: number, lng: number, address: string} | undefined>();
  const [dropoffLocation, setDropoffLocation] = useState<{lat: number, lng: number, address: string} | undefined>();
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
  
  // Sender details state
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  
  // Receiver details state  
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  
  // Parcel details state
  const [itemDescription, setItemDescription] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [codAmount, setCodAmount] = useState('');

  const parcelSizes = [
    {
      id: "small",
      name: "Small",
      description: "Documents, small items",
      dimensions: "Up to 25cm x 25cm",
      weight: "Up to 2kg",
      price: 200,
      icon: "📄"
    },
    {
      id: "medium", 
      name: "Medium",
      description: "Clothes, electronics",
      dimensions: "Up to 40cm x 40cm",
      weight: "Up to 10kg",
      price: 350,
      icon: "📦"
    },
    {
      id: "large",
      name: "Large", 
      description: "Big items, appliances",
      dimensions: "Up to 60cm x 60cm",
      weight: "Up to 25kg",
      price: 500,
      icon: "📫"
    }
  ];

  const parcelDrivers = [
    {
      id: 1,
      name: "Ravi Kumar",
      vehicleType: "bike",
      latitude: 6.9271,
      longitude: 79.8612,
      isAvailable: true,
      rating: 4.8,
      estimatedTime: "20 mins",
      phone: "+94 77 123 4567",
      capacity: "Small to Medium"
    },
    {
      id: 2,
      name: "Sunil Bandara",
      vehicleType: "van",
      latitude: 6.9200,
      longitude: 79.8500,
      isAvailable: true,
      rating: 4.6,
      estimatedTime: "25 mins",
      phone: "+94 71 234 5678",
      capacity: "Large Items"
    },
    {
      id: 3,
      name: "Chaminda Silva",
      vehicleType: "truck",
      latitude: 6.9400,
      longitude: 79.8700,
      isAvailable: true,
      rating: 4.9,
      estimatedTime: "30 mins",
      phone: "+94 76 345 6789",
      capacity: "Heavy Items"
    }
  ];

  const activeDelivery = {
    id: 1,
    pickupLocation: { lat: 6.9271, lng: 79.8612, address: "Colombo 03, Sri Lanka" },
    dropoffLocation: { lat: 6.9147, lng: 79.8728, address: "Dehiwala, Sri Lanka" },
    driver: parcelDrivers[0],
    status: 'in_transit' as const,
    estimatedDelivery: "4:45 PM",
    parcelDetails: {
      weight: "2.5 kg",
      dimensions: "30cm x 20cm x 15cm",
      fragile: true,
      value: "LKR 15,000"
    },
    trackingNumber: "RP24071415001"
  };

  const calculateTotal = () => {
    const selectedSize = parcelSizes.find(size => size.id === parcelSize);
    const basePrice = selectedSize?.price || 0;
    const urgentFee = isUrgent ? Math.round(basePrice * 0.5) : 0;
    const serviceFee = 50;
    return basePrice + urgentFee + serviceFee;
  };

  const handleBookParcel = () => {
    // Validate required fields
    if (!parcelSize) {
      toast({
        title: "Parcel size required",
        description: "Please select a parcel size",
        variant: "destructive"
      });
      return;
    }

    if (!senderName.trim()) {
      toast({
        title: "Sender name required",
        description: "Please enter sender's full name",
        variant: "destructive"
      });
      return;
    }

    if (!senderPhone.trim()) {
      toast({
        title: "Sender phone required",
        description: "Please enter sender's phone number",
        variant: "destructive"
      });
      return;
    }

    if (!pickupSearch.trim()) {
      toast({
        title: "Pickup address required",
        description: "Please enter pickup address",
        variant: "destructive"
      });
      return;
    }

    if (!pickupLocation) {
      toast({
        title: "Please select a valid pickup address",
        description: "Choose an address from the suggestions for accurate pickup",
        variant: "destructive"
      });
      return;
    }

    if (!receiverName.trim()) {
      toast({
        title: "Receiver name required",
        description: "Please enter receiver's full name",
        variant: "destructive"
      });
      return;
    }

    if (!receiverPhone.trim()) {
      toast({
        title: "Receiver phone required",
        description: "Please enter receiver's phone number",
        variant: "destructive"
      });
      return;
    }

    if (!dropoffSearch.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please enter delivery address",
        variant: "destructive"
      });
      return;
    }

    if (!dropoffLocation) {
      toast({
        title: "Please select a valid delivery address",
        description: "Choose an address from the suggestions for accurate delivery",
        variant: "destructive"
      });
      return;
    }

    if (!itemDescription.trim()) {
      toast({
        title: "Item description required",
        description: "Please describe what you're sending",
        variant: "destructive"
      });
      return;
    }

    if (isCOD && !codAmount.trim()) {
      toast({
        title: "COD amount required",
        description: "Please enter the cash on delivery amount",
        variant: "destructive"
      });
      return;
    }

    // Create booking data with geocoded locations
    const bookingData = {
      parcelSize,
      sender: {
        name: senderName,
        phone: senderPhone,
        address: pickupSearch,
        location: pickupLocation
      },
      receiver: {
        name: receiverName,
        phone: receiverPhone,
        address: dropoffSearch,
        location: dropoffLocation
      },
      parcelDetails: {
        description: itemDescription,
        specialInstructions: specialInstructions || null,
        isCOD,
        codAmount: isCOD ? parseFloat(codAmount) || 0 : 0,
        isUrgent
      },
      pricing: {
        basePrice: parcelSizes.find(s => s.id === parcelSize)?.price || 0,
        urgentFee: isUrgent ? Math.round((parcelSizes.find(s => s.id === parcelSize)?.price || 0) * 0.5) : 0,
        serviceFee: 50,
        total: calculateTotal()
      },
      paymentMethod: "cash"
    };

    console.log('Parcel delivery booking:', bookingData);
    toast({
      title: "Parcel delivery booked successfully!",
      description: `Your parcel will be picked up soon. Total: LKR ${calculateTotal()}`
    });

    // Clear form after successful booking
    setParcelSize("");
    setSenderName("");
    setSenderPhone("");
    setPickupSearch("");
    setPickupLocation(undefined);
    setReceiverName("");
    setReceiverPhone("");
    setDropoffSearch("");
    setDropoffLocation(undefined);
    setItemDescription("");
    setSpecialInstructions("");
    setIsCOD(false);
    setCodAmount("");
    setIsUrgent(false);
  };

  return (
    <div className="min-h-screen bg-[#fef3c7]">
      <Header />

      <div className="container px-4 py-6 max-w-6xl mx-auto pb-[calc(var(--bottom-nav-height,80px)+35px)] sm:pb-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Parcel Delivery</h1>
            <p className="text-muted-foreground">Send packages anywhere in Sri Lanka</p>
          </div>
        </div>

        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking">Book Parcel</TabsTrigger>
            <TabsTrigger value="tracking">Track Parcel</TabsTrigger>
            <TabsTrigger value="map">
              <Navigation className="w-4 h-4 mr-1" />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
            
            {/* Map Preview - Show when locations are selected */}
            {(pickupLocation || dropoffLocation) && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Delivery Route Preview</h3>
                </div>
                <ParcelTrackingMap
                  parcelDrivers={parcelDrivers}
                  pickupLocation={pickupLocation}
                  dropoffLocation={dropoffLocation}
                  showTrackingRoute={!!(pickupLocation && dropoffLocation)}
                />
              </Card>
            )}
            
            {/* Parcel Size Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Parcel Size</h2>

              <div className="grid md:grid-cols-3 gap-4">
                {parcelSizes.map((size) => (
                  <div
                    key={size.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      parcelSize === size.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setParcelSize(size.id)}
                    data-testid={`option-parcel-size-${size.id}`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{size.icon}</div>
                      <h3 className="font-semibold">{size.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{size.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{size.dimensions}</div>
                        <div className="text-xs text-muted-foreground">{size.weight}</div>
                        <div className="font-semibold text-primary">LKR {size.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sender Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Sender Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Your full name" 
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    data-testid="input-sender-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="+94 77 123 4567" 
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    data-testid="input-sender-phone"
                  />
                </div>
              </div>

              <div className="mt-4">
                <LocationAutocomplete
                  label="Pickup Address"
                  placeholder="Enter complete pickup address..."
                  value={pickupSearch}
                  onChange={setPickupSearch}
                  onLocationSelect={(location) => setPickupLocation({
                    lat: location.lat,
                    lng: location.lng,
                    address: location.address
                  })}
                  onCurrentLocation={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setPickupLocation({
                            lat: latitude,
                            lng: longitude,
                            address: "Current Location"
                          });
                          setPickupSearch("Current Location");
                        }
                      );
                    }
                  }}
                  showCurrentLocationButton={true}
                />
              </div>
            </Card>

            {/* Receiver Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Receiver Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Receiver's full name" 
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    data-testid="input-receiver-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="+94 77 123 4567" 
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    data-testid="input-receiver-phone"
                  />
                </div>
              </div>

              <div className="mt-4">
                <LocationAutocomplete
                  label="Delivery Address"
                  placeholder="Enter complete delivery address..."
                  value={dropoffSearch}
                  onChange={setDropoffSearch}
                  onLocationSelect={(location) => setDropoffLocation({
                    lat: location.lat,
                    lng: location.lng,
                    address: location.address
                  })}
                  onCurrentLocation={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setDropoffLocation({
                            lat: latitude,
                            lng: longitude,
                            address: "Current Location"
                          });
                          setDropoffSearch("Current Location");
                        },
                        (error) => {
                          console.error('Error getting current location:', error);
                          toast({
                            title: "Location access denied",
                            description: "Please enter your delivery address manually",
                            variant: "destructive"
                          });
                        }
                      );
                    }
                  }}
                  showCurrentLocationButton={true}
                />
              </div>
            </Card>

            {/* Parcel Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Parcel Details</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Item Description</Label>
                  <Input 
                    placeholder="What are you sending?" 
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    data-testid="input-item-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions (Optional)</Label>
                  <Textarea 
                    placeholder="Any special handling instructions..." 
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    data-testid="textarea-special-instructions"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-muted-foreground">
                      Receiver pays for the item on delivery
                    </div>
                  </div>
                  <Switch checked={isCOD} onCheckedChange={setIsCOD} />
                </div>

                {isCOD && (
                  <div className="space-y-2">
                    <Label>COD Amount</Label>
                    <Input 
                      placeholder="LKR 0.00" 
                      type="number" 
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                      data-testid="input-cod-amount"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Urgent Delivery
                      <Badge variant="secondary">+50% fee</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Priority delivery within 2-4 hours
                    </div>
                  </div>
                  <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Summary</h3>

              {parcelSize ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Parcel Size</span>
                    <span className="capitalize">{parcelSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Price</span>
                    <span>LKR {parcelSizes.find(s => s.id === parcelSize)?.price}</span>
                  </div>
                  {isUrgent && (
                    <div className="flex justify-between">
                      <span>Urgent Fee (50%)</span>
                      <span>LKR {Math.round((parcelSizes.find(s => s.id === parcelSize)?.price || 0) * 0.5)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>LKR 50</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">LKR {calculateTotal()}</span>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Estimated delivery: {isUrgent ? "2-4 hours" : "Same day"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Select a parcel size to see pricing
                </p>
              )}
            </Card>

            {/* Safety & Tracking */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Safety & Tracking</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    ✓
                  </Badge>
                  <span>Real-time tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    ✓
                  </Badge>
                  <span>Proof of delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    ✓
                  </Badge>
                  <span>Insurance covered</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    ✓
                  </Badge>
                  <span>Secure handling</span>
                </div>
              </div>
            </Card>

                {/* Payment Method */}
                {parcelSize && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💵</span>
                          <div>
                            <div className="font-medium">Cash on Delivery</div>
                            <div className="text-sm text-gray-500">Pay when parcel is delivered</div>
                          </div>
                        </div>
                        <input type="radio" name="payment" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💳</span>
                          <div>
                            <div className="font-medium">Credit/Debit Card</div>
                            <div className="text-sm text-gray-500">Secure online payment</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">SOON</Badge>
                          <input type="radio" name="payment" disabled />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Book Delivery Button */}
                {parcelSize && (
                  <Button 
                    onClick={handleBookParcel}
                    className="w-full h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    data-testid="button-book-parcel-delivery"
                  >
                    Book Delivery - LKR {calculateTotal()}
                  </Button>
                )}
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Delivery Summary */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Delivery Summary</h3>

                  {parcelSize ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Parcel Size</span>
                        <span className="capitalize">{parcelSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Price</span>
                        <span>LKR {parcelSizes.find(s => s.id === parcelSize)?.price}</span>
                      </div>
                      {isUrgent && (
                        <div className="flex justify-between">
                          <span>Urgent Fee (50%)</span>
                          <span>LKR {Math.round((parcelSizes.find(s => s.id === parcelSize)?.price || 0) * 0.5)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Service Fee</span>
                        <span>LKR 50</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">LKR {calculateTotal()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Select a parcel size to see pricing
                    </p>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

      <TabsContent value="tracking" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Track Your Parcel</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking-number">Enter Tracking Number</Label>
              <Input
                id="tracking-number"
                placeholder="e.g., RP24071415001"
                className="mt-1"
              />
            </div>
            <Button className="w-full h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium">Track Parcel</Button>
          </div>
        </Card>

        <ParcelTrackingMap
          parcelDrivers={parcelDrivers}
          activeDelivery={activeDelivery}
          pickupLocation={activeDelivery.pickupLocation}
          dropoffLocation={activeDelivery.dropoffLocation}
          showTrackingRoute={true}
        />
      </TabsContent>

      <TabsContent value="map" className="space-y-6">
        <ParcelTrackingMap
          parcelDrivers={parcelDrivers}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          onDriverSelect={setSelectedDriver}
          showTrackingRoute={!!(pickupLocation && dropoffLocation)}
        />
      </TabsContent>
        </Tabs>
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ParcelDelivery;