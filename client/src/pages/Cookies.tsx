
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-[#ffeed8]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Cookie Policy</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What Are Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                improving our services.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your login information and preferences</li>
                <li>Analyze how you use our website to improve our services</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure the security of your account</li>
                <li>Track usage patterns and optimize performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Essential Cookies</h4>
                <p>These are necessary for the website to function properly and cannot be disabled.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                <p>These help us understand how visitors interact with our website.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Functionality Cookies</h4>
                <p>These remember your preferences and provide enhanced features.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Advertising Cookies</h4>
                <p>These are used to show you relevant advertisements based on your interests.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You can control and manage cookies in your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>See what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from particular sites</li>
                <li>Block all cookies from being set</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p>
                Please note that disabling cookies may affect the functionality of our website and 
                your user experience.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on 
                this page with the updated date.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about our use of cookies, please contact us at 
                runpicktransport@gmail.com or call 071 1558 055.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Cookies;
