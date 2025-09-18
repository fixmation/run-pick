import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProgressIndicator, { type ProgressStep } from './progress-indicator';
import { X, Phone, MessageCircle, MapPin } from 'lucide-react';

interface ServiceProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'taxi' | 'food' | 'parcel';
  orderId: string;
  steps: ProgressStep[];
  currentStep: number;
  driverInfo?: {
    name: string;
    phone: string;
    vehicle?: string;
    rating: number;
    photo?: string;
  };
  estimatedArrival?: string;
  onCancel?: () => void;
  onContact?: () => void;
}

const ServiceProgressModal: React.FC<ServiceProgressModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  orderId,
  steps,
  currentStep,
  driverInfo,
  estimatedArrival,
  onCancel,
  onContact
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'taxi': return 'Taxi Booking';
      case 'food': return 'Food Delivery';
      case 'parcel': return 'Parcel Delivery';
      default: return 'Service Request';
    }
  };

  const getServiceEmoji = () => {
    switch (serviceType) {
      case 'taxi': return '🚗';
      case 'food': return '🍽️';
      case 'parcel': return '📦';
      default: return '🚚';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-yellow-50">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
              <span className="text-2xl">{getServiceEmoji()}</span>
              {getServiceTitle()}
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              Track your {serviceType} request progress in real-time.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time Elapsed</p>
                  <p className="font-semibold">{formatTime(timeElapsed)}</p>
                </div>
              </div>
              {estimatedArrival && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Estimated arrival: {estimatedArrival}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Info */}
          {driverInfo && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-center sm:text-left">Your Driver</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {driverInfo.photo ? (
                      <img 
                        src={driverInfo.photo} 
                        alt={driverInfo.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {driverInfo.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{driverInfo.name}</p>
                    {driverInfo.vehicle && (
                      <p className="text-sm text-gray-600">{driverInfo.vehicle}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{driverInfo.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onContact}>
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={onContact}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicator */}
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            serviceType={serviceType}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && currentStep < steps.length - 1 && (
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onCancel}
              >
                Cancel Request
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button 
                className="flex-1" 
                onClick={onClose}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceProgressModal;