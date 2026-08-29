import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ searchVal, onSearchChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, changeLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languagesList = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文 (ZH)', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const currentLangObj = languagesList.find(l => l.code === language) || languagesList[0];

  const LanguageSelector = () => (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        type="button" 
        className="lang-btn" 
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        aria-expanded={langDropdownOpen}
      >
        <span className="lang-dropdown-item-flag">{currentLangObj.flag}</span>
        <span>{currentLangObj.code.toUpperCase()}</span>
      </button>
      {langDropdownOpen && (
        <div className="lang-dropdown-menu">
          {languagesList.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`lang-dropdown-item ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(lang.code);
                setLangDropdownOpen(false);
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="lang-dropdown-item-flag">{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/images/logovapers.webp" alt="El Patinoso Logo" className="logo-img" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text" style={{ lineHeight: '1.1' }}>EL PATINOSO IMPORT</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--neon-purple)', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: 'var(--neon-purple-glow)' }}>{t('nav_b2b')}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Desktop Menu */}
        <div className="navbar-links">
          <a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>{t('nav_catalog')}</a>
          <a href="#experiencia" onClick={() => setMobileMenuOpen(false)}>{t('nav_import')}</a>
          <a href="#nosotros" onClick={() => setMobileMenuOpen(false)}>{t('nav_about')}</a>
          <LanguageSelector />
          <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="navbar-mobile-controls">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-links">
            <div className="navbar-search-wrapper mobile-search">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchVal}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
            <a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>{t('nav_catalog')}</a>
            <a href="#experiencia" onClick={() => setMobileMenuOpen(false)}>{t('nav_import')}</a>
            <a href="#nosotros" onClick={() => setMobileMenuOpen(false)}>{t('nav_about')}</a>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', width: '100%', padding: '0.5rem 0' }}>
              <LanguageSelector />
              <button 
                type="button" 
                className="theme-toggle-btn mobile-theme-toggle" 
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {theme === 'dark' ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

