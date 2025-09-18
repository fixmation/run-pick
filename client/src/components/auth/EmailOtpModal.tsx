import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (userData: { email: string; name: string }) => void;
  title?: string;
  description?: string;
}

const EmailOtpModal: React.FC<EmailOtpModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  title = "Sign up to continue",
  description = "Please verify your email address to book your ride"
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'verified'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setName('');
      setOtp('');
      setError('');
      setCountdown(0);
      setGeneratedOtp('');
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = async () => {
    if (!email || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate OTP
      const otpCode = generateOtp();
      setGeneratedOtp(otpCode);

      // Send OTP via email (API call)
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          otp: otpCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      setStep('otp');
      setCountdown(60);
      
      // For demo purposes, show the OTP in console/toast
      console.log(`Demo OTP for ${email}: ${otpCode}`);
      toast({
        title: "Verification Code Sent",
        description: `Check your email at ${email}. For demo: ${otpCode}`,
      });

    } catch (error) {
      // Fallback for demo - still proceed to OTP step
      const otpCode = generateOtp();
      setGeneratedOtp(otpCode);
      setStep('otp');
      setCountdown(60);
      
      toast({
        title: "Demo Mode",
        description: `Email service not configured. Demo OTP: ${otpCode}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    if (otp !== generatedOtp) {
      setError('Invalid verification code. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate verification API call
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp
        })
      });

      if (!response.ok && response.status !== 404) {
        throw new Error('Verification failed');
      }

      setStep('verified');
      
      toast({
        title: "Email Verified Successfully",
        description: "You can now proceed with your booking",
      });

      // Wait a moment then call onVerified
      setTimeout(() => {
        onVerified({ email, name });
      }, 1500);

    } catch (error) {
      // Fallback for demo - still proceed
      setStep('verified');
      setTimeout(() => {
        onVerified({ email, name });
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    handleSendOtp();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleSendOtp} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center mb-4">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-wider"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleVerifyOtp} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  className={`text-sm ${
                    countdown > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-blue-600 hover:underline'
                  }`}
                >
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Resend in {countdown}s</span>
                    </div>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'verified' && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Email Verified!
              </h3>
              <p className="text-sm text-gray-600">
                Proceeding with your booking...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailOtpModal;