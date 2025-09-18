import { Car, UtensilsCrossed, Package, Truck, Sparkles, ArrowRight, Flame, ShoppingCart } from "lucide-react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import ServiceCard from "./ServiceCard";
import ServiceBookingButton from "@/components/services/ServiceBookingButton";

const ServicesGrid = () => {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const services = [
    {
      titleKey: "home.services.taxi",
      descriptionKey: "home.services.taxi.desc",
      icon: Car,
      gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
      iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
      accentColor: "from-blue-500 to-purple-600",
      serviceType: "taxi" as const,
      onClick: () => setLocation("/taxi")
    },
    {
      titleKey: "home.services.food",
      descriptionKey: "home.services.food.desc",
      icon: UtensilsCrossed,
      gradient: "bg-gradient-to-br from-orange-500 to-red-600", 
      iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
      accentColor: "from-orange-500 to-red-600",
      serviceType: "food" as const,
      onClick: () => setLocation("/food")
    },
    {
      titleKey: "home.services.parcel",
      descriptionKey: "home.services.parcel.desc",
      icon: Package,
      gradient: "bg-gradient-to-br from-green-500 to-teal-600",
      iconBg: "bg-gradient-to-br from-green-500 to-teal-600",
      accentColor: "from-green-500 to-teal-600",
      serviceType: "parcel" as const,
      onClick: () => setLocation("/parcel")
    },
    {
      titleKey: "home.services.movers",
      descriptionKey: "home.services.movers.desc",
      icon: Truck,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
      accentColor: "from-purple-500 to-pink-600",
      serviceType: "movers" as const,
      onClick: () => setLocation("/movers")
    }
  ];

  const pricingServices = [
    {
      title: "Gas Cylinder Delivery",
      description: "Home delivery of cooking gas cylinders. Safe handling, quick delivery, and competitive pricing.",
      icon: Flame,
      gradient: "bg-gradient-to-br from-red-500 to-orange-600",
      iconBg: "bg-gradient-to-br from-red-500 to-orange-600",
      accentColor: "from-red-500 to-orange-600",
      pricing: "LKR 3,500 - 4,500",
      onClick: () => setLocation("/gas-delivery")
    },
    {
      title: "Supermarket Shopping",
      description: "Personal shopping service from top supermarkets. Fresh groceries delivered to your doorstep.",
      icon: ShoppingCart,
      gradient: "bg-gradient-to-br from-amber-500 to-yellow-600",
      iconBg: "bg-gradient-to-br from-amber-500 to-yellow-600",
      accentColor: "from-amber-500 to-yellow-600",
      pricing: "LKR 200 delivery fee + items",
      onClick: () => setLocation("/supermarket-shopping")
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('home.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={service.titleKey}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
            >
              <Card className="service-card group cursor-pointer h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`service-card-icon ${service.iconBg}`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(service.titleKey)}
                  </h3>
                  {(service as any).comingSoon && (
                    <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                      Coming Soon!
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t(service.descriptionKey)}
                </p>

                {/* Action Button */}
                <div className="mt-auto">
                  {(service as any).comingSoon ? (
                    <Button disabled className="w-full" variant="outline">
                      {t('common.comingSoon')}
                    </Button>
                  ) : (service as any).serviceType && (service as any).serviceType !== 'movers' ? (
                    <ServiceBookingButton
                      serviceType={(service as any).serviceType}
                      className="w-full"
                    >
                      Book Now with Progress
                    </ServiceBookingButton>
                  ) : (
                    <Button onClick={service.onClick} className="w-full">
                      {t('common.bookNow')}
                    </Button>
                  )}
                </div>

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
              </Card>
            </div>
          ))}
        </div>

        {/* Pricing Services Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t('home.features.title')}
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.reliable.desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricingServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.title}
                  className="service-card animate-fade-up cursor-pointer"
                  style={{ animationDelay: `${(services.length + index) * 0.1}s` }}
                  onClick={service.onClick}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`service-card-icon ${service.iconBg}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {service.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <div className="mt-auto">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {service.pricing}
                    </Badge>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-12 pt-8">
          <Link href="/dashboard">
            <Button variant="default" className="w-full md:w-auto">
              {t('common.getStarted')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/learn-more">
            <Button variant="outline" className="w-full md:w-auto">
              {t('common.learnMore')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;