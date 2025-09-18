
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageCircle, FileText, Clock, Users, HelpCircle, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'wouter';

const PartnerSupport = () => {
  const supportOptions = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      contact: "071 1558 055",
      action: "Call Now",
      available: "24/7 Available"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your queries and concerns",
      contact: "runpicktransport@gmail.com",
      action: "Send Email",
      available: "Response within 2 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Via Driver App",
      action: "Start Chat",
      available: "9 AM - 11 PM"
    }
  ];

  const helpTopics = [
    {
      icon: Users,
      title: "Account Management",
      description: "Profile updates, verification, account issues"
    },
    {
      icon: DollarSign,
      title: "Payment & Earnings",
      description: "Payment issues, earnings reports, withdrawals"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Required documents, compliance, legal support"
    },
    {
      icon: HelpCircle,
      title: "Technical Support",
      description: "App issues, GPS problems, technical troubleshooting"
    }
  ];

  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            We're Here to Help
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-blue-600">Partner Support</span> Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the support you need as a Run Pick partner. Our dedicated team is here 
            to help you succeed and resolve any issues quickly.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-semibold text-blue-600">{option.contact}</p>
                  <p className="text-sm text-green-600">{option.available}</p>
                  <Button className="w-full">
                    {option.action}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Topics */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Common Support Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {helpTopics.map((topic, index) => {
                const Icon = topic.icon;
                return (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{topic.title}</h3>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Support - Hidden on Mobile */}
        <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-center hidden sm:block">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Emergency Support</h2>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              For urgent safety issues, accidents, or emergency situations while on duty, 
              contact our 24/7 emergency hotline immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                <Phone className="mr-2 w-5 h-5" />
                Emergency: 077 637 8630
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Safety Guidelines
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Looking for quick answers?</p>
          <Link href="/learn-more">
            <Button variant="outline" size="lg">
              View FAQ & Help Center
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default PartnerSupport;

