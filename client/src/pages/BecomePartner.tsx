import { useState } from "react";
import { CheckCircle, Shield, Star, Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { Link } from "wouter";

const BecomePartner = () => {
  const [activeTab, setActiveTab] = useState("driver");

  const benefits = [
    {
      icon: DollarSign,
      title: "Flexible Earnings",
      description: "Earn up to LKR 50,000 monthly with flexible working hours"
    },
    {
      icon: Clock,
      title: "Work on Your Schedule",
      description: "Choose when to work - part-time or full-time, you decide"
    },
    {
      icon: Shield,
      title: "Insurance Coverage",
      description: "Comprehensive insurance coverage for you and your vehicle"
    },
    {
      icon: Users,
      title: "Growing Community",
      description: "Join 1000+ partner drivers across Sri Lanka"
    }
  ];

  const requirements = {
    driver: [
      "Valid driving license (minimum 2 years)",
      "Vehicle registration and insurance",
      "Age 21-60 years",
      "Clean driving record",
      "Smartphone with internet connection",
      "Basic English communication skills"
    ],
    vendor: [
      "Valid business registration",
      "Food safety certification",
      "Commercial kitchen space",
      "Minimum 2 years business experience",
      "Smartphone with internet connection",
      "Quality food preparation standards"
    ]
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8 max-w-6xl mx-auto pb-20 sm:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Join Our Partner Network
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Become a <span className="text-blue-600">Run Pick</span> Partner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of drivers and restaurant partners earning flexible income 
            while serving customers across Sri Lanka
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Partnership Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Partnership</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="driver">Driver Partner</TabsTrigger>
              <TabsTrigger value="vendor">Restaurant Partner</TabsTrigger>
            </TabsList>

            <TabsContent value="driver" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Driver Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {requirements.driver.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      What You'll Get
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Competitive commission rates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Weekly payouts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">24/7 support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Marketing support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Performance bonuses</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vendor" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Restaurant Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {requirements.vendor.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Partnership Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Reach thousands of customers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Easy order management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Marketing and promotions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Analytics and insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Fast payment processing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Terms & Conditions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Partnership Agreement</h4>
              <p className="text-gray-700">By becoming a Run Pick partner, you agree to provide services in accordance with our quality standards and customer service guidelines.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Commission Structure</h4>
              <p className="text-gray-700">Driver partners receive 92% of ride fares. Restaurant partners pay 8% commission on food orders. All commission rates are subject to review in timely manner.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Quality Standards</h4>
              <p className="text-gray-700">Partners must maintain a minimum rating of 4.2 stars and comply with all local regulations and Run Pick policies.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4. Payment Terms</h4>
              <p className="text-gray-700">Payments are processed weekly and transferred to your registered bank account. Payment processing may take 2-3 business days.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5. Termination</h4>
              <p className="text-gray-700">Either party may terminate this agreement with 30 days written notice. Run Pick reserves the right to terminate immediately for policy violations.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Join thousands of successful partners and start earning today</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/driver-application">
              <Button size="xl" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                Apply as Driver
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="/restaurant-application">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 h-12 px-8">
                Apply as Restaurant Partner
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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

export default BecomePartner;