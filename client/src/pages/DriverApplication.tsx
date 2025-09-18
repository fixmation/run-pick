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
import { Car, Upload, CheckCircle, Clock, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

const driverApplicationSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    nic: z.string().min(10, "Please enter a valid NIC number"),
    address: z.string().min(10, "Please enter your full address"),
    city: z.string().min(2, "Please select your city"),
  }),
  vehicleInfo: z.object({
    vehicleType: z.string().min(1, "Please select vehicle type"),
    make: z.string().min(2, "Please enter vehicle make"),
    model: z.string().min(2, "Please enter vehicle model"),
    year: z.string().min(4, "Please enter vehicle year"),
    licensePlate: z.string().min(5, "Please enter license plate number"),
    color: z.string().min(3, "Please enter vehicle color"),
    seatingCapacity: z.string().min(1, "Please enter seating capacity"),
  }),
  documents: z.object({
    drivingLicense: z.string().min(1, "Driving license is required"),
    vehicleRegistration: z.string().min(1, "Vehicle registration is required"),
    insurance: z.string().min(1, "Insurance certificate is required"),
    nicCopy: z.string().min(1, "NIC copy is required"),
  }),
  experience: z.object({
    drivingExperience: z.string().min(1, "Please select your driving experience"),
    previousExperience: z.string().optional(),
    preferredAreas: z.string().min(5, "Please specify your preferred working areas"),
    availability: z.string().min(1, "Please specify your availability"),
  }),
  agreements: z.object({
    termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
    backgroundCheck: z.boolean().refine(val => val === true, "You must consent to background verification"),
  })
});

type DriverApplicationData = z.infer<typeof driverApplicationSchema>;

const DriverApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<DriverApplicationData>({
    resolver: zodResolver(driverApplicationSchema),
    defaultValues: {
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nic: "",
        address: "",
        city: "",
      },
      vehicleInfo: {
        vehicleType: "",
        make: "",
        model: "",
        year: "",
        licensePlate: "",
        color: "",
        seatingCapacity: "",
      },
      documents: {
        drivingLicense: "",
        vehicleRegistration: "",
        insurance: "",
        nicCopy: "",
      },
      experience: {
        drivingExperience: "",
        previousExperience: "",
        preferredAreas: "",
        availability: "",
      },
      agreements: {
        termsAccepted: false,
        backgroundCheck: false,
      }
    }
  });

  const totalSteps = 5;

  const onSubmit = async (data: DriverApplicationData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Driver application submitted:", data);
      
      toast({
        title: "Application Submitted Successfully!",
        description: "We'll review your application and contact you within 2-3 business days.",
      });

      // Redirect to success page or dashboard
      // window.location.href = '/driver-application-success';
      
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

  const getFieldsForStep = (step: number): (keyof DriverApplicationData | `${keyof DriverApplicationData}.${string}`)[] => {
    switch (step) {
      case 1:
        return [
          'personalInfo.firstName',
          'personalInfo.lastName', 
          'personalInfo.email',
          'personalInfo.phone',
          'personalInfo.nic',
          'personalInfo.address',
          'personalInfo.city'
        ];
      case 2:
        return [
          'vehicleInfo.vehicleType',
          'vehicleInfo.make',
          'vehicleInfo.model',
          'vehicleInfo.year',
          'vehicleInfo.licensePlate',
          'vehicleInfo.color',
          'vehicleInfo.seatingCapacity'
        ];
      case 3:
        return [
          'documents.drivingLicense',
          'documents.vehicleRegistration',
          'documents.insurance',
          'documents.nicCopy'
        ];
      case 4:
        return [
          'experience.drivingExperience',
          'experience.preferredAreas',
          'experience.availability'
        ];
      case 5:
        return ['agreements.termsAccepted', 'agreements.backgroundCheck'];
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
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...form.register("personalInfo.firstName")}
                  placeholder="Enter your first name"
                />
                {form.formState.errors.personalInfo?.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.personalInfo.firstName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register("personalInfo.lastName")}
                  placeholder="Enter your last name"
                />
                {form.formState.errors.personalInfo?.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.personalInfo.lastName.message}
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
                  {...form.register("personalInfo.email")}
                  placeholder="your.email@example.com"
                />
                {form.formState.errors.personalInfo?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.personalInfo.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...form.register("personalInfo.phone")}
                  placeholder="+94 77 123 4567"
                />
                {form.formState.errors.personalInfo?.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.personalInfo.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nic">NIC Number</Label>
                <Input
                  id="nic"
                  {...form.register("personalInfo.nic")}
                  placeholder="199812345678 or 981234567V"
                />
                {form.formState.errors.personalInfo?.nic && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.personalInfo.nic.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="city">City</Label>
                <Select onValueChange={(value) => form.setValue("personalInfo.city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
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
                {form.formState.errors.personalInfo?.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.personalInfo.city.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                {...form.register("personalInfo.address")}
                placeholder="Enter your complete address"
                rows={3}
              />
              {form.formState.errors.personalInfo?.address && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.personalInfo.address.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Vehicle Information</h2>
              <p className="text-gray-600">Tell us about your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select onValueChange={(value) => form.setValue("vehicleInfo.vehicleType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="tuktuk">Three Wheeler (Tuk-Tuk)</SelectItem>
                    <SelectItem value="bike">Motorcycle</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.vehicleInfo?.vehicleType && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.vehicleType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                <Select onValueChange={(value) => form.setValue("vehicleInfo.seatingCapacity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 passenger</SelectItem>
                    <SelectItem value="2">2 passengers</SelectItem>
                    <SelectItem value="3">3 passengers</SelectItem>
                    <SelectItem value="4">4 passengers</SelectItem>
                    <SelectItem value="6">6 passengers</SelectItem>
                    <SelectItem value="8">8 passengers</SelectItem>
                    <SelectItem value="12">12+ passengers</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.vehicleInfo?.seatingCapacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.seatingCapacity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Vehicle Make</Label>
                <Input
                  id="make"
                  {...form.register("vehicleInfo.make")}
                  placeholder="e.g., Toyota, Honda, Suzuki"
                />
                {form.formState.errors.vehicleInfo?.make && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.make.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="model">Vehicle Model</Label>
                <Input
                  id="model"
                  {...form.register("vehicleInfo.model")}
                  placeholder="e.g., Corolla, Civic, Alto"
                />
                {form.formState.errors.vehicleInfo?.model && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.model.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  {...form.register("vehicleInfo.year")}
                  placeholder="e.g., 2020"
                />
                {form.formState.errors.vehicleInfo?.year && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.year.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  {...form.register("vehicleInfo.color")}
                  placeholder="e.g., White, Black"
                />
                {form.formState.errors.vehicleInfo?.color && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.color.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  {...form.register("vehicleInfo.licensePlate")}
                  placeholder="e.g., CAA-1234"
                />
                {form.formState.errors.vehicleInfo?.licensePlate && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.vehicleInfo.licensePlate.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Required Documents</h2>
              <p className="text-gray-600">Upload clear photos of your documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'drivingLicense', label: 'Driving License', required: true },
                { key: 'vehicleRegistration', label: 'Vehicle Registration', required: true },
                { key: 'insurance', label: 'Insurance Certificate', required: true },
                { key: 'nicCopy', label: 'NIC Copy', required: true }
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
                <li>• All documents must be valid and not expired</li>
                <li>• Photos should be clear and readable</li>
                <li>• Driving license must be appropriate for your vehicle type</li>
                <li>• Vehicle registration must match the vehicle information provided</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Experience & Preferences</h2>
              <p className="text-gray-600">Tell us about your driving experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drivingExperience">Driving Experience</Label>
                <Select onValueChange={(value) => form.setValue("experience.drivingExperience", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.experience?.drivingExperience && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.experience.drivingExperience.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select onValueChange={(value) => form.setValue("experience.availability", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time (40+ hours/week)</SelectItem>
                    <SelectItem value="part-time">Part Time (20-40 hours/week)</SelectItem>
                    <SelectItem value="weekends">Weekends Only</SelectItem>
                    <SelectItem value="evenings">Evenings Only</SelectItem>
                    <SelectItem value="flexible">Flexible Schedule</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.experience?.availability && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.experience.availability.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="preferredAreas">Preferred Working Areas</Label>
              <Textarea
                id="preferredAreas"
                {...form.register("experience.preferredAreas")}
                placeholder="List the areas/cities where you prefer to operate (e.g., Colombo, Kandy, Galle)"
                rows={3}
              />
              {form.formState.errors.experience?.preferredAreas && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.experience.preferredAreas.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="previousExperience">Previous Ride-Hailing Experience (Optional)</Label>
              <Textarea
                id="previousExperience"
                {...form.register("experience.previousExperience")}
                placeholder="Have you worked with other ride-hailing services? Tell us about your experience."
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Terms & Agreements</h2>
              <p className="text-gray-600">Please review and accept our terms</p>
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
                  <Label htmlFor="termsAccepted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept the Terms and Conditions
                  </Label>
                  <p className="text-xs text-gray-600">
                    By checking this box, you agree to our driver terms, commission structure, and service requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="backgroundCheck"
                  checked={form.watch("agreements.backgroundCheck")}
                  onCheckedChange={(checked) => 
                    form.setValue("agreements.backgroundCheck", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="backgroundCheck" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I consent to background verification
                  </Label>
                  <p className="text-xs text-gray-600">
                    We may verify your documents, driving record, and conduct background checks as required by law.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Application review (2-3 business days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Document verification and background check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>Vehicle inspection (if required)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Account activation and onboarding</span>
                </div>
              </div>
            </div>

            {form.formState.errors.agreements?.termsAccepted && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.agreements.termsAccepted.message}
              </p>
            )}
            {form.formState.errors.agreements?.backgroundCheck && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.agreements.backgroundCheck.message}
              </p>
            )}
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
            <h1 className="text-3xl font-bold">Driver Application</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
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

export default DriverApplication;