import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  ArrowLeft,
  Wallet,
  Smartphone,
  Building2,
  History,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export default function TopUpWallet() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [customAmount, setCustomAmount] = useState("");

  const quickAmounts = [500, 1000, 2000, 5000, 10000];
  const currentBalance = 2450; // This would come from user data

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, MasterCard, American Express" },
    { id: "mobile", name: "Mobile Payment", icon: Smartphone, description: "Dialog eZ Cash, Mobitel mCash" },
    { id: "bank", name: "Bank Transfer", icon: Building2, description: "Online banking transfer" },
  ];

  const recentTransactions = [
    { date: "2025-08-23", type: "Top Up", amount: "+LKR 1,000", status: "completed" },
    { date: "2025-08-22", type: "Ride Payment", amount: "-LKR 450", status: "completed" },
    { date: "2025-08-21", type: "Food Order", amount: "-LKR 1,200", status: "completed" },
    { date: "2025-08-20", type: "Top Up", amount: "+LKR 2,000", status: "completed" },
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setCustomAmount("");
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setAmount(value);
  };

  const handleTopUp = () => {
    const topUpAmount = parseFloat(amount);
    if (topUpAmount > 0) {
      console.log("Processing top up:", { amount: topUpAmount, paymentMethod });
      // Here you would implement the actual top up logic
    }
  };

  return (
    <div className="min-h-screen bg-[#ffeed8] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/customer-dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Top Up Wallet</h1>
            <p className="text-gray-600">Add funds to your Run Pick wallet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Up Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  LKR {currentBalance.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Amount Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quick Select (LKR)</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                    {quickAmounts.map((value) => (
                      <Button
                        key={value}
                        variant={amount === value.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleQuickAmount(value)}
                        className="text-sm"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-amount">Custom Amount (LKR)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      min="1"
                      max="100000"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleCustomAmount(customAmount)}
                      disabled={!customAmount}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {amount && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      Top up amount: LKR {parseFloat(amount).toLocaleString()}
                    </p>
                    <p className="text-blue-600 text-sm">
                      New balance will be: LKR {(currentBalance + parseFloat(amount)).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer font-medium">
                            <method.icon className="w-4 h-4" />
                            {method.name}
                          </Label>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Top Up Button */}
            <Button
              onClick={handleTopUp}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
            >
              Top Up LKR {amount ? parseFloat(amount).toLocaleString() : "0"}
            </Button>
          </div>

          {/* Transaction History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{transaction.type}</p>
                        <p className="text-xs text-gray-600">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${
                          transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {transaction.amount}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Minimum top up: LKR 100</p>
                  <p>• Maximum top up: LKR 100,000</p>
                  <p>• Funds are available instantly</p>
                  <p>• All transactions are secure & encrypted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}