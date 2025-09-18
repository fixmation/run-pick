import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProgressIndicator from '@/components/ui/progress-indicator';
import ServiceProgressModal from '@/components/ui/service-progress-modal';
import ServiceBookingButton from '@/components/services/ServiceBookingButton';
import { useServiceProgress } from '@/hooks/useServiceProgress';
import { Car, UtensilsCrossed, Package, Play, RotateCcw } from 'lucide-react';

const ProgressDemo = () => {
  const [selectedService, setSelectedService] = useState<'taxi' | 'food' | 'parcel'>('taxi');
  const [showModal, setShowModal] = useState(false);
  
  const taxiProgress = useServiceProgress({ serviceType: 'taxi' });
  const foodProgress = useServiceProgress({ serviceType: 'food' });
  const parcelProgress = useServiceProgress({ serviceType: 'parcel' });

  const getCurrentProgress = () => {
    switch (selectedService) {
      case 'taxi': return taxiProgress;
      case 'food': return foodProgress;
      case 'parcel': return parcelProgress;
    }
  };

  const currentProgress = getCurrentProgress();

  const services = [
    { 
      type: 'taxi' as const, 
      title: 'Taxi Booking', 
      icon: Car, 
      color: 'text-blue-600 bg-blue-100' 
    },
    { 
      type: 'food' as const, 
      title: 'Food Delivery', 
      icon: UtensilsCrossed, 
      color: 'text-orange-600 bg-orange-100' 
    },
    { 
      type: 'parcel' as const, 
      title: 'Parcel Delivery', 
      icon: Package, 
      color: 'text-green-600 bg-green-100' 
    }
  ];

  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Feature Demo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Animated <span className="text-blue-600">Progress Indicators</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience our real-time progress tracking system for all service requests. 
            Visual feedback keeps you informed every step of the way.
          </p>
        </div>

        {/* Service Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Button
                    key={service.type}
                    variant={selectedService === service.type ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      selectedService === service.type ? service.color : ''
                    }`}
                    onClick={() => setSelectedService(service.type)}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{service.title}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress Controls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => currentProgress.nextStep()}
              disabled={currentProgress.isComplete}
            >
              <Play className="w-4 h-4 mr-2" />
              Next Step
            </Button>
            <Button
              variant="outline"
              onClick={() => currentProgress.reset()}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowModal(true)}
            >
              Show Modal Progress
            </Button>
            <div className="ml-auto">
              <ServiceBookingButton serviceType={selectedService}>
                Test Live Progress
              </ServiceBookingButton>
            </div>
          </CardContent>
        </Card>

        {/* Current Progress Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const service = services.find(s => s.type === selectedService);
                const Icon = service?.icon;
                return Icon ? <Icon className="w-5 h-5" /> : null;
              })()}
              {services.find(s => s.type === selectedService)?.title} Progress
              <Badge variant={currentProgress.isComplete ? "default" : "secondary"}>
                Step {currentProgress.currentStep + 1} of {currentProgress.steps.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressIndicator
              steps={currentProgress.steps}
              currentStep={currentProgress.currentStep}
              serviceType={selectedService}
            />
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Progress indicators update automatically as your service request moves through each stage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Animated icons, progress lines, and color-coded states provide clear visual feedback.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service-Specific</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Each service type has customized progress steps tailored to the specific workflow.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />

      {/* Demo Modal */}
      <ServiceProgressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        serviceType={selectedService}
        orderId={`DEMO-${Date.now()}`}
        steps={currentProgress.steps}
        currentStep={currentProgress.currentStep}
        driverInfo={{
          name: 'Demo Driver',
          phone: '+94 77 123 4567',
          vehicle: 'Demo Vehicle - ABC 1234',
          rating: 4.9
        }}
        estimatedArrival="5-8 minutes"
        onCancel={() => setShowModal(false)}
        onContact={() => console.log('Contact driver')}
      />
    </div>
  );
};

export default ProgressDemo;