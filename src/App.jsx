import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import AgeVerificationModal from './components/AgeVerificationModal';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vapex-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from localStorage", e);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('vapex-cart', JSON.stringify(items));
  };

  const handleAddToCart = (product, quantity = 1, nicotine = null) => {
    // Determine selected nicotine (default to first option if not provided)
    const selectedNic = nicotine !== null ? nicotine : (product.details.nicotine ? product.details.nicotine[0] : 0);

    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.selectedNicotine === selectedNic
    );

    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      // Check stock limit
      const newQty = updatedCart[existingIndex].quantity + quantity;
      if (newQty <= product.stockCount) {
        updatedCart[existingIndex].quantity = newQty;
      } else {
        updatedCart[existingIndex].quantity = product.stockCount;
        alert(`Lo sentimos, solo hay ${product.stockCount} unidades disponibles en stock de este producto.`);
      }
    } else {
      updatedCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        selectedNicotine: selectedNic,
        quantity: quantity,
        stockCount: product.stockCount
      });
    }

    saveCart(updatedCart);
    
    // Automatically slide cart open to show feedback (except if adding from quick view, which closes it, but opening drawer is standard web UX feedback)
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId, nicotine, delta) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.id === productId && item.selectedNicotine === nicotine
    );

    if (existingIndex > -1) {
      let updatedCart = [...cartItems];
      const newQty = updatedCart[existingIndex].quantity + delta;

      if (newQty <= 0) {
        updatedCart.splice(existingIndex, 1);
      } else if (newQty <= updatedCart[existingIndex].stockCount) {
        updatedCart[existingIndex].quantity = newQty;
      } else {
        alert(`Llegaste al límite del stock disponible.`);
      }

      saveCart(updatedCart);
    }
  };

  const handleRemoveItem = (productId, nicotine) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.id === productId && item.selectedNicotine === nicotine)
    );
    saveCart(updatedCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Age Verification Modal */}
      <AgeVerificationModal />

      {/* Main Navigation */}
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)} 
        searchVal={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* Hero Banner */}
      <Hero />

      {/* Main Content Layout */}
      <main className="main-layout">
        {/* Product Catalog Grid Section */}
        <ProductGrid 
          searchQuery={searchQuery} 
          onQuickView={setSelectedProduct} 
          onAddToCart={handleAddToCart} 
        />

        {/* Section: Experience & Tech */}
        <section id="experiencia" className="experience-section">
          <div className="section-glow-purple"></div>
          <div className="experience-grid">
            <div className="experience-text">
              <span className="section-tag">TECNOLOGÍA DE VAPEO</span>
              <h2>¿Por qué elegir <span className="text-neon-purple">VAPEX</span>?</h2>
              <p>
                Nos apasiona ofrecer la máxima calidad y los últimos avances del sector. Trabajamos exclusivamente con marcas certificadas que cumplen rigurosamente la normativa europea (TPD), garantizando que consumas e-liquids con ingredientes de grado farmacéutico.
              </p>
              <div className="feature-bullets">
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>Resistencias Mesh Avanzadas:</strong> Menor sabor a quemado, vapor uniforme.</span>
                </div>
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>Baterías de Cobalto Puro:</strong> Autonomía extendida hasta el final de la vida útil.</span>
                </div>
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>Líquidos TPD Compliant:</strong> Libres de diacetilo, control de pureza estricto.</span>
                </div>
              </div>
            </div>
            <div className="experience-visual">
              <img src="/images/vape_pod_kit.png" alt="Dispositivo de tecnología" className="tech-image" />
            </div>
          </div>
        </section>

        {/* Section: About Us */}
        <section id="nosotros" className="about-section">
          <div className="about-content">
            <h2 className="about-title">Sobre Nosotros</h2>
            <p>
              VAPEX nació en 2026 con el objetivo de revolucionar la forma en que los vapeadores españoles adquieren sus dispositivos. Ofrecemos un servicio al cliente impecable, envíos rápidos en 24h y un catálogo cuidadosamente seleccionado con los mejores pods desechables, recargables y líquidos premium del mercado internacional.
            </p>
            <div className="stats-row">
              <div className="stat-card">
                <h3>+10K</h3>
                <p>Clientes Satisfechos</p>
              </div>
              <div className="stat-card">
                <h3>24H</h3>
                <p>Envío a Península</p>
              </div>
              <div className="stat-card">
                <h3>100%</h3>
                <p>Garantía de Sabor</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Nicotine/Vaping Legal Warning Footer Banner */}
      <div className="legal-warning-banner">
        <p><strong>ADVERTENCIA:</strong> Este producto contiene nicotina. La nicotina es una sustancia altamente adictiva. Venta exclusiva a mayores de 18 años.</p>
      </div>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <h3>VAPEX</h3>
            <p>La tienda de vapeo online número uno en diseño, rendimiento y sabor.</p>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#catalogo">Catálogo</a></li>
              <li><a href="#experiencia">Experiencia</a></li>
              <li><a href="#nosotros">Nosotros</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <p>Soporte: info@vapex.com</p>
            <p>Teléfono: +34 900 123 456</p>
            <p>Horario: L-V 9:00 a 19:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VAPEX. Todos los derechos reservados. Diseñado por Antigravity.</p>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        onUpdateQty={handleUpdateQty} 
        onRemoveItem={handleRemoveItem} 
        onClearCart={handleClearCart} 
      />
    </>
  );
}

export default App;
