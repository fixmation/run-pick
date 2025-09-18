import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  accentColor: string;
  onClick: () => void;
  comingSoon?: boolean;
}

const ServiceCard = ({ title, description, icon: Icon, gradient, iconBg, accentColor, onClick, comingSoon }: ServiceCardProps) => {
  return (
    <Card 
      className={`service-card animate-fade-up ${comingSoon ? 'opacity-75' : ''}`}
      onClick={comingSoon ? undefined : onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`service-card-icon ${iconBg}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        {comingSoon && (
          <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
            Coming Soon!
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
    </Card>
  );
};

export default ServiceCard;