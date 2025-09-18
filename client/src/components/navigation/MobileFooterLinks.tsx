import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Shield, FileText, HelpCircle } from "lucide-react";
import runpickLogoPath from "@assets/runpick-logo_1752764200329.png";

const MobileFooterLinks = () => {
  const footerLinks = [
    { label: "Terms of Service", icon: FileText },
    { label: "Privacy Policy", icon: Shield },
    { label: "Help & Support", icon: HelpCircle },
    { label: "About Us", icon: ExternalLink }
  ];

  return (
    <Card className="p-4 sm:hidden">
      <div className="grid grid-cols-2 gap-2">
        {footerLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 justify-start text-gray-600"
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{link.label}</span>
            </Button>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img 
            src={runpickLogoPath} 
            alt="Run Pick" 
            className="w-6 h-6 object-contain"
          />
          <span className="font-semibold text-sm text-orange-800">Run Pick</span>
        </div>
        <div className="text-xs text-gray-500">
          © 2025 Run Pick. All rights reserved.
        </div>
      </div>
    </Card>
  );
};

export default MobileFooterLinks;