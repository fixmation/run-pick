import { useState } from "react";
import { Gift, Clock, Tag, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNavNew from "@/components/navigation/MobileBottomNavNew";
import { useAuth } from "@/contexts/AuthContext";

interface Promo {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expiryDate: string;
  category: 'ride' | 'food' | 'delivery' | 'general';
  used: boolean;
}

const Promo = () => {
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [promos] = useState<Promo[]>([
    {
      id: '1',
      title: 'First Ride Free',
      description: 'Get your first ride completely free, up to LKR 500',
      code: 'FIRSTRIDE',
      discount: '100% OFF',
      expiryDate: '2025-03-31',
      category: 'ride',
      used: false
    },
    {
      id: '2',
      title: '20% Off Food Orders',
      description: 'Save 20% on all food deliveries above LKR 1000',
      code: 'FOOD20',
      discount: '20% OFF',
      expiryDate: '2025-02-28',
      category: 'food',
      used: false
    },
    {
      id: '3',
      title: 'Free Delivery',
      description: 'Free delivery on all parcel orders this month',
      code: 'FREEDEL',
      discount: 'FREE DELIVERY',
      expiryDate: '2025-02-15',
      category: 'delivery',
      used: true
    }
  ]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ride': return 'bg-blue-100 text-blue-700';
      case 'food': return 'bg-orange-100 text-orange-700';
      case 'delivery': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const availablePromos = promos.filter(promo => !promo.used);
  const usedPromos = promos.filter(promo => promo.used);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Promos & Offers</h1>
            <p className="text-gray-600 text-center">Save money on your rides, food, and deliveries</p>
          </div>

          {/* Promo Code Input */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Enter Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => console.log('Apply code:', promoCode)} className="h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Promo Tabs */}
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="used">Used</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {availablePromos.length > 0 ? (
                availablePromos.map((promo) => (
                  <Card key={promo.id} className="border-2 border-dashed border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">{promo.title}</h3>
                        </div>
                        <Badge className={getCategoryColor(promo.category)}>
                          {promo.category.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{promo.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {promo.code}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(promo.code)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedCode === promo.code ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Expires {new Date(promo.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{promo.discount}</div>
                          <Button className="h-10 min-h-[40px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-4">Use Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No available promos</h3>
                    <p className="text-gray-500">Check back later for new offers!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="used" className="space-y-4">
              {usedPromos.length > 0 ? (
                usedPromos.map((promo) => (
                  <Card key={promo.id} className="opacity-60">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-gray-400" />
                          <h3 className="font-semibold text-lg text-gray-600">{promo.title}</h3>
                        </div>
                        <Badge variant="secondary">USED</Badge>
                      </div>
                      
                      <p className="text-gray-500 mb-4">{promo.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {promo.code}
                        </div>
                        <div className="text-lg font-bold text-gray-500">{promo.discount}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-lg font-medium text-gray-900 mb-2">No used promos</div>
                    <p className="text-gray-500">Your used promos will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNavNew />
    </div>
  );
};

export default Promo;