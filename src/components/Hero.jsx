import { Flame, ShieldCheck, Truck } from 'lucide-react';

export default function Hero() {
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
        <div className="hero-tag">IMPORTACIÓN GLOBAL EXCLUSIVA</div>
        
        <h1 className="hero-title">
          Catálogo Internacional <br />
          <span className="gradient-text">Directo A Ti</span>
        </h1>
        
        <p className="hero-description">
          Importamos las marcas más destacadas del mercado global. Explora nuestra gama premium de vapeo de última generación, óxido nitroso certificado para repostería y piezas exclusivas de coleccionismo.
        </p>

        <div className="hero-actions">
          <button className="btn-primary-neon" onClick={scrollToCatalog}>
            Comprar Ahora
          </button>
          <a href="#experiencia" className="btn-secondary-outline">
            Ver Garantías
          </a>
        </div>

        {/* Badges/USPs */}
        <div className="hero-usps">
          <div className="usp-item">
            <Truck className="usp-icon text-cyan" />
            <div>
              <h4>Envío Directo</h4>
              <p>Express 24h a península</p>
            </div>
          </div>
          <div className="usp-item">
            <ShieldCheck className="usp-icon text-purple" />
            <div>
              <h4>Calidad Importada</h4>
              <p>Homologado TPD y E942</p>
            </div>
          </div>
          <div className="usp-item">
            <Flame className="usp-icon text-pink" />
            <div>
              <h4>Catálogo Exclusivo</h4>
              <p>Piezas y marcas de tendencia</p>
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
