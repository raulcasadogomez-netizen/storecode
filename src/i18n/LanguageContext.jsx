import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { supabase } from '../lib/supabaseClient';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('elpatinoso-lang') || localStorage.getItem('vapex-lang');
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

  const [dbTranslations, setDbTranslations] = useState({});

  const fetchDbTranslations = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('site_texts')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        const dict = {};
        data.forEach((row) => {
          dict[row.id] = {
            es: row.es,
            en: row.en || row.es,
            zh: row.zh || row.es
          };
        });
        setDbTranslations(dict);
      }
    } catch (err) {
      console.warn("Failed to fetch site_texts from Supabase, using local translations:", err);
    }
  };

  useEffect(() => {
    fetchDbTranslations();
  }, []);

  const changeLanguage = (lang) => {
    if (['es', 'zh', 'en'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('elpatinoso-lang', lang);
    }
  };

  const t = (key, data = {}, fallback = undefined) => {
    // 1. Check database translations first
    let translation = dbTranslations[key]?.[language];

    // 2. Fallback to static local translations in chosen language
    if (translation === undefined) {
      translation = translations[language]?.[key];
    }

    // 3. Fallback to Spanish static local translations
    if (translation === undefined) {
      translation = translations['es']?.[key];
    }

    // 4. Final fallback
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
    <LanguageContext.Provider value={{ language, changeLanguage, t, refreshDbTranslations: fetchDbTranslations }}>
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

