import { Flame, ShieldCheck, Truck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function Hero() {
  const { t } = useTranslation();

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalogo');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="hero-container">
      {/* Background neon glows */}
      <div className="hero-glow-cyan"></div>
      <div className="hero-glow-purple"></div>

      <div className="hero-content">
        <div className="hero-tag">{t('hero_b2b_tag')}</div>
        
        <h1 className="hero-title">
          {t('hero_title_part1')} <br />
          <span className="gradient-text">{t('hero_title_part2')}</span>
        </h1>
        
        <p className="hero-description">
          {t('hero_desc')}
        </p>

        <div className="hero-actions">
          <button className="btn-primary-neon" onClick={scrollToCatalog}>
            {t('hero_btn_catalog')}
          </button>
          <a href="#experiencia" className="btn-secondary-outline">
            {t('hero_btn_guarantees')}
          </a>
        </div>

        {/* Badges/USPs */}
        <div className="hero-usps">
          <div className="usp-item">
            <Truck className="usp-icon text-cyan" />
            <div>
              <h4>{t('hero_usp1_title')}</h4>
              <p>{t('hero_usp1_desc')}</p>
            </div>
          </div>
          <div className="usp-item">
            <ShieldCheck className="usp-icon text-purple" />
            <div>
              <h4>{t('hero_usp2_title')}</h4>
              <p>{t('hero_usp2_desc')}</p>
            </div>
          </div>
          <div className="usp-item">
            <Flame className="usp-icon text-pink" />
            <div>
              <h4>{t('hero_usp3_title')}</h4>
              <p>{t('hero_usp3_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-backdrop">
          <div className="floating-smoke"></div>
          {/* We will place a floating mock vape device or graphical representation */}
          <div className="hero-device-wrapper">
            <img 
              src="/images/vape_mango_peach.png" 
              alt="Vape Principal" 
              className="hero-floating-device" 
            />
            <div className="device-shadow"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

