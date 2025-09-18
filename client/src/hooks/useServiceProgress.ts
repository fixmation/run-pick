import { useState, useEffect, useCallback } from 'react';
import { ProgressStep } from '@/components/ui/progress-indicator';
import { Clock, Truck, MapPin, CheckCircle, Package, Car, UtensilsCrossed, ChefHat, Calendar } from 'lucide-react';

interface UseServiceProgressProps {
  serviceType: 'taxi' | 'food' | 'parcel';
  orderId?: string;
  autoProgress?: boolean;
  progressInterval?: number;
}

interface ServiceProgressState {
  steps: ProgressStep[];
  currentStep: number;
  isComplete: boolean;
  estimatedArrival?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicle?: string;
    rating: number;
    photo?: string;
  };
}

export const useServiceProgress = ({
  serviceType,
  orderId,
  autoProgress = false,
  progressInterval = 3000
}: UseServiceProgressProps) => {
  const [state, setState] = useState<ServiceProgressState>(() => {
    const initialSteps = getStepsForService(serviceType);
    return {
      steps: initialSteps,
      currentStep: 0,
      isComplete: false
    };
  });

  // Auto-progress for demo purposes
  useEffect(() => {
    if (!autoProgress || state.isComplete) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.currentStep >= prev.steps.length - 1) {
          return { ...prev, isComplete: true };
        }
        return { ...prev, currentStep: prev.currentStep + 1 };
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [autoProgress, progressInterval, state.isComplete]);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (prev.currentStep >= prev.steps.length - 1) {
        return { ...prev, isComplete: true };
      }
      return { ...prev, currentStep: prev.currentStep + 1 };
    });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.steps.length - 1))
    }));
  }, []);

  const setDriverInfo = useCallback((driverInfo: ServiceProgressState['driverInfo']) => {
    setState(prev => ({ ...prev, driverInfo }));
  }, []);

  const setEstimatedArrival = useCallback((estimatedArrival: string) => {
    setState(prev => ({ ...prev, estimatedArrival }));
  }, []);

  const reset = useCallback(() => {
    setState({
      steps: getStepsForService(serviceType),
      currentStep: 0,
      isComplete: false
    });
  }, [serviceType]);

  return {
    ...state,
    nextStep,
    setCurrentStep,
    setDriverInfo,
    setEstimatedArrival,
    reset
  };
};

function getStepsForService(serviceType: 'taxi' | 'food' | 'parcel'): ProgressStep[] {
  switch (serviceType) {
    case 'taxi':
      return [
        {
          id: 'request',
          title: 'Request Submitted',
          description: 'Looking for nearby drivers',
          icon: Clock,
          status: 'pending',
          estimatedTime: '1-2 min'
        },
        {
          id: 'assigned',
          title: 'Driver Assigned',
          description: 'Driver is on the way to pick you up',
          icon: Car,
          status: 'pending',
          estimatedTime: '5-8 min'
        },
        {
          id: 'pickup',
          title: 'Driver Arrived',
          description: 'Your driver has arrived at pickup location',
          icon: MapPin,
          status: 'pending'
        },
        {
          id: 'enroute',
          title: 'En Route',
          description: 'Heading to your destination',
          icon: Truck,
          status: 'pending'
        },
        {
          id: 'completed',
          title: 'Trip Completed',
          description: 'You have arrived at your destination',
          icon: CheckCircle,
          status: 'pending'
        }
      ];

    case 'food':
      return [
        {
          id: 'order',
          title: 'Order Placed',
          description: 'Restaurant is preparing your food',
          icon: UtensilsCrossed,
          status: 'pending',
          estimatedTime: '15-20 min'
        },
        {
          id: 'preparing',
          title: 'Preparing Food',
          description: 'Your order is being cooked',
          icon: ChefHat,
          status: 'pending',
          estimatedTime: '10-15 min'
        },
        {
          id: 'ready',
          title: 'Ready for Pickup',
          description: 'Food is ready, looking for delivery partner',
          icon: CheckCircle,
          status: 'pending',
          estimatedTime: '3-5 min'
        },
        {
          id: 'pickup',
          title: 'Out for Delivery',
          description: 'Delivery partner picked up your order',
          icon: Truck,
          status: 'pending',
          estimatedTime: '15-25 min'
        },
        {
          id: 'delivered',
          title: 'Delivered',
          description: 'Your food has been delivered',
          icon: CheckCircle,
          status: 'pending'
        }
      ];

    case 'parcel':
      return [
        {
          id: 'booking',
          title: 'Booking Confirmed',
          description: 'Your parcel delivery has been scheduled',
          icon: Package,
          status: 'pending'
        },
        {
          id: 'pickup-scheduled',
          title: 'Pickup Scheduled',
          description: 'Driver assigned for parcel collection',
          icon: Calendar,
          status: 'pending',
          estimatedTime: '30-60 min'
        },
        {
          id: 'collected',
          title: 'Parcel Collected',
          description: 'Your parcel has been picked up',
          icon: CheckCircle,
          status: 'pending'
        },
        {
          id: 'in-transit',
          title: 'In Transit',
          description: 'Parcel is on the way to destination',
          icon: Truck,
          status: 'pending'
        },
        {
          id: 'delivered',
          title: 'Delivered',
          description: 'Parcel successfully delivered',
          icon: MapPin,
          status: 'pending'
        }
      ];

    default:
      return [];
  }
}