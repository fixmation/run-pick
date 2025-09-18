import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Store, Upload, Clock, CheckCircle, MapPin, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

const restaurantApplicationSchema = z.object({
  businessInfo: z.object({
    restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
    ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    businessRegistration: z.string().min(5, "Please enter business registration number"),
    taxId: z.string().optional(),
  }),
  locationInfo: z.object({
    address: z.string().min(10, "Please enter your complete address"),
    city: z.string().min(2, "Please select your city"),
    postalCode: z.string().min(5, "Please enter postal code"),
    landmark: z.string().optional(),
    deliveryRadius: z.string().min(1, "Please select delivery radius"),
  }),
  restaurantDetails: z.object({
    cuisineType: z.string().min(1, "Please select cuisine type"),
    restaurantType: z.string().min(1, "Please select restaurant type"),
    seatingCapacity: z.string().min(1, "Please enter seating capacity"),
    operatingHours: z.object({
      openTime: z.string().min(1, "Please enter opening time"),
      closeTime: z.string().min(1, "Please enter closing time"),
      operatingDays: z.string().min(1, "Please select operating days"),
    }),
    averageOrderValue: z.string().min(1, "Please select average order value"),
    monthlyOrders: z.string().optional(),
  }),
  documents: z.object({
    businessLicense: z.string().min(1, "Business license is required"),
    foodLicense: z.string().min(1, "Food service license is required"),
    taxCertificate: z.string().optional(),
    menuCard: z.string().min(1, "Sample menu is required"),
  }),
  agreements: z.object({
    termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
    commissionAccepted: z.boolean().refine(val => val === true, "You must accept the commission structure"),
    qualityStandards: z.boolean().refine(val => val === true, "You must agree to maintain quality standards"),
  })
});

type RestaurantApplicationData = z.infer<typeof restaurantApplicationSchema>;

const RestaurantApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RestaurantApplicationData>({
    resolver: zodResolver(restaurantApplicationSchema),
    defaultValues: {
      businessInfo: {
        restaurantName: "",
        ownerName: "",
        email: "",
        phone: "",
        businessRegistration: "",
        taxId: "",
      },
      locationInfo: {
        address: "",
        city: "",
        postalCode: "",
        landmark: "",
        deliveryRadius: "",
      },
      restaurantDetails: {
        cuisineType: "",
        restaurantType: "",
        seatingCapacity: "",
        operatingHours: {
          openTime: "",
          closeTime: "",
          operatingDays: "",
        },
        averageOrderValue: "",
        monthlyOrders: "",
      },
      documents: {
        businessLicense: "",
        foodLicense: "",
        taxCertificate: "",
        menuCard: "",
      },
      agreements: {
        termsAccepted: false,
        commissionAccepted: false,
        qualityStandards: false,
      }
    }
  });

  const totalSteps = 5;

  const onSubmit = async (data: RestaurantApplicationData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Restaurant application submitted:", data);
      
      toast({
        title: "Application Submitted Successfully!",
        description: "We'll review your application and contact you within 3-5 business days.",
      });

      // Redirect to success page or dashboard
      // window.location.href = '/restaurant-application-success';
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof RestaurantApplicationData | `${keyof RestaurantApplicationData}.${string}`)[] => {
    switch (step) {
      case 1:
        return [
          'businessInfo.restaurantName',
          'businessInfo.ownerName',
          'businessInfo.email',
          'businessInfo.phone',
          'businessInfo.businessRegistration'
        ];
      case 2:
        return [
          'locationInfo.address',
          'locationInfo.city',
          'locationInfo.postalCode',
          'locationInfo.deliveryRadius'
        ];
      case 3:
        return [
          'restaurantDetails.cuisineType',
          'restaurantDetails.restaurantType',
          'restaurantDetails.seatingCapacity',
          'restaurantDetails.operatingHours.openTime',
          'restaurantDetails.operatingHours.closeTime',
          'restaurantDetails.operatingHours.operatingDays',
          'restaurantDetails.averageOrderValue'
        ];
      case 4:
        return [
          'documents.businessLicense',
          'documents.foodLicense',
          'documents.menuCard'
        ];
      case 5:
        return ['agreements.termsAccepted', 'agreements.commissionAccepted', 'agreements.qualityStandards'];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Business Information</h2>
              <p className="text-gray-600">Tell us about your restaurant</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  {...form.register("businessInfo.restaurantName")}
                  placeholder="Enter your restaurant name"
                />
                {form.formState.errors.businessInfo?.restaurantName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.businessInfo.restaurantName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="ownerName">Owner/Manager Name</Label>
                <Input
                  id="ownerName"
                  {...form.register("businessInfo.ownerName")}
                  placeholder="Enter owner's full name"
                />
                {form.formState.errors.businessInfo?.ownerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.businessInfo.ownerName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("businessInfo.email")}
                  placeholder="restaurant@example.com"
                />
                {form.formState.errors.businessInfo?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.businessInfo.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Contact Number</Label>
                <Input
                  id="phone"
                  {...form.register("businessInfo.phone")}
                  placeholder="+94 11 234 5678"
                />
                {form.formState.errors.businessInfo?.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.businessInfo.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessRegistration">Business Registration Number</Label>
                <Input
                  id="businessRegistration"
                  {...form.register("businessInfo.businessRegistration")}
                  placeholder="Enter business registration number"
                />
                {form.formState.errors.businessInfo?.businessRegistration && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.businessInfo.businessRegistration.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  {...form.register("businessInfo.taxId")}
                  placeholder="Tax identification number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Location Information</h2>
              <p className="text-gray-600">Where is your restaurant located?</p>
            </div>

            <div>
              <Label htmlFor="address">Complete Address</Label>
              <Textarea
                id="address"
                {...form.register("locationInfo.address")}
                placeholder="Enter your restaurant's complete address"
                rows={3}
              />
              {form.formState.errors.locationInfo?.address && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.locationInfo.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Select onValueChange={(value) => form.setValue("locationInfo.city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colombo">Colombo</SelectItem>
                    <SelectItem value="kandy">Kandy</SelectItem>
                    <SelectItem value="galle">Galle</SelectItem>
                    <SelectItem value="negombo">Negombo</SelectItem>
                    <SelectItem value="jaffna">Jaffna</SelectItem>
                    <SelectItem value="batticaloa">Batticaloa</SelectItem>
                    <SelectItem value="matara">Matara</SelectItem>
                    <SelectItem value="kurunegala">Kurunegala</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.locationInfo?.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.locationInfo.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  {...form.register("locationInfo.postalCode")}
                  placeholder="e.g., 10100"
                />
                {form.formState.errors.locationInfo?.postalCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.locationInfo.postalCode.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="deliveryRadius">Delivery Radius</Label>
                <Select onValueChange={(value) => form.setValue("locationInfo.deliveryRadius", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2km">Within 2km</SelectItem>
                    <SelectItem value="5km">Within 5km</SelectItem>
                    <SelectItem value="10km">Within 10km</SelectItem>
                    <SelectItem value="15km">Within 15km</SelectItem>
                    <SelectItem value="20km">Within 20km</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.locationInfo?.deliveryRadius && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.locationInfo.deliveryRadius.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
              <Input
                id="landmark"
                {...form.register("locationInfo.landmark")}
                placeholder="e.g., Near City Mall, Next to Bank"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Restaurant Details</h2>
              <p className="text-gray-600">Tell us more about your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <Select onValueChange={(value) => form.setValue("restaurantDetails.cuisineType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sri-lankan">Sri Lankan</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="thai">Thai</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="fusion">Fusion</SelectItem>
                    <SelectItem value="fast-food">Fast Food</SelectItem>
                    <SelectItem value="seafood">Seafood</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.restaurantDetails?.cuisineType && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.restaurantDetails.cuisineType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="restaurantType">Restaurant Type</Label>
                <Select onValueChange={(value) => form.setValue("restaurantDetails.restaurantType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fine-dining">Fine Dining</SelectItem>
                    <SelectItem value="casual-dining">Casual Dining</SelectItem>
                    <SelectItem value="fast-casual">Fast Casual</SelectItem>
                    <SelectItem value="quick-service">Quick Service</SelectItem>
                    <SelectItem value="cafe">Cafe</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="food-truck">Food Truck</SelectItem>
                    <SelectItem value="cloud-kitchen">Cloud Kitchen</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.restaurantDetails?.restaurantType && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.restaurantDetails.restaurantType.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                <Select onValueChange={(value) => form.setValue("restaurantDetails.seatingCapacity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Delivery Only</SelectItem>
                    <SelectItem value="1-20">1-20 seats</SelectItem>
                    <SelectItem value="21-50">21-50 seats</SelectItem>
                    <SelectItem value="51-100">51-100 seats</SelectItem>
                    <SelectItem value="100+">100+ seats</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.restaurantDetails?.seatingCapacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.restaurantDetails.seatingCapacity.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="averageOrderValue">Average Order Value</Label>
                <Select onValueChange={(value) => form.setValue("restaurantDetails.averageOrderValue", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under LKR 500</SelectItem>
                    <SelectItem value="500-1000">LKR 500-1000</SelectItem>
                    <SelectItem value="1000-2000">LKR 1000-2000</SelectItem>
                    <SelectItem value="2000-5000">LKR 2000-5000</SelectItem>
                    <SelectItem value="over-5000">Over LKR 5000</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.restaurantDetails?.averageOrderValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.restaurantDetails.averageOrderValue.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="openTime">Opening Time</Label>
                  <Input
                    id="openTime"
                    type="time"
                    {...form.register("restaurantDetails.operatingHours.openTime")}
                  />
                  {form.formState.errors.restaurantDetails?.operatingHours?.openTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.restaurantDetails.operatingHours.openTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="closeTime">Closing Time</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    {...form.register("restaurantDetails.operatingHours.closeTime")}
                  />
                  {form.formState.errors.restaurantDetails?.operatingHours?.closeTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.restaurantDetails.operatingHours.closeTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="operatingDays">Operating Days</Label>
                  <Select onValueChange={(value) => form.setValue("restaurantDetails.operatingHours.operatingDays", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyday">Every Day</SelectItem>
                      <SelectItem value="weekdays">Weekdays Only</SelectItem>
                      <SelectItem value="weekends">Weekends Only</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.restaurantDetails?.operatingHours?.operatingDays && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.restaurantDetails.operatingHours.operatingDays.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="monthlyOrders">Expected Monthly Orders (Optional)</Label>
              <Select onValueChange={(value) => form.setValue("restaurantDetails.monthlyOrders", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50">0-50 orders</SelectItem>
                  <SelectItem value="50-200">50-200 orders</SelectItem>
                  <SelectItem value="200-500">200-500 orders</SelectItem>
                  <SelectItem value="500-1000">500-1000 orders</SelectItem>
                  <SelectItem value="1000+">1000+ orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Required Documents</h2>
              <p className="text-gray-600">Upload clear photos of your documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'businessLicense', label: 'Business License', required: true },
                { key: 'foodLicense', label: 'Food Service License', required: true },
                { key: 'taxCertificate', label: 'Tax Certificate', required: false },
                { key: 'menuCard', label: 'Sample Menu', required: true }
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {doc.label}
                    {doc.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id={doc.key}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue(`documents.${doc.key}` as any, file.name);
                        }
                      }}
                    />
                    <label htmlFor={doc.key} className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG or PDF (max 5MB)</p>
                    </label>
                  </div>
                  {form.formState.errors.documents?.[doc.key as keyof typeof form.formState.errors.documents] && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.documents[doc.key as keyof typeof form.formState.errors.documents]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Document Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All business licenses must be valid and current</li>
                <li>• Food service license is mandatory for all restaurants</li>
                <li>• Menu should include item names and prices</li>
                <li>• Documents should be clear and readable</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Terms & Agreements</h2>
              <p className="text-gray-600">Please review and accept our partnership terms</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={form.watch("agreements.termsAccepted")}
                  onCheckedChange={(checked) => 
                    form.setValue("agreements.termsAccepted", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="termsAccepted" className="text-sm font-medium leading-none">
                    I accept the Terms and Conditions
                  </Label>
                  <p className="text-xs text-gray-600">
                    By checking this box, you agree to our restaurant partnership terms and service requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="commissionAccepted"
                  checked={form.watch("agreements.commissionAccepted")}
                  onCheckedChange={(checked) => 
                    form.setValue("agreements.commissionAccepted", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="commissionAccepted" className="text-sm font-medium leading-none">
                    I accept the commission structure (8% per order)
                  </Label>
                  <p className="text-xs text-gray-600">
                    Run Pick charges 8% commission on each completed order. Payment is made weekly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="qualityStandards"
                  checked={form.watch("agreements.qualityStandards")}
                  onCheckedChange={(checked) => 
                    form.setValue("agreements.qualityStandards", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="qualityStandards" className="text-sm font-medium leading-none">
                    I agree to maintain quality standards
                  </Label>
                  <p className="text-xs text-gray-600">
                    Commitment to food quality, hygiene standards, and timely order preparation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Application review (3-5 business days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Document verification and restaurant inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>Menu setup and pricing configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Staff training and platform onboarding</span>
                </div>
              </div>
            </div>

            {Object.values(form.formState.errors.agreements || {}).map((error, index) => (
              <p key={index} className="text-red-500 text-sm">
                {error?.message}
              </p>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Restaurant Partner Application</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {renderStepContent()}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default RestaurantApplication;