import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import AgeVerificationModal from '../components/AgeVerificationModal';
import { supabase } from '../lib/supabaseClient';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCategories = [
    { id: 'vapers', name: 'Vapers' },
    { id: 'oxido-nitroso', name: 'Óxido Nitroso' },
    { id: 'coleccionismo', name: 'Coleccionismo' }
  ];

  // Fetch products and categories from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        if (!supabase) {
          setProducts([]);
          // Load offline fallback categories
          const savedCats = localStorage.getItem('vapex-categories');
          if (savedCats) {
            try {
              setCategories(JSON.parse(savedCats));
            } catch (e) {
              setCategories(defaultCategories);
            }
          } else {
            setCategories(defaultCategories);
          }
          setLoading(false);
          return;
        }

        // Fetch categories first
        let catsData = [];
        try {
          const { data: cData, error: cErr } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
          
          if (cErr) throw cErr;
          if (cData && cData.length > 0) {
            catsData = cData;
          }
        } catch (catErr) {
          console.warn("Error fetching categories from Supabase:", catErr);
        }

        if (catsData.length === 0) {
          const savedCats = localStorage.getItem('vapex-categories');
          if (savedCats) {
            try {
              catsData = JSON.parse(savedCats);
            } catch (e) {
              catsData = defaultCategories;
            }
          } else {
            catsData = defaultCategories;
          }
        }
        setCategories(catsData);

        // Fetch products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data) {
          // Map database snake_case fields to components camelCase fields
          const mappedProducts = data.map((item) => ({
            ...item,
            inStock: item.in_stock !== undefined ? item.in_stock : item.inStock,
            stockCount: item.stock_count !== undefined ? item.stock_count : item.stockCount,
            details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details
          }));
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
            categories={categories}
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
        <p><strong>ADVERTENCIA B2B:</strong> Portal exclusivo de venta mayorista para profesionales. De acuerdo con el R.D. Ley 17/2017 de España, los vapers con nicotina solo se distribuyen a establecimientos físicos autorizados y no a consumidores finales. El óxido nitroso se comercializa estrictamente para hostelería y repostería culinaria; su inhalación con otros fines es peligrosa y está prohibida.</p>
      </div>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          <div className="footer-col brand-col">
            <h3>VAPEX IMPORT</h3>
            <p>Distribuidora e importadora mayorista online de vapeo premium, gases alimentarios y coleccionables.</p>
            <p style={{ marginTop: '1.5rem' }}>
              <a href="/admin" className="text-neon-cyan" style={{ fontSize: '0.85rem', textDecoration: 'underline' }}>
                Panel de Administración
              </a>
            </p>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#catalogo">Catálogo B2B</a></li>
              <li><a href="#experiencia">Garantías B2B</a></li>
              <li><a href="#nosotros">Nosotros</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Leyes y Privacidad</h4>
            <ul>
              <li><a href="#aviso-legal" onClick={(e) => { e.preventDefault(); alert("AVISO LEGAL:\nEste sitio web es operado por VAPEX Import S.L., con CIF B-12345678, domicilio social en Madrid, España. Portal de comercio electrónico exclusivo para profesionales (B2B)."); }}>Aviso Legal</a></li>
              <li><a href="#privacidad" onClick={(e) => { e.preventDefault(); alert("POLÍTICA DE PRIVACIDAD:\nEn cumplimiento del RGPD, tus datos personales de contacto facilitados para la tramitación de pedidos a través de WhatsApp son procesados con la única finalidad de facturación y envío comercial."); }}>Política de Privacidad</a></li>
              <li><a href="#cookies" onClick={(e) => { e.preventDefault(); alert("POLÍTICA DE COOKIES:\nEste sitio web utiliza almacenamiento técnico obligatorio (local storage) para gestionar tu verificación de edad y tu carrito de compras de forma anónima."); }}>Política de Cookies</a></li>
              <li><a href="#condiciones-b2b" onClick={(e) => { e.preventDefault(); alert("TÉRMINOS Y CONDICIONES B2B:\nTodas las ventas se gestionan mediante cierre comercial por WhatsApp. Se requiere acreditación fiscal (Modelo 036 o IAE) para validar transacciones mayoristas."); }}>Términos B2B</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <p>Soporte B2B: info@vapex.com</p>
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
