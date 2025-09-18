import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  MapPin, 
  Car, 
  UtensilsCrossed, 
  Package, 
  CheckCircle, 
  Play,
  Sparkles,
  UserCheck,
  Target,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: {
    type: 'highlight' | 'click' | 'input' | 'demo';
    target?: string;
    content?: string;
  };
  tips?: string[];
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'customer' | 'driver' | 'vendor';
  onComplete?: (completedSteps: string[]) => void;
}

const OnboardingTutorial = ({ 
  isOpen, 
  onClose, 
  userRole = 'customer',
  onComplete 
}: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  // Customer onboarding steps
  const customerSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Run Pick!',
      description: 'Your all-in-one platform for taxi booking, food delivery, and parcel services across Sri Lanka.',
      icon: Sparkles,
      tips: [
        'Access all services from one convenient app',
        'Real-time tracking for all your orders',
        'Secure payments and reliable service'
      ]
    },
    {
      id: 'location',
      title: 'Set Your Location',
      description: 'Enable location services to get personalized recommendations and accurate service estimates.',
      icon: MapPin,
      action: {
        type: 'highlight',
        target: 'location-picker',
        content: 'Click here to set your current location'
      },
      tips: [
        'We use your location to find nearby services',
        'Your location data is kept private and secure',
        'You can always change your location manually'
      ]
    },
    {
      id: 'services',
      title: 'Explore Our Services',
      description: 'Discover taxi booking, food delivery, parcel delivery, and more coming soon.',
      icon: Target,
      action: {
        type: 'highlight',
        target: 'services-grid',
        content: 'Browse available services in your area'
      },
      tips: [
        'Taxi: Book rides with different vehicle types',
        'Food: Order from local restaurants',
        'Parcel: Send packages anywhere in Sri Lanka'
      ]
    },
    {
      id: 'recommendations',
      title: 'Smart Recommendations',
      description: 'Get personalized service suggestions based on your location and preferences.',
      icon: UserCheck,
      action: {
        type: 'highlight',
        target: 'recommendations',
        content: 'See what\'s available near you right now'
      },
      tips: [
        'Recommendations update based on your location',
        'See nearby drivers, restaurants, and delivery options',
        'Get estimated times and distances'
      ]
    },
    {
      id: 'vehicle-selection',
      title: 'Choose Your Vehicle',
      description: 'Select from our range of vehicles including Threewheeler, Bike, Mini Car, and more - all with transparent pricing.',
      icon: Car,
      action: {
        type: 'demo',
        content: 'Vehicle options: Threewheeler (3 passengers), Bike (1 passenger), Mini Car (3 passengers) - all starting from LKR 1000'
      },
      tips: [
        'All vehicles available within 3 minutes',
        'Fixed pricing of LKR 1000 for standard trips',
        'Choose based on passenger capacity and comfort'
      ]
    },
    {
      id: 'payment-options',
      title: 'Payment Methods',
      description: 'Pay conveniently with Cash or Token system for a seamless experience.',
      icon: CreditCard,
      action: {
        type: 'highlight',
        target: 'payment-selection',
        content: 'Choose Cash payment or use Token system'
      },
      tips: [
        'Cash: Pay directly to the driver',
        'Token: Pre-paid digital payment system',
        'Add remarks for special instructions'
      ]
    },
    {
      id: 'booking',
      title: 'Quick Booking',
      description: 'Book any service in just a few taps with our streamlined booking process.',
      icon: CheckCircle,
      action: {
        type: 'demo',
        content: 'Try booking a taxi or ordering food'
      },
      tips: [
        'All bookings show real-time tracking',
        'Rate your experience to help improve services',
        'Support is available 24/7 for any issues'
      ]
    }
  ];

  // Driver onboarding steps
  const driverSteps: OnboardingStep[] = [
    {
      id: 'welcome-driver',
      title: 'Welcome, Driver Partner!',
      description: 'Start earning with Run Pick by providing taxi, food delivery, or parcel services.',
      icon: Sparkles,
      tips: [
        'Flexible working hours',
        'Weekly commission payments',
        'Growing customer base across Sri Lanka'
      ]
    },
    {
      id: 'vehicle-setup',
      title: 'Vehicle Registration',
      description: 'Register your vehicle and upload required documents to start accepting rides.',
      icon: Car,
      action: {
        type: 'highlight',
        target: 'vehicle-registration',
        content: 'Complete your vehicle registration'
      },
      tips: [
        'Upload clear photos of your license and vehicle',
        'Verification typically takes 24-48 hours',
        'You can register multiple vehicles'
      ]
    },
    {
      id: 'go-online',
      title: 'Going Online',
      description: 'Toggle your availability to start receiving ride and delivery requests.',
      icon: Play,
      tips: [
        'Toggle online/offline anytime',
        'Higher earnings during peak hours',
        'Accept requests that work for your schedule'
      ]
    }
  ];

  // Vendor onboarding steps
  const vendorSteps: OnboardingStep[] = [
    {
      id: 'welcome-vendor',
      title: 'Welcome, Business Partner!',
      description: 'Expand your restaurant or shop\'s reach with Run Pick\'s delivery platform.',
      icon: Sparkles,
      tips: [
        'Reach more customers across your city',
        'Easy menu and inventory management',
        'Real-time order tracking and analytics'
      ]
    },
    {
      id: 'business-setup',
      title: 'Business Setup',
      description: 'Add your business details, location, and operating hours.',
      icon: UtensilsCrossed,
      action: {
        type: 'highlight',
        target: 'business-registration',
        content: 'Complete your business profile'
      },
      tips: [
        'Add high-quality photos of your products',
        'Set accurate delivery times and areas',
        'Keep your menu updated regularly'
      ]
    },
    {
      id: 'orders',
      title: 'Managing Orders',
      description: 'Learn how to accept, prepare, and track customer orders.',
      icon: Package,
      tips: [
        'Accept orders within 2 minutes for best ratings',
        'Update customers on any delays',
        'Use our driver network for deliveries'
      ]
    }
  ];

  const steps = userRole === 'driver' ? driverSteps : userRole === 'vendor' ? vendorSteps : customerSteps;

  useEffect(() => {
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem(`runpick-onboarding-${userRole}`);
    if (hasCompletedOnboarding && !isOpen) {
      setIsCompleted(true);
    }
  }, [userRole, isOpen]);

  const handleNext = () => {
    const step = steps[currentStep];
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps(prev => [...prev, step.id]);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsCompleted(true);
    localStorage.setItem(`runpick-onboarding-${userRole}`, 'skipped');
    onClose();
    toast({
      title: "Onboarding skipped",
      description: "You can always access the tutorial from your profile settings.",
    });
  };

  const handleComplete = () => {
    setIsCompleted(true);
    localStorage.setItem(`runpick-onboarding-${userRole}`, 'completed');
    localStorage.setItem(`runpick-onboarding-steps-${userRole}`, JSON.stringify(completedSteps));
    
    onComplete?.(completedSteps);
    onClose();
    
    toast({
      title: "Welcome to Run Pick!",
      description: "You're all set to start using our services.",
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!isOpen || isCompleted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Progress value={progress} className="mt-2" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700 rounded-full flex items-center justify-center mx-auto">
                  <currentStepData.icon className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <CardTitle className="text-xl mb-2">{currentStepData.title}</CardTitle>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {currentStepData.action && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm font-medium">
                      {currentStepData.action.content}
                    </p>
                  </div>
                )}
              </div>

              {currentStepData.tips && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Quick Tips:</h4>
                  <ul className="space-y-1">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSkip}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Skip tutorial
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTutorial;