import { Shield, Clock, MapPin, CreditCard, Star, Headphones, Sparkles, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Shield,
      titleKey: "home.features.reliable",
      descriptionKey: "home.features.reliable.desc",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Clock,
      titleKey: "home.features.tracking",
      descriptionKey: "home.features.tracking.desc",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: MapPin,
      titleKey: "home.features.payment",
      descriptionKey: "home.features.payment.desc",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: CreditCard,
      titleKey: "common.bookNow",
      descriptionKey: "common.getStarted",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Star,
      titleKey: "common.learnMore",
      descriptionKey: "common.comingSoon",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Headphones,
      titleKey: "navigation.taxi",
      descriptionKey: "navigation.food",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <section className="py-8 md:py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.features.reliable.desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={feature.titleKey}
              className="p-6 border border-border hover:shadow-medium transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t(feature.titleKey)}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;