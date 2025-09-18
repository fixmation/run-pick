import React, { useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🌐'
  },
  {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🌐'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🌐'
  }
];

interface LanguageSelectorProps {
  variant?: 'desktop' | 'mobile';
  showLabel?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'desktop', 
  showLabel = true,
  className = ''
}) => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className={`w-full ${className}`}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <div className="flex flex-col items-start">
                  {showLabel && (
                    <span className="text-xs text-gray-500 font-medium">
                      {t('language.selector')}
                    </span>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{currentLang?.flag}</span>
                    <span className="font-medium text-gray-800">
                      {currentLang?.nativeName}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {language.nativeName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {language.name}
                    </span>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 h-9 px-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-lg">{currentLang?.flag}</span>
            {showLabel && (
              <span className="font-medium text-gray-700 hidden md:inline">
                {currentLang?.nativeName}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{language.flag}</span>
                <span className="font-medium text-gray-800">
                  {language.nativeName}
                </span>
              </div>
              {currentLanguage === language.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;