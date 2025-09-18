import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, UserCheck, LogIn } from 'lucide-react';

interface LoginRequiredMessageProps {
  message?: string;
  onLoginClick?: () => void;
}

const LoginRequiredMessage: React.FC<LoginRequiredMessageProps> = ({
  message = "Please log in to access this feature",
  onLoginClick
}) => {
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      // Default: scroll to top to show login modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={handleLoginClick}
              className="w-full h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full h-12 min-h-[48px]"
            >
              Go to Home
            </Button>
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <UserCheck className="w-4 h-4" />
              <span>Secure access for registered users only</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginRequiredMessage;