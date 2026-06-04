import { useState } from 'react';
import { Search, ShoppingCart, Globe, Menu, X } from 'lucide-react';

export default function Navbar({ cartCount, onCartClick, searchVal, onSearchChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Globe className="logo-icon text-neon-cyan" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text" style={{ lineHeight: '1.1' }}>VAPEX IMPORT</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--neon-purple)', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: 'var(--neon-purple-glow)' }}>MAYORISTA B2B</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar vaper, N2O, coleccionismo..."
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Desktop Menu */}
        <div className="navbar-links">
          <a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>Catálogo</a>
          <a href="#experiencia" onClick={() => setMobileMenuOpen(false)}>Importación</a>
          <a href="#nosotros" onClick={() => setMobileMenuOpen(false)}>Nosotros</a>
          <button className="cart-trigger-btn" onClick={onCartClick}>
            <ShoppingCart className="cart-icon" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="navbar-mobile-controls">
          <button className="cart-trigger-btn mobile-only" onClick={onCartClick}>
            <ShoppingCart className="cart-icon" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          
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
                placeholder="Buscar vaper, N2O, coleccionismo..."
                value={searchVal}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
            <a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>Catálogo</a>
            <a href="#experiencia" onClick={() => setMobileMenuOpen(false)}>Importación</a>
            <a href="#nosotros" onClick={() => setMobileMenuOpen(false)}>Nosotros</a>
          </div>
        </div>
      )}
    </nav>
  );
}
