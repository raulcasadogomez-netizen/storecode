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
        <div className="hero-tag">NUEVA GENERACIÓN DE VAPEO</div>
        
        <h1 className="hero-title">
          Nubes Densas <br />
          <span className="gradient-text">Sabores Extremos</span>
        </h1>
        
        <p className="hero-description">
          Descubre nuestra selecta gama de dispositivos desechables, sistemas de pods recargables y e-liquids premium. Calidad garantizada para llevar tu experiencia de vapeo al siguiente nivel.
        </p>

        <div className="hero-actions">
          <button className="btn-primary-neon" onClick={scrollToCatalog}>
            Comprar Ahora
          </button>
          <a href="#experiencia" className="btn-secondary-outline">
            Ver Tecnología
          </a>
        </div>

        {/* Badges/USPs */}
        <div className="hero-usps">
          <div className="usp-item">
            <Truck className="usp-icon text-cyan" />
            <div>
              <h4>Envío Express</h4>
              <p>Gratis a partir de 49€</p>
            </div>
          </div>
          <div className="usp-item">
            <ShieldCheck className="usp-icon text-purple" />
            <div>
              <h4>100% Originales</h4>
              <p>Productos verificados</p>
            </div>
          </div>
          <div className="usp-item">
            <Flame className="usp-icon text-pink" />
            <div>
              <h4>Sabor Premium</h4>
              <p>Fórmulas de alta densidad</p>
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
