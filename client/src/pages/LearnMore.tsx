import { Shield, Clock, Star, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { Link } from "wouter";

const LearnMore = () => {
  const features = [
    {
      icon: Shield,
      title: "Safety First",
      description: "All drivers are verified and vehicles are insured for your safety"
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description: "Available round the clock for all your transportation needs"
    },
    {
      icon: Star,
      title: "Rated Drivers",
      description: "Only highly rated and experienced drivers serve our customers"
    },
    {
      icon: MapPin,
      title: "Island-wide Coverage",
      description: "Serving all major cities and towns across Sri Lanka"
    },
    {
      icon: Phone,
      title: "Customer Support",
      description: "Dedicated support team available to help 24/7"
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join 50,000+ satisfied customers using Run Pick daily"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "1,000+", label: "Partner Drivers" },
    { number: "500+", label: "Restaurant Partners" },
    { number: "25", label: "Cities Covered" },
    { number: "4.8", label: "Average Rating" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8 max-w-6xl mx-auto pb-20 sm:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            About Run Pick
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sri Lanka's #1 <span className="text-blue-600">Multi-Service Platform</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Run Pick is revolutionizing transportation and delivery services in Sri Lanka. 
            From taxi rides to food delivery and parcel services, we're your trusted partner 
            for all mobility needs.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Run Pick?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">Taxi Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• City rides and intercity travel</li>
                  <li>• Airport transfers</li>
                  <li>• Hourly and daily rentals</li>
                  <li>• Corporate transportation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-green-600">Food Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Restaurant delivery</li>
                  <li>• Grocery delivery</li>
                  <li>• Fast food and fine dining</li>
                  <li>• Real-time order tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-purple-600">Parcel Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Same-day delivery</li>
                  <li>• Document delivery</li>
                  <li>• Package tracking</li>
                  <li>• Secure handling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Founded in 2023, Run Pick emerged from the need for a reliable, 
              comprehensive transportation and delivery platform in Sri Lanka. 
              Our mission is to connect customers with trusted service providers 
              while ensuring safety, reliability, and affordability. Today, we're 
              proud to serve thousands of customers across the island with our 
              network of verified drivers and restaurant partners.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Run Pick?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and start using Sri Lanka's 
            most trusted multi-service platform today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                Get Started Now
              </Button>
            </Link>

            <Link href="/become-partner">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Become a Partner
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

export default LearnMore;