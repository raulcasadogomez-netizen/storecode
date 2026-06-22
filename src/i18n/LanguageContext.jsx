import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('vapex-lang');
    if (saved && ['es', 'zh', 'en'].includes(saved)) {
      return saved;
    }
    
    // 2. Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const code = browserLang.split('-')[0].toLowerCase();
      if (['es', 'zh', 'en'].includes(code)) {
        return code;
      }
    }
    
    // 3. Fallback to Spanish
    return 'es';
  });

  const changeLanguage = (lang) => {
    if (['es', 'zh', 'en'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('vapex-lang', lang);
    }
  };

  const t = (key, data = {}, fallback = undefined) => {
    let translation = translations[language]?.[key];
    if (translation === undefined) {
      translation = translations['es']?.[key];
    }
    if (translation === undefined) {
      translation = fallback !== undefined ? fallback : key;
    }

    // Replace dynamic variables, e.g. {{amount}} or {{coupon}}
    if (typeof translation === 'string') {
      Object.keys(data).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), data[placeholder]);
      });
    }

    return translation;
  };


  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
