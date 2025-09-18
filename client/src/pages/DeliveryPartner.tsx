
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, DollarSign, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const DeliveryPartner = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Flexible Earnings",
      description: "Earn money on your schedule with competitive delivery rates"
    },
    {
      icon: Clock,
      title: "Work Anytime",
      description: "Choose your own hours - work part-time or full-time"
    },
    {
      icon: Truck,
      title: "Use Your Vehicle",
      description: "Deliver with your car, bike, or any vehicle you have"
    },
    {
      icon: Users,
      title: "Join Our Community",
      description: "Be part of Sri Lanka's largest delivery network"
    }
  ];

  const requirements = [
    "Valid driving license",
    "Own vehicle (car, motorcycle, or bicycle)",
    "Smartphone with internet connection",
    "Age 18 or above",
    "Clean driving record",
    "Available for flexible hours"
  ];

  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Join Our Network
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Become a <span className="text-blue-600">Delivery Partner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of delivery partners earning flexible income while serving 
            customers across Sri Lanka. Start delivering with Run Pick today.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join Run Pick's delivery partner network and start earning money on your schedule. 
              Apply now and begin delivering within 24 hours of approval.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/driver-application">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/partner-support">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Get Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DeliveryPartner;

