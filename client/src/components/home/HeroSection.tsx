import { ArrowRight, Star, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import runpickLogoPath from "@assets/runpick-logo_1752764200329.png";

// Import custom service images
import carIcon from "@assets/blue-car-icon_1755406620815.png";
import lorryIcon from "@assets/Yellow-lorry-icon_1755406620821.png";
import foodIcon from "@assets/Burger-food-icon_1755406620820.png";
import supermarketIcon from "@assets/Trolley-market-icon_1755406620819.png";
import gasIcon from "@assets/Gas-Cylinder_1754850248224.png";
import busIcon from "@assets/Red-bus-icon_1755406620818.png";
import jcbIcon from "@assets/JCB-Dozer-icon_1755406620818.png";
import parcelIcon from "@assets/Parcel-del-icon_1755406620817.png";
import moversIcon from "@assets/tow-truck_1754849355390.png";
import bgImage from "@assets/Runpick-bg_1754916379994.png";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section 
      className="relative overflow-hidden min-h-[100svh] w-full flex justify-center items-center py-[30px] bg-gradient-to-br from-blue-50 to-purple-50"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        filter: 'brightness(1.05) saturate(1.1)',
        willChange: 'transform'
      }}
    >
      <div className="container px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Floating Badge with Animation */}
          <div className="inline-flex items-center justify-center p-1 mb-3 md:mb-5 bg-[#ffff7f]/30 rounded-full backdrop-blur-sm border border-white/10 animate-pulse">
            <Badge variant="secondary" className="bg-[#ffff7f] text-gray-800 border-0 px-6 py-2 text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('home.title')}
              <TrendingUp className="w-4 h-4 ml-2" />
            </Badge>
          </div>

          {/* Main Heading with Logo and Gradient Text */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src={runpickLogoPath} 
              alt="Run Pick" 
              loading="eager"
              decoding="sync"
              width="80"
              height="80"
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain mr-4 shadow-2xl"
              style={{ borderRadius: '10px' }}
            />
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight">
              <span className="text-black">Run</span>
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"> Pick</span>
            </h1>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight">
            <span className="text-black">
              {t('home.heroSubtitle')}
            </span>
          </h2>

          {/* Subtitle with Better Typography */}
          <p className="text-xl md:text-2xl lg:text-3xl text-black mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            {t('home.subtitle')}
          </p>

          {/* Modern CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/get-started">
              <Button className="w-full sm:w-auto h-14 min-h-[56px] bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 text-white border-0 shadow-2xl shadow-violet-600/25 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105">
                <Zap className="w-5 h-5 mr-2" />
                {t('common.getStarted')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-[20px] pt-4 max-w-6xl mx-auto">
            {[
              { labelKey: "nav.taxi", image: carIcon, link: "/taxi" },
              { labelKey: "nav.lorry", image: lorryIcon, link: "/lorry" },
              { labelKey: "nav.movers", image: moversIcon, link: "/movers" },
              { labelKey: "nav.food", image: foodIcon, link: "/food" },
              { labelKey: "nav.supermarket", image: supermarketIcon, link: "/supermarket-shopping" },
              { labelKey: "nav.gas", image: gasIcon, link: "/gas-delivery" },
              { labelKey: "nav.parcel", image: parcelIcon, link: "/parcel" },
              { labelKey: "nav.bus", image: busIcon, link: "#", comingSoon: true },
              { labelKey: "nav.jcb", image: jcbIcon, link: "#", comingSoon: true }
            ].map((service, index) => (
              <Link key={index} href={service.comingSoon ? "#" : service.link}>
                <div className="text-center group cursor-pointer">
                  <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-white/40 rounded-xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 border border-white/30 shadow-lg backdrop-blur-sm relative overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={t(service.labelKey)}
                      className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
                      loading="lazy"
                      decoding="async"
                      width="112"
                      height="112"
                    />
                    {service.comingSoon && (
                      <div className="absolute top-1 right-1">
                        <span 
                          className="text-white text-xs font-bold bg-gradient-to-r from-violet-600 to-violet-800 px-1 py-0.5 rounded transform rotate-45 origin-center shadow-lg"
                          style={{ fontSize: '9px' }}
                        >
                          {t('common.comingSoon')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-gray-700 text-xs md:text-sm font-medium px-1">
                    {t(service.labelKey)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Subtle Animated Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </section>
  );
};

export default HeroSection;