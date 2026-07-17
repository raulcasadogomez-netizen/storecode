import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import AgeVerificationModal from '../components/AgeVerificationModal';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../i18n/LanguageContext';
import { handleGeneralWhatsAppContact } from '../lib/whatsapp';

export default function Storefront() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCategories = [
    { id: 'vapers', name: 'Vapers' },
    { id: 'reposteria', name: 'Óxido Nitroso' },
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

  // No cart management needed. Purchases are processed via WhatsApp direct checkout.

  return (
    <>
      {/* Age Verification Modal */}
      <AgeVerificationModal />

      {/* Main Navigation */}
      <Navbar 
        searchVal={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* Hero Banner */}
      <Hero />

      {/* Main Content Layout */}
      <main className="main-layout">        {/* WhatsApp Direct Contact Button */}
        <div className="whatsapp-direct-container">
          <button 
            className="btn-whatsapp-large-direct" 
            onClick={() => handleGeneralWhatsAppContact(t)}
            id="whatsapp-general-btn"
          >
            <svg 
              className="whatsapp-icon" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              width="28" 
              height="28"
            >
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.81 1.246h.005c5.507 0 9.99-4.478 9.99-9.987C22.007 6.479 17.52 2 12.012 2zm0 18.29h-.004a8.256 8.256 0 0 1-4.218-1.164l-.303-.18-3.137.822.836-3.056-.197-.314A8.253 8.253 0 0 1 3.753 12c.002-4.549 3.702-8.249 8.261-8.249 2.207.001 4.281.861 5.84 2.422a8.204 8.204 0 0 1 2.41 5.837c-.002 4.55-3.702 8.25-8.252 8.28zm4.52-6.175c-.247-.124-1.467-.723-1.693-.807-.227-.082-.393-.124-.558.124-.165.247-.639.807-.784.969-.144.165-.29.185-.536.062-.247-.124-1.04-.383-1.982-1.223-.733-.654-1.228-1.462-1.372-1.71-.144-.247-.015-.38.109-.503.111-.11.247-.29.37-.433.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.433-.062-.124-.558-1.343-.764-1.838-.2-.482-.422-.416-.578-.423l-.495-.008c-.165 0-.433.062-.66.31-.227.247-.866.845-.866 2.062 0 1.216.886 2.392.99 2.536.103.144 1.742 2.66 4.223 3.73.59.254 1.05.406 1.41.52.593.189 1.133.162 1.56.098.476-.072 1.468-.6 1.674-1.18.207-.578.207-1.074.145-1.18-.063-.103-.228-.165-.475-.29z"/>
            </svg>
            <span>{t('btn_contact_whatsapp')}</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="store-loading-wrapper">
            <div className="spinner-glow"></div>
            <h3>{t('store_loading', {}, 'Cargando catálogo de importación...')}</h3>
          </div>
        ) : (
          /* Product Catalog Grid Section */
          <ProductGrid 
            products={products}
            categories={categories}
            searchQuery={searchQuery} 
            onQuickView={setSelectedProduct} 
          />
        )}

        {/* Section: Experience & Tech */}
        <section id="experiencia" className="experience-section">
          <div className="section-glow-purple"></div>
          <div className="experience-grid">
            <div className="experience-text">
              <span className="section-tag">{t('exp_tag')}</span>
              <h2>{t('exp_title_part1')}<span className="text-neon-purple">{t('exp_title_purple')}</span></h2>
              <p>
                {t('exp_desc')}
              </p>
              <div className="feature-bullets">
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>{t('exp_bullet1_title')}</strong>{t('exp_bullet1_desc')}</span>
                </div>
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>{t('exp_bullet2_title')}</strong>{t('exp_bullet2_desc')}</span>
                </div>
                <div className="bullet">
                  <div className="bullet-indicator"></div>
                  <span><strong>{t('exp_bullet3_title')}</strong>{t('exp_bullet3_desc')}</span>
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
            <h2 className="about-title">{t('about_title')}</h2>
            <p>
              {t('about_desc')}
            </p>
            <div className="stats-row">
              <div className="stat-card">
                <h3>{t('about_stat1_num')}</h3>
                <p>{t('about_stat1_desc')}</p>
              </div>
              <div className="stat-card">
                <h3>{t('about_stat2_num')}</h3>
                <p>{t('about_stat2_desc')}</p>
              </div>
              <div className="stat-card">
                <h3>{t('about_stat3_num')}</h3>
                <p>{t('about_stat3_desc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Legal Warning Footer Banner */}
      <div className="legal-warning-banner">
        <p>{t('footer_warning_b2b')}</p>
      </div>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          <div className="footer-col brand-col">
            <h3>VAPEX IMPORT</h3>
            <p>{t('footer_brand_desc')}</p>
            <p style={{ marginTop: '1.5rem' }}>
              <a href="/admin" className="text-neon-cyan" style={{ fontSize: '0.85rem', textDecoration: 'underline' }}>
                {t('footer_admin_panel')}
              </a>
            </p>
          </div>
          <div className="footer-col">
            <h4>{t('footer_nav_title')}</h4>
            <ul>
              <li><a href="#catalogo">{t('footer_nav_catalog')}</a></li>
              <li><a href="#experiencia">{t('footer_nav_guarantees')}</a></li>
              <li><a href="#nosotros">{t('footer_nav_about')}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t('footer_legal_title')}</h4>
            <ul>
              <li><a href="#aviso-legal" onClick={(e) => { e.preventDefault(); alert(t('alert_legal_notice')); }}>{t('footer_legal_notice')}</a></li>
              <li><a href="#privacidad" onClick={(e) => { e.preventDefault(); alert(t('alert_privacy_policy')); }}>{t('footer_legal_privacy')}</a></li>
              <li><a href="#cookies" onClick={(e) => { e.preventDefault(); alert(t('alert_cookies_policy')); }}>{t('footer_legal_cookies')}</a></li>
              <li><a href="#condiciones-b2b" onClick={(e) => { e.preventDefault(); alert(t('alert_b2b_terms')); }}>{t('footer_legal_terms')}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t('footer_contact_title')}</h4>
            <p>{t('footer_contact_email')}</p>
            <p>{t('footer_contact_phone')}</p>
            <p>{t('footer_contact_hours')}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VAPEX. {t('footer_rights')}</p>
        </div>
      </footer>

      {/* Modals & Slideouts */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}
