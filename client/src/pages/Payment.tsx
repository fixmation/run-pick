import { useState } from "react";
import { CreditCard, Plus, Trash2, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNavNew from "@/components/navigation/MobileBottomNavNew";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
}

const Payment = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      last4: '4242',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'wallet',
      name: 'Run Pick Wallet',
      isDefault: false
    }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view payment methods</h1>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
        <div className="hidden sm:block">
          <Footer />
        </div>
        <MobileBottomNavNew />
      </div>
    );
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleRemove = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment options securely</p>
          </div>

          {/* Wallet Balance */}
          <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Run Pick Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">LKR 2,450.00</div>
              <p className="text-blue-100 mb-4">Available Balance</p>
              <Button variant="secondary" className="h-12 min-h-[48px] bg-white/20 text-white hover:bg-white/30 font-medium">
                Top Up Wallet
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button
                variant="outline"
                className="h-10 min-h-[40px] bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                onClick={() => setShowAddCard(!showAddCard)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {method.type === 'card' 
                            ? `${method.name} •••• ${method.last4}`
                            : method.name
                          }
                        </span>
                        {method.isDefault && (
                          <Badge variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {method.expiryDate && (
                        <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="ghost"
                        className="h-10 min-h-[40px] bg-gray-50 border border-gray-200 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    {method.type === 'card' && (
                      <Button
                        variant="ghost"
                        className="h-10 min-h-[40px] bg-gray-50 border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleRemove(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Card Form */}
              {showAddCard && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-4">Add New Card</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input id="cardName" placeholder="John Doe" />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium">Add Card</Button>
                      <Button variant="outline" onClick={() => setShowAddCard(false)} className="h-12 min-h-[48px] bg-white border-gray-300 text-gray-800 hover:bg-gray-50">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNavNew />
    </div>
  );
};

export default Payment;