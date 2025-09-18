import { useState } from "react";
import { Search, Star, Clock, ArrowLeft, ShoppingCart, Plus, Minus, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import FoodDeliveryMap from "@/components/food/FoodDeliveryMap";
import LocationAutocomplete, { type SelectedLocation } from "@/components/common/LocationAutocomplete";
import { useToast } from "@/hooks/use-toast";

const FoodDelivery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [customerLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Mock customer location
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState<SelectedLocation | null>(null);
  
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "All", count: 45 },
    { id: "rice", name: "Rice & Curry", count: 12 },
    { id: "kottu", name: "Kottu", count: 8 },
    { id: "chinese", name: "Chinese", count: 15 },
    { id: "indian", name: "Indian", count: 10 }
  ];

  const restaurants = [
    {
      id: 1,
      name: "Perera Family Restaurant",
      cuisine: "Sri Lankan",
      rating: 4.5,
      deliveryTime: "25-35 min",
      deliveryFee: "LKR 100",
      minOrder: "LKR 500",
      image: "🍛",
      featured: true,
      latitude: 6.9271,
      longitude: 79.8612,
      address: "Colombo 03, Sri Lanka"
    },
    {
      id: 2,
      name: "Golden Dragon",
      cuisine: "Chinese",
      rating: 4.7,
      deliveryTime: "30-40 min",
      deliveryFee: "LKR 120",
      minOrder: "LKR 600",
      image: "🥢",
      featured: false,
      latitude: 6.9314,
      longitude: 79.8428,
      address: "Bambalapitiya, Sri Lanka"
    },
    {
      id: 3,
      name: "Kottu King",
      cuisine: "Sri Lankan",
      rating: 4.6,
      deliveryTime: "20-30 min",
      deliveryFee: "LKR 80",
      minOrder: "LKR 400",
      image: "🍳",
      featured: true,
      latitude: 6.9147,
      longitude: 79.8728,
      address: "Dehiwala, Sri Lanka"
    },
    {
      id: 4,
      name: "Spice Garden",
      cuisine: "Indian",
      rating: 4.3,
      deliveryTime: "35-45 min",
      deliveryFee: "LKR 150",
      minOrder: "LKR 700",
      image: "🍛",
      featured: false,
      latitude: 6.9388,
      longitude: 79.8542,
      address: "Wellawatte, Sri Lanka"
    }
  ];

  const deliveryDrivers = [
    {
      id: 1,
      name: "Kasun Perera",
      vehicleType: "bike",
      latitude: 6.9200,
      longitude: 79.8600,
      isAvailable: true,
      rating: 4.8,
      estimatedTime: "15 mins",
      phone: "+94 77 123 4567"
    },
    {
      id: 2,
      name: "Nimal Silva",
      vehicleType: "car",
      latitude: 6.9300,
      longitude: 79.8500,
      isAvailable: true,
      rating: 4.6,
      estimatedTime: "12 mins",
      phone: "+94 71 234 5678"
    },
    {
      id: 3,
      name: "Sunil Fernando",
      vehicleType: "bike",
      latitude: 6.9150,
      longitude: 79.8700,
      isAvailable: false,
      rating: 4.9,
      estimatedTime: "20 mins",
      phone: "+94 76 345 6789"
    }
  ];

  const featuredItems = [
    {
      id: 1,
      name: "Chicken Rice & Curry",
      restaurant: "Perera Family Restaurant",
      price: 450,
      originalPrice: 550,
      rating: 4.6,
      image: "🍛",
      description: "Traditional Sri Lankan rice with chicken curry, dhal, and vegetables"
    },
    {
      id: 2,
      name: "Chicken Kottu",
      restaurant: "Kottu King",
      price: 380,
      rating: 4.8,
      image: "🍳",
      description: "Chopped roti with chicken, vegetables and spices"
    },
    {
      id: 3,
      name: "Chicken Fried Rice",
      restaurant: "Golden Dragon",
      price: 420,
      rating: 4.5,
      image: "🍚",
      description: "Wok-fried rice with chicken and vegetables"
    }
  ];

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = featuredItems.find(item => item.id.toString() === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const cartItemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  const handlePlaceOrder = () => {
    if (cartItemCount === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
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

    const orderData = {
      items: Object.entries(cart).map(([itemId, quantity]) => {
        const item = featuredItems.find(item => item.id.toString() === itemId);
        return {
          itemId,
          name: item?.name,
          price: item?.price,
          quantity
        };
      }),
      total: getCartTotal(),
      deliveryAddress,
      deliveryLocation,
      paymentMethod: "cash"
    };

    console.log('Placing food order:', orderData);
    toast({
      title: "Order placed successfully!",
      description: "Your food will be delivered soon. You'll receive updates on your order status."
    });

    // Clear cart after successful order
    setCart({});
    setDeliveryAddress("");
    setDeliveryLocation(null);
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
            <h1 className="text-2xl font-bold text-foreground">Food Delivery</h1>
            <p className="text-muted-foreground">Delicious meals delivered fresh</p>
          </div>
          {cartItemCount > 0 && (
            <div className="ml-auto">
              <Button variant="secondary" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              </Button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for food, restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
          
            {/* Map Preview - Show when delivery location is set */}
            {deliveryLocation && (
              <Card className="p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Restaurants Near You</h3>
                </div>
                <FoodDeliveryMap
                  restaurants={restaurants}
                  deliveryDrivers={deliveryDrivers}
                  customerLocation={deliveryLocation}
                  selectedRestaurant={selectedRestaurant}
                  onRestaurantSelect={setSelectedRestaurant}
                  showDeliveryRoute={!!selectedRestaurant}
                />
              </Card>
            )}
          
            <Tabs defaultValue="restaurants" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-4">
                <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                <TabsTrigger value="featured">Featured Items</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="map">
                  <Navigation className="w-4 h-4 mr-1" />
                  Map
                </TabsTrigger>
              </TabsList>

              <TabsContent value="restaurants" className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="service-card">
                      <div className="relative">
                        {restaurant.featured && (
                          <Badge className="absolute top-2 left-2 bg-secondary">
                            Featured
                          </Badge>
                        )}
                        <div className="text-4xl mb-4 text-center">
                          {restaurant.image}
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisine}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Delivery: {restaurant.deliveryFee}</span>
                          <span>Min: {restaurant.minOrder}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1" size="sm">
                          View Menu
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRestaurant(restaurant)}
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="featured" className="space-y-4">
                <div className="grid gap-4">
                  {featuredItems.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex gap-4">
                        <div className="text-4xl">{item.image}</div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.restaurant}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current text-yellow-400" />
                              <span className="text-sm">{item.rating}</span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">
                                LKR {item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  LKR {item.originalPrice}
                                </span>
                              )}
                            </div>

                            {cart[item.id] ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => removeFromCart(item.id.toString())}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{cart[item.id]}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => addToCart(item.id.toString())}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => addToCart(item.id.toString())}
                              >
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="service-card text-center">
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-muted-foreground">{category.count} restaurants</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <FoodDeliveryMap
                  restaurants={restaurants}
                  deliveryDrivers={deliveryDrivers}
                  customerLocation={customerLocation}
                  selectedRestaurant={selectedRestaurant}
                  onRestaurantSelect={setSelectedRestaurant}
                  showDeliveryRoute={!!selectedRestaurant}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Your Order</h3>

              {cartItemCount === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([itemId, quantity]) => {
                    const item = featuredItems.find(item => item.id.toString() === itemId);
                    if (!item) return null;

                    return (
                      <div key={itemId} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            LKR {item.price} each
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => removeFromCart(itemId)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => addToCart(itemId)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">LKR {getCartTotal()}</span>
                    </div>
                    <div className="space-y-3 mt-3">
                      <div className="space-y-2">
                        <LocationAutocomplete
                          label="Delivery Address"
                          placeholder="Enter your delivery address..."
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
                                  toast({
                                    title: "Location access denied",
                                    description: "Please enter your delivery address manually",
                                    variant: "destructive"
                                  });
                                }
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Payment Method</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <span>💵</span>
                              <span>Cash on Delivery</span>
                            </div>
                            <input type="radio" name="payment" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded opacity-60">
                            <div className="flex items-center gap-2">
                              <span>💳</span>
                              <span>Credit/Debit Card</span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">SOON</span>
                            </div>
                            <input type="radio" name="payment" disabled />
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handlePlaceOrder}
                        className="w-full h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        data-testid="button-place-order"
                      >
                        Place Order - LKR {getCartTotal()}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
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

export default FoodDelivery;