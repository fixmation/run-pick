import React from 'react';
import { CheckCircle, Clock, Truck, MapPin, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'active' | 'completed';
  estimatedTime?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  serviceType: 'taxi' | 'food' | 'parcel' | 'general';
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  serviceType,
  className
}) => {
  const getServiceColor = () => {
    switch (serviceType) {
      case 'taxi': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'food': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'parcel': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto px-4 sm:px-0 text-center", className)}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-6 h-full w-0.5 bg-gray-200">
          <div 
            className={cn(
              "w-full bg-gradient-to-b transition-all duration-1000 ease-out",
              serviceType === 'taxi' && "from-blue-500 to-blue-600",
              serviceType === 'food' && "from-orange-500 to-orange-600", 
              serviceType === 'parcel' && "from-green-500 to-green-600",
              serviceType === 'general' && "from-gray-500 to-gray-600"
            )}
            style={{
              height: `${(currentStep / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const StepIcon = step.icon;
            
            return (
              <div key={step.id} className="relative flex items-start">
                {/* Step Circle */}
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 z-10 bg-white",
                  status === 'completed' && serviceType === 'taxi' && "border-blue-500 bg-blue-50",
                  status === 'completed' && serviceType === 'food' && "border-orange-500 bg-orange-50",
                  status === 'completed' && serviceType === 'parcel' && "border-green-500 bg-green-50",
                  status === 'completed' && serviceType === 'general' && "border-gray-500 bg-gray-50",
                  status === 'active' && "border-2 animate-pulse",
                  status === 'active' && serviceType === 'taxi' && "border-blue-500 bg-blue-100",
                  status === 'active' && serviceType === 'food' && "border-orange-500 bg-orange-100",
                  status === 'active' && serviceType === 'parcel' && "border-green-500 bg-green-100",
                  status === 'active' && serviceType === 'general' && "border-gray-500 bg-gray-100",
                  status === 'pending' && "border-gray-300 bg-gray-50"
                )}>
                  {status === 'completed' ? (
                    <CheckCircle className={cn(
                      "w-6 h-6",
                      serviceType === 'taxi' && "text-blue-600",
                      serviceType === 'food' && "text-orange-600",
                      serviceType === 'parcel' && "text-green-600",
                      serviceType === 'general' && "text-gray-600"
                    )} />
                  ) : (
                    <StepIcon className={cn(
                      "w-6 h-6 transition-all duration-300",
                      status === 'active' && serviceType === 'taxi' && "text-blue-600",
                      status === 'active' && serviceType === 'food' && "text-orange-600",
                      status === 'active' && serviceType === 'parcel' && "text-green-600",
                      status === 'active' && serviceType === 'general' && "text-gray-600",
                      status === 'pending' && "text-gray-400"
                    )} />
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1 pb-6">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "text-lg font-semibold transition-colors duration-300 text-center",
                      status === 'completed' && serviceType === 'taxi' && "text-blue-700",
                      status === 'completed' && serviceType === 'food' && "text-orange-700",
                      status === 'completed' && serviceType === 'parcel' && "text-green-700",
                      status === 'completed' && serviceType === 'general' && "text-gray-700",
                      status === 'active' && "text-gray-900",
                      status === 'pending' && "text-gray-500"
                    )}>
                      {step.title}
                    </h3>
                    {step.estimatedTime && status === 'active' && (
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getServiceColor()
                      )}>
                        {step.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm mt-1 transition-colors duration-300 text-center",
                    status === 'active' && "text-gray-700",
                    status !== 'active' && "text-gray-500"
                  )}>
                    {step.description}
                  </p>
                  
                  {/* Loading animation for active step */}
                  {status === 'active' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-center space-x-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-bounce",
                          serviceType === 'taxi' && "bg-blue-500",
                          serviceType === 'food' && "bg-orange-500",
                          serviceType === 'parcel' && "bg-green-500",
                          serviceType === 'general' && "bg-gray-500"
                        )} style={{ animationDelay: '0ms' }} />
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-bounce",
                          serviceType === 'taxi' && "bg-blue-500",
                          serviceType === 'food' && "bg-orange-500",
                          serviceType === 'parcel' && "bg-green-500",
                          serviceType === 'general' && "bg-gray-500"
                        )} style={{ animationDelay: '150ms' }} />
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-bounce",
                          serviceType === 'taxi' && "bg-blue-500",
                          serviceType === 'food' && "bg-orange-500",
                          serviceType === 'parcel' && "bg-green-500",
                          serviceType === 'general' && "bg-gray-500"
                        )} style={{ animationDelay: '300ms' }} />
                        <span className="text-sm text-gray-600 ml-2">Processing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;