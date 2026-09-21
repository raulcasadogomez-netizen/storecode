import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const DEFAULT_SITE_MEDIA = {
  logo: '/images/logovapers.webp',
  hero_image: '/images/vape_mango_peach.png',
  experience_image: '/images/vape_pod_kit.png',
};

export const SITE_MEDIA_SLOTS = [
  {
    id: 'logo',
    title: 'Logotipo de la Tienda',
    section: 'Identidad de Marca',
    description: 'Aparece en la barra superior (Navbar), modal de verificación de edad y panel de administración.',
    defaultUrl: '/images/logovapers.webp',
    aspect: 'Horizontal / Cuadrado (Recomendado PNG/WebP transparente)'
  },
  {
    id: 'hero_image',
    title: 'Imagen Principal del Hero (Portada)',
    section: 'Cabecera de Inicio',
    description: 'Dispositivo o producto destacado flotante en la portada de la página principal.',
    defaultUrl: '/images/vape_mango_peach.png',
    aspect: 'Vertical / Producto flotante (Recomendado PNG/WebP sin fondo)'
  },
  {
    id: 'experience_image',
    title: 'Imagen de Sección Proceso y Garantías',
    section: 'Proceso de Importación',
    description: 'Imagen ilustrativa de tecnología y procesos de importación y aduanas.',
    defaultUrl: '/images/vape_pod_kit.png',
    aspect: 'Producto / Ilustración técnica'
  }
];

const SiteMediaContext = createContext(null);

export const SiteMediaProvider = ({ children }) => {
  const [siteMedia, setSiteMedia] = useState(() => {
    // 1. Initial check in localStorage
    try {
      const saved = localStorage.getItem('elpatinoso-site-media');
      if (saved) {
        return { ...DEFAULT_SITE_MEDIA, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not read site-media from localStorage:", e);
    }
    return DEFAULT_SITE_MEDIA;
  });

  const [loading, setLoading] = useState(true);

  // Fetch media from Supabase table site_media
  const fetchSiteMedia = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('site_media')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const mediaMap = { ...DEFAULT_SITE_MEDIA };
        data.forEach(item => {
          if (item.id && item.url) {
            mediaMap[item.id] = item.url;
          }
        });
        setSiteMedia(mediaMap);
        try {
          localStorage.setItem('elpatinoso-site-media', JSON.stringify(mediaMap));
        } catch (e) {
          // ignore storage quota errors
        }
      }
    } catch (err) {
      console.warn("Error fetching site_media from Supabase, using cache/defaults:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteMedia();
  }, [fetchSiteMedia]);

  const getMedia = useCallback((key, fallbackUrl) => {
    if (siteMedia[key]) return siteMedia[key];
    if (fallbackUrl) return fallbackUrl;
    return DEFAULT_SITE_MEDIA[key] || '';
  }, [siteMedia]);

  const updateMedia = async (key, url, title = '') => {
    // Update local state immediately for responsive UI
    const updated = {
      ...siteMedia,
      [key]: url
    };
    setSiteMedia(updated);
    try {
      localStorage.setItem('elpatinoso-site-media', JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to write to localStorage:", e);
    }

    // Persist to Supabase if connected
    if (supabase) {
      const payload = {
        id: key,
        url: url,
        title: title || SITE_MEDIA_SLOTS.find(s => s.id === key)?.title || key,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('site_media')
        .upsert([payload], { onConflict: 'id' });

      if (error) {
        console.error("Error saving site_media to Supabase:", error);
        throw error;
      }
    }
    return true;
  };

  const resetMediaToDefault = async (key) => {
    const defaultUrl = DEFAULT_SITE_MEDIA[key];
    if (!defaultUrl) return;
    await updateMedia(key, defaultUrl);
  };

  return (
    <SiteMediaContext.Provider value={{
      siteMedia,
      getMedia,
      updateMedia,
      resetMediaToDefault,
      refreshSiteMedia: fetchSiteMedia,
      loading
    }}>
      {children}
    </SiteMediaContext.Provider>
  );
};

export const useSiteMedia = () => {
  const context = useContext(SiteMediaContext);
  if (!context) {
    return {
      siteMedia: DEFAULT_SITE_MEDIA,
      getMedia: (key, fallback) => fallback || DEFAULT_SITE_MEDIA[key] || '',
      updateMedia: async () => {},
      resetMediaToDefault: async () => {},
      refreshSiteMedia: async () => {},
      loading: false
    };
  }
  return context;
};
