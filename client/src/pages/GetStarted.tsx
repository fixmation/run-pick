import { Car, UtensilsCrossed, Package, Download, ArrowRight, Users, Globe, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { Link } from "wouter";
import { useState } from "react"; // Import useState

// Placeholder for ForgotPassword component
// In a real application, this would be in its own file (e.g., pages/auth/forgot-password.tsx)
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password Reset",
      description: "Password reset email sent successfully.",
    });
    // In a real app, you would have a fetch call here:
    // try {
    //   const response = await fetch('/api/auth/forgot-password', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    //   });
    //   if (response.ok) {
    //     setMessage("Password reset email sent successfully.");
    //   } else {
    //     const errorData = await response.json();
    //     setMessage(errorData.message || "Failed to send password reset email.");
    //   }
    // } catch (error) {
    //   setMessage("An error occurred. Please try again.");
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-sm">

        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email">Email Address</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Reset Password</Button>
          <Link href="/login">
            <Button variant="link" className="w-full">
              Remember your password? Log in
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
};


const GetStarted = () => {

  const steps = [
    {
      step: "1",
      title: "Download the App",
      description: "Get Run Pick on your mobile device",
      icon: Download
    },
    {
      step: "2",
      title: "Create Account",
      description: "Sign up with your phone number",
      icon: null
    },
    {
      step: "3",
      title: "Start Using",
      description: "Book rides, order food, or send parcels",
      icon: null
    }
  ];

  const services = [
    {
      title: "Book a Ride",
      description: "Get a safe, reliable ride anywhere in Sri Lanka",
      icon: Car,
      color: "bg-blue-50 text-blue-600",
      link: "/taxi"
    },
    {
      title: "Order Food",
      description: "Delicious meals delivered from your favorite restaurants",
      icon: UtensilsCrossed,
      color: "bg-green-50 text-green-600",
      link: "/food"
    },
    {
      title: "Send Parcels",
      description: "Fast and secure parcel delivery across the island",
      icon: Package,
      color: "bg-purple-50 text-purple-600",
      link: "/parcel"
    },
    {
      title: "Movers Service",
      description: "Professional home and office moving services with reliable trucks and expert movers",
      icon: Truck,
      color: "bg-orange-50 text-orange-600",
      link: "/movers"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 py-8 max-w-6xl mx-auto pb-20 sm:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Get Started Today
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Journey with <span className="text-blue-600">Run Pick</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers using Sri Lanka's most trusted
            multi-service platform for all your transportation and delivery needs.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How to Get Started</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      {Icon ? (
                        <Icon className="w-8 h-8 text-white" />
                      ) : (
                        <span className="text-2xl font-bold text-white">{step.step}</span>
                      )}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${service.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Link href="/auth">
                      <Button className="w-full">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* App Download Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Download Run Pick App</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get the mobile app for the best experience. Available on Android and iOS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Download className="w-5 h-5 mr-2" />
                Download for Android
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Download className="w-5 h-5 mr-2" />
                Download for iOS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Need Help?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/learn-more">
              <Button variant="outline">Learn More About Run Pick</Button>
            </Link>
            <Link href="/become-partner">
              <Button variant="outline">Become a Partner</Button>
            </Link>
            {/* Open Auth Modal for sign in */}
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth'}
            >
              Sign In / Register
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />

      {/* Auth Modal */}
    </div>
  );
};

export default GetStarted;