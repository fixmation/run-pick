import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Car, 
  UtensilsCrossed,
  Package,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Key,
  Building2,
  Truck,
  Bike,
  Store
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OnboardingAuthProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'register';
}

const OnboardingAuth = ({ isOpen, onClose, defaultTab = 'signin' }: OnboardingAuthProps) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });

  // Registration Form State
  const [registrationData, setRegistrationData] = useState({
    // Step 1: Basic Info
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal Details
    firstName: '',
    lastName: '',
    phoneNumber: '',
    // Step 3: Role & Location
    role: '',
    businessType: '',
    driverType: '',
    city: '',
    district: '',
    adminSecret: ''
  });

  const sriLankanDistricts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const userRoles = [
    { value: 'customer', label: 'Customer', icon: User, description: 'Book rides, order food & deliveries', intro: 'Looking to use our services? Register as a customer to book rides, order food, and request deliveries.' },
    { value: 'driver', label: 'Driver', icon: Car, description: 'Provide transportation and delivery services', intro: 'Join as a driver to earn money by providing rides and delivery services. Choose your vehicle type below.' },
    { value: 'business', label: 'Business', icon: Building2, description: 'Manage your business and services', intro: 'Register your business to offer services on our platform. Select your business type below.' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform administration and management', intro: 'Administrative access for platform management. Requires admin secret code.' }
  ];

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed, description: 'Food delivery and dining services' },
    { value: 'gas_agent', label: 'Gas Agent', icon: Package, description: 'Gas cylinder delivery services' },
    { value: 'grocery', label: 'Grocery Store', icon: Store, description: 'Grocery and daily essentials' },
    { value: 'pharmacy', label: 'Pharmacy', icon: Package, description: 'Medicine and health products' },
    { value: 'electronics', label: 'Electronics Shop', icon: Store, description: 'Electronic goods and gadgets' }
  ];

  const driverTypes = [
    { value: 'car_driver', label: 'Car Driver', icon: Car, description: 'Passenger transportation services' },
    { value: 'bike_rider', label: 'Bike Rider', icon: Bike, description: 'Quick delivery and short trips' },
    { value: 'heavy_vehicle', label: 'Heavy Vehicle', icon: Truck, description: 'Large deliveries and moving services' }
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email: signInData.username, password: signInData.password });
      toast.success("Welcome back!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationNext = () => {
    if (registrationStep === 1) {
      if (!registrationData.username || !registrationData.email || !registrationData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (registrationData.password !== registrationData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      if (registrationData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }
    
    if (registrationStep === 2) {
      if (!registrationData.firstName || !registrationData.lastName) {
        toast.error("Please enter your name");
        return;
      }
    }

    setRegistrationStep(prev => prev + 1);
  };

  const handleRegistrationComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!registrationData.role || !registrationData.district) {
      toast.error("Please complete all fields");
      setIsLoading(false);
      return;
    }

    if (registrationData.role === 'business' && !registrationData.businessType) {
      toast.error("Please select your business type");
      setIsLoading(false);
      return;
    }

    if (registrationData.role === 'driver' && !registrationData.driverType) {
      toast.error("Please select your driver type");
      setIsLoading(false);
      return;
    }

    if (registrationData.role === 'admin' && !registrationData.adminSecret) {
      toast.error("Admin secret code is required for admin registration");
      setIsLoading(false);
      return;
    }

    try {
      const registerData: any = {
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phoneNumber: registrationData.phoneNumber,
        role: registrationData.role,
        city: registrationData.city,
        district: registrationData.district
      };

      if (registrationData.role === 'admin') {
        registerData.adminSecret = registrationData.adminSecret;
      }

      if (registrationData.role === 'business') {
        registerData.businessType = registrationData.businessType;
      }

      if (registrationData.role === 'driver') {
        registerData.driverType = registrationData.driverType;
      }

      await register(registerData);
      
      toast.success("Account created successfully! Welcome to Run Pick!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto mx-auto my-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Welcome to Run Pick
          </CardTitle>
          <p className="text-gray-600">Sri Lanka's #1 Multi-Service Platform</p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-username">Username or Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-username"
                      type="text"
                      placeholder="Enter your username or email"
                      value={signInData.username}
                      onChange={(e) => setSignInData({...signInData, username: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                <div className="text-center text-sm">
                  <button 
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => toast.info("Password reset feature coming soon!")}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register">
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-center mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= registrationStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < registrationStep ? <CheckCircle className="h-4 w-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-1 mx-1 ${
                        step < registrationStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Account Information */}
              {registrationStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Create Account</h3>
                    <p className="text-sm text-gray-600">Let's start with your basic information</p>
                  </div>

                  <div>
                    <Label htmlFor="reg-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registrationData.username}
                        onChange={(e) => setRegistrationData({...registrationData, username: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={registrationData.password}
                        onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registrationData.confirmPassword}
                        onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleRegistrationNext}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {registrationStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Personal Details</h3>
                    <p className="text-sm text-gray-600">Tell us a bit about yourself</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg-firstname">First Name</Label>
                      <Input
                        id="reg-firstname"
                        type="text"
                        placeholder="First name"
                        value={registrationData.firstName}
                        onChange={(e) => setRegistrationData({...registrationData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-lastname">Last Name</Label>
                      <Input
                        id="reg-lastname"
                        type="text"
                        placeholder="Last name"
                        value={registrationData.lastName}
                        onChange={(e) => setRegistrationData({...registrationData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-phone">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+94 71 234 5678"
                        value={registrationData.phoneNumber}
                        onChange={(e) => setRegistrationData({...registrationData, phoneNumber: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setRegistrationStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button 
                      onClick={handleRegistrationNext}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Role & Location */}
              {registrationStep === 3 && (
                <form onSubmit={handleRegistrationComplete} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Almost Done!</h3>
                    <p className="text-sm text-gray-600">Choose your role and location</p>
                  </div>

                  <div>
                    <Label htmlFor="reg-role">I want to join as a:</Label>
                    <Select value={registrationData.role} onValueChange={(value) => setRegistrationData({...registrationData, role: value, businessType: '', driverType: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map((role) => {
                          const Icon = role.icon;
                          return (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div className="font-medium">{role.label}</div>
                                  <div className="text-xs text-gray-500">{role.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    
                    {/* Role Introduction */}
                    {registrationData.role && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          {userRoles.find(r => r.value === registrationData.role)?.intro}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Business Type Dropdown - Only show for business role */}
                  {registrationData.role === 'business' && (
                    <div>
                      <Label htmlFor="reg-business-type">Business Type</Label>
                      <Select value={registrationData.businessType} onValueChange={(value) => setRegistrationData({...registrationData, businessType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((business) => {
                            const Icon = business.icon;
                            return (
                              <SelectItem key={business.value} value={business.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-green-600" />
                                  <div>
                                    <div className="font-medium">{business.label}</div>
                                    <div className="text-xs text-gray-500">{business.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Driver Type Dropdown - Only show for driver role */}
                  {registrationData.role === 'driver' && (
                    <div>
                      <Label htmlFor="reg-driver-type">Driver Type</Label>
                      <Select value={registrationData.driverType} onValueChange={(value) => setRegistrationData({...registrationData, driverType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your driver type" />
                        </SelectTrigger>
                        <SelectContent>
                          {driverTypes.map((driver) => {
                            const Icon = driver.icon;
                            return (
                              <SelectItem key={driver.value} value={driver.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-orange-600" />
                                  <div>
                                    <div className="font-medium">{driver.label}</div>
                                    <div className="text-xs text-gray-500">{driver.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Admin Secret Field - Only show for admin role */}
                  {registrationData.role === 'admin' && (
                    <div>
                      <Label htmlFor="reg-admin-secret">Admin Secret Code</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-admin-secret"
                          type="password"
                          placeholder="Enter admin secret code"
                          value={registrationData.adminSecret}
                          onChange={(e) => setRegistrationData({...registrationData, adminSecret: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Contact your system administrator for the admin secret code
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reg-district">District</Label>
                    <Select value={registrationData.district} onValueChange={(value) => setRegistrationData({...registrationData, district: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your district" />
                      </SelectTrigger>
                      <SelectContent>
                        {sriLankanDistricts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reg-city">City (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-city"
                        type="text"
                        placeholder="Your city"
                        value={registrationData.city}
                        onChange={(e) => setRegistrationData({...registrationData, city: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setRegistrationStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Close Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingAuth;