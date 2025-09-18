import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ServiceProgressModal from '@/components/ui/service-progress-modal';
import { useServiceProgress } from '@/hooks/useServiceProgress';
import { useToast } from '@/hooks/use-toast';

interface ServiceBookingButtonProps {
  serviceType: 'taxi' | 'food' | 'parcel';
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  onBookingStart?: () => void;
  onBookingComplete?: () => void;
}

const ServiceBookingButton: React.FC<ServiceBookingButtonProps> = ({
  serviceType,
  children,
  disabled = false,
  className,
  variant = 'default',
  size = 'default',
  onBookingStart,
  onBookingComplete
}) => {
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const { toast } = useToast();
  
  const serviceProgress = useServiceProgress({
    serviceType,
    orderId,
    autoProgress: true,
    progressInterval: 4000
  });

  const handleBookService = () => {
    // Generate order ID
    const newOrderId = `${serviceType.toUpperCase()}-${Date.now()}`;
    setOrderId(newOrderId);
    
    // Simulate driver assignment after 2 seconds
    setTimeout(() => {
      serviceProgress.setDriverInfo({
        name: 'Kamal Silva',
        phone: '+94 77 123 4567',
        vehicle: serviceType === 'taxi' ? 'Toyota Prius - CAA 1234' : 'Honda Bike - BCB 5678',
        rating: 4.8,
      });
      serviceProgress.setEstimatedArrival('12-15 minutes');
    }, 2000);

    // Show progress modal
    setIsProgressModalOpen(true);
    onBookingStart?.();
    
    toast({
      title: "Booking Confirmed!",
      description: `Your ${serviceType} request has been submitted successfully.`,
    });
  };

  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
    serviceProgress.reset();
    onBookingComplete?.();
  };

  const handleCancelBooking = () => {
    toast({
      title: "Booking Cancelled",
      description: "Your service request has been cancelled.",
      variant: "destructive"
    });
    handleCloseProgressModal();
  };

  const handleContactDriver = () => {
    if (serviceProgress.driverInfo) {
      toast({
        title: "Contact Driver",
        description: `Calling ${serviceProgress.driverInfo.name}...`,
      });
    }
  };

  return (
    <>
      <Button
        onClick={handleBookService}
        disabled={disabled}
        className={`h-12 min-h-[48px] ${className}`}
        variant={variant}
      >
        {children}
      </Button>

      <ServiceProgressModal
        isOpen={isProgressModalOpen}
        onClose={handleCloseProgressModal}
        serviceType={serviceType}
        orderId={orderId}
        steps={serviceProgress.steps}
        currentStep={serviceProgress.currentStep}
        driverInfo={serviceProgress.driverInfo}
        estimatedArrival={serviceProgress.estimatedArrival}
        onCancel={handleCancelBooking}
        onContact={handleContactDriver}
      />
    </>
  );
};

export default ServiceBookingButton;