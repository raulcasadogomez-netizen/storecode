import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import AgeVerificationModal from '../components/AgeVerificationModal';
import { supabase } from '../lib/supabaseClient';
import { products as localBackupProducts } from '../data/products';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        if (!supabase) {
          setProducts(localBackupProducts);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map database snake_case fields to components camelCase fields
          const mappedProducts = data.map((item) => ({
            ...item,
            inStock: item.in_stock !== undefined ? item.in_stock : item.inStock,
            stockCount: item.stock_count !== undefined ? item.stock_count : item.stockCount,
            details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details
          }));
          setProducts(mappedProducts);
        } else {
          setProducts(localBackupProducts);
        }
      } catch (err) {
        console.error("Error fetching from Supabase, loading fallback mock products:", err);
        setProducts(localBackupProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

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
    const selectedNic = nicotine !== null ? nicotine : (product.details.nicotine ? product.details.nicotine[0] : 0);

    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.selectedNicotine === selectedNic
    );

    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
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
        hasNicotine: product.category === 'vapers' && product.details.nicotine && product.details.nicotine.length > 0,
        quantity: quantity,
        stockCount: product.stockCount
      });
    }

    saveCart(updatedCart);
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
        {/* Loading Spinner */}
        {loading ? (
          <div className="store-loading-wrapper">
            <div className="spinner-glow"></div>
            <h3>Cargando catálogo de importación...</h3>
          </div>
        ) : (
          /* Product Catalog Grid Section */
          <ProductGrid 
            products={products}
            searchQuery={searchQuery} 
            onQuickView={setSelectedProduct} 
            onAddToCart={handleAddToCart} 
          />
        )}

        {/* Section: Experience & Tech */}
        <section id="experiencia" className="experience-section">
          <div className="section-glow-purple"></div>
          <div className="experience-grid">
            <div className="experience-text">
              <span className="section-tag">PROCESO DE IMPORTACIÓN</span>
              <h2>Garantías de <span className="text-neon-purple">VAPEX Import</span></h2>
              <p>
                Nos encargamos de todo el proceso de importación y aduanas para traer a España los artículos más exclusivos y de alta demanda del mercado internacional. Garantizamos la trazabilidad total y el cumplimiento legal de cada producto.
              </p>
              <div className="feature-bullets">
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>Regulación Europea TPD:</strong> Todos los vapers cumplen estrictamente con la directiva europea de tabaco y pureza.</span>
                </div>
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>Pureza Certificada E942:</strong> Nuestro óxido nitroso culinario posee certificación de calidad alimentaria para cocina gourmet.</span>
                </div>
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>Coleccionables Verificados:</strong> Cada artículo de colección es de importación genuina y seleccionado por su estado premium.</span>
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
            <h2 className="about-title">Sobre VAPEX Import</h2>
            <p>
              Somos una importadora especializada fundada en 2026 con la misión de facilitar el acceso a productos internacionales exclusivos de alta demanda. Gestionamos directamente el transporte y los despachos aduaneros para ofrecer a nuestros clientes en España vapers de gama alta, óxido nitroso certificado para repostería profesional y piezas limitadas de coleccionismo con entrega express desde nuestro almacén local.
            </p>
            <div className="stats-row">
              <div className="stat-card">
                <h3>+10K</h3>
                <p>Clientes Satisfechos</p>
              </div>
              <div className="stat-card">
                <h3>24H</h3>
                <p>Envío Express</p>
              </div>
              <div className="stat-card">
                <h3>100%</h3>
                <p>Original y Seguro</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Legal Warning Footer Banner */}
      <div className="legal-warning-banner">
        <p><strong>ADVERTENCIA:</strong> Venta exclusiva a mayores de 18 años. Los vapers con nicotina contienen una sustancia altamente adictiva. El óxido nitroso de grado alimentario se vende únicamente para repostería y coctelería; su inhalación para otros fines es peligrosa y está prohibida.</p>
      </div>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <h3>VAPEX IMPORT</h3>
            <p>La distribuidora e importadora online número uno en diseño, rendimiento y sabor premium de todo el mundo.</p>
            <p style={{ marginTop: '1.5rem' }}>
              <a href="/admin" className="text-neon-cyan" style={{ fontSize: '0.85rem', textDecoration: 'underline' }}>
                Panel de Administración
              </a>
            </p>
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

      {/* Modals & Slideouts */}
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
