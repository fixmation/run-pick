import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import runpickLogoPath from "@assets/runpick-logo_1752764200329.png";

const Footer = () => {
  return (
    <footer className="text-background hidden md:block" style={{ backgroundColor: '#2b0e1c' }}>
      <div className="container px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={runpickLogoPath} 
                alt="Run Pick" 
                className="w-8 h-8 rounded object-contain"
                style={{ borderRadius: '5px' }}
              />
              <span className="font-bold text-lg">Run Pick</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed mb-4">
              Sri Lanka's leading multi-service platform for rides, food delivery, and parcel services.
            </p>
            <div className="flex gap-3 mb-4">
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white text-sm" 
              onClick={() => {
                // Toggle high contrast mode
                const html = document.documentElement;
                html.classList.toggle('accessibility-mode');
                
                // Add high contrast styles if not already added
                if (!document.getElementById('accessibility-styles')) {
                  const style = document.createElement('style');
                  style.id = 'accessibility-styles';
                  style.innerHTML = `
                    .accessibility-mode {
                      filter: contrast(150%) brightness(110%);
                    }
                    .accessibility-mode * {
                      font-weight: bold !important;
                      font-size: 1.1em !important;
                    }
                  `;
                  document.head.appendChild(style);
                }
              }}
            >
              <Accessibility className="w-4 h-4 mr-2" />
              Accessibility
            </Button>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-background mb-4">Services</h3>
            <div className="space-y-2">
              <a href="/taxi" className="block text-background/70 hover:text-background text-sm transition-colors">Taxi Rides</a>
              <a href="/lorry" className="block text-background/70 hover:text-background text-sm transition-colors">Lorry Services</a>
              <a href="/food" className="block text-background/70 hover:text-background text-sm transition-colors">Food Delivery</a>
              <a href="/supermarket-shopping" className="block text-background/70 hover:text-background text-sm transition-colors">Supermarket</a>
              <a href="/gas-delivery" className="block text-background/70 hover:text-background text-sm transition-colors">Gas Delivery</a>
              <a href="/parcel" className="block text-background/70 hover:text-background text-sm transition-colors">Parcel Delivery</a>
            </div>
          </div>

          {/* Partners */}
          <div>
            <h3 className="font-semibold text-background mb-4">Partners</h3>
            <div className="space-y-2">
              <a href="/driver-application" className="block text-background/70 hover:text-background text-sm">Become a Driver</a>
              <a href="/restaurant-application" className="block text-background/70 hover:text-background text-sm">Restaurant Partner</a>
              <a href="/delivery-partner" className="block text-background/70 hover:text-background text-sm">Delivery Partner</a>
              <a href="/partner-support" className="block text-background/70 hover:text-background text-sm">Partner Support</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-background mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4" />
                <span>071 1558 055, 077 637 8630, 075 1111 221</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4" />
                <span>runpicktransport@gmail.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>BL-1/6, Gunasinghapura,<br />Colombo 12, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-background/20 mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-sm text-background/70 text-left">
            <div>© 2025 Run Pick Driver Transport. All rights reserved.</div>
            <div className="mt-1">Registered No: 30/3933</div>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/privacy-policy" className="text-background/70 hover:text-background">Privacy Policy</a>
            <a href="/terms-of-service" className="text-background/70 hover:text-background">Terms of Service</a>
            <a href="/cookies" className="text-background/70 hover:text-background">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;