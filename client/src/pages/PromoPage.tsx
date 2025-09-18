import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  Gift, 
  ArrowLeft, 
  Star, 
  Percent, 
  Clock,
  Calendar,
  Heart
} from 'lucide-react';

export default function PromoPage() {
  const [, navigate] = useLocation();

  const comingSoonFeatures = [
    {
      icon: Gift,
      title: "Exclusive Discounts",
      description: "Get up to 50% off on rides, food delivery, and parcel services",
      color: "text-blue-500"
    },
    {
      icon: Star,
      title: "Loyalty Rewards",
      description: "Earn points with every order and redeem for exciting rewards",
      color: "text-yellow-500"
    },
    {
      icon: Percent,
      title: "Flash Sales",
      description: "Limited-time offers with massive discounts on premium services",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Happy Hours",
      description: "Special pricing during peak hours for maximum savings",
      color: "text-purple-500"
    },
    {
      icon: Calendar,
      title: "Daily Deals",
      description: "New promotional offers every day across all services",
      color: "text-orange-500"
    },
    {
      icon: Heart,
      title: "VIP Benefits",
      description: "Premium members get exclusive access to special promotions",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Promotions</h1>
            <p className="text-sm text-gray-600">Exciting deals and rewards</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Coming Soon Banner */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="text-center p-8">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Amazing Promos Coming Soon!</h2>
            <p className="text-blue-100 mb-4">
              We're working hard to bring you the best deals and rewards program in Sri Lanka
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="w-3 h-3 mr-1" />
              Launching Soon
            </Badge>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-center mb-4">What's Coming</h3>
          
          <div className="grid gap-4">
            {comingSoonFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-50 ${feature.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Soon
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              <span>Development Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Rewards System</span>
                <Badge className="bg-yellow-200 text-yellow-800">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Discount Engine</span>
                <Badge className="bg-yellow-200 text-yellow-800">Planning</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">VIP Program</span>
                <Badge className="bg-yellow-200 text-yellow-800">Coming Soon</Badge>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Stay tuned!</strong> We'll notify all users when promotions go live. 
                Follow us for updates and be the first to enjoy amazing deals!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-6">
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Continue Using Run Pick
          </Button>
        </div>
      </div>
    </div>
  );
}