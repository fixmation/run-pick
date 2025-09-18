import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Shield, 
  Users, 
  Clock, 
  MapPin, 
  CreditCard, 
  Phone, 
  CheckCircle, 
  AlertTriangle,
  Car,
  UtensilsCrossed,
  Package,
  Flame,
  ShoppingCart,
  Wrench,
  ArrowRight,
  Star,
  Globe,
  Lock
} from 'lucide-react';
import runpickLogoPath from "@assets/runpick-logo_1752764200329.png";

const GetStartedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fef3c7] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <img 
                src={runpickLogoPath} 
                alt="Run Pick" 
                className="w-16 h-16 object-contain mr-4 shadow-lg rounded-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Welcome to <span className="text-orange-600">Run Pick</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Sri Lanka's premier multi-service platform connecting you to everything you need - 
              taxi rides, food delivery, parcel services, and much more.
            </p>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                How Run Pick Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">1. Sign Up</h3>
                  <p className="text-gray-600">Create your account with basic information. Choose your role as Customer, Driver, or Business Partner.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">2. Select Service</h3>
                  <p className="text-gray-600">Choose from taxi rides, food delivery, parcel services, gas delivery, and supermarket shopping.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">3. Get Service</h3>
                  <p className="text-gray-600">Track your order in real-time, communicate with service providers, and enjoy fast, reliable service.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Services */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Star className="w-6 h-6 text-yellow-600 mr-3" />
                Our Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Car className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Taxi Services</h4>
                    <p className="text-gray-600 text-sm">Professional drivers, multiple vehicle types, real-time tracking, and cashless payments.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UtensilsCrossed className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Food Delivery</h4>
                    <p className="text-gray-600 text-sm">Restaurants, fast food, home cooking - delivered fresh with live tracking.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Parcel Delivery</h4>
                    <p className="text-gray-600 text-sm">Send documents, gifts, or packages anywhere in Sri Lanka safely and quickly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Flame className="w-6 h-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Gas Delivery</h4>
                    <p className="text-gray-600 text-sm">Cooking gas cylinders delivered to your doorstep with safe handling.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ShoppingCart className="w-6 h-6 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Supermarket Shopping</h4>
                    <p className="text-gray-600 text-sm">Personal shopping service from major supermarkets across Sri Lanka.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Wrench className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Breakdown Services</h4>
                    <p className="text-gray-600 text-sm">24/7 roadside assistance and vehicle breakdown support (Coming Soon).</p>
                    <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety & Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                Safety & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Lock className="w-5 h-5 text-blue-600 mr-2" />
                    Data Protection
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• All personal information is encrypted and secure</li>
                    <li>• We never share your data with third parties</li>
                    <li>• Payment information is processed securely</li>
                    <li>• Location data is only used for service delivery</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    Service Safety
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• All drivers and partners are verified</li>
                    <li>• Real-time GPS tracking for all services</li>
                    <li>• 24/7 customer support available</li>
                    <li>• Emergency contact features built-in</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold">Cash on Delivery</h4>
                  <p className="text-gray-600 text-sm mt-2">Pay when you receive your service or item</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold">Mobile Payments</h4>
                  <p className="text-gray-600 text-sm mt-2">eZ Cash, mCash, and other mobile wallets</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold">Bank Cards</h4>
                  <p className="text-gray-600 text-sm mt-2">Visa, Mastercard, and local bank cards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Terms of Service</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    By using Run Pick services, you agree to our terms and conditions. Please read them carefully 
                    to understand your rights and responsibilities.
                  </p>
                  <Link href="/terms-of-service">
                    <Button variant="outline" size="sm">
                      Read Terms of Service
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Privacy Policy</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    We respect your privacy and are committed to protecting your personal information. 
                    Learn how we collect, use, and protect your data.
                  </p>
                  <Link href="/privacy-policy">
                    <Button variant="outline" size="sm">
                      Read Privacy Policy
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Service Areas</h4>
                  <p className="text-gray-600 text-sm">
                    Currently available in Colombo, Kandy, Galle, Negombo, Jaffna, and Matara. 
                    We're rapidly expanding to cover all major cities in Sri Lanka.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Phone className="w-6 h-6 text-green-600 mr-3" />
                Customer Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">24/7 Help Center</h4>
                  <p className="text-gray-600 mb-4">
                    Need help? Our customer support team is available around the clock to assist you.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Phone:</strong> +94 11 123 4567</p>
                    <p><strong>Email:</strong> support@runpick.lk</p>
                    <p><strong>WhatsApp:</strong> +94 77 123 4567</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Emergency Contacts</h4>
                  <p className="text-gray-600 mb-4">
                    In case of emergencies during service, use these immediate contact options.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Emergency Hotline:</strong> 119</p>
                    <p><strong>Police:</strong> 118</p>
                    <p><strong>Run Pick Emergency:</strong> +94 70 911 0000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started CTA */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-orange-50 to-yellow-50">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of satisfied customers across Sri Lanka. 
                Sign up now and experience the convenience of Run Pick services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700">
                    <Users className="w-5 h-5 mr-2" />
                    Sign Up Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Globe className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default GetStartedPage;