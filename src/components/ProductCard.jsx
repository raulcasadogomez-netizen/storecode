import { Star, Eye } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { handleBuyViaWhatsApp } from '../lib/whatsapp';

export default function ProductCard({ product, categoryName, onQuickView }) {
  const { name, brand, price, rating, reviews, image, inStock, details } = product;
  const { t } = useTranslation();

  const getUnitPrice = () => {
    if (!details.units_per_package) return null;
    const num = parseInt(details.units_per_package);
    if (!isNaN(num) && num > 1) {
      return (price / num).toFixed(2);
    }
    return null;
  };
  const unitPrice = getUnitPrice();

  // Helper to render stars
  const renderStars = (ratingVal) => {
    const stars = [];
    const fullStars = Math.floor(ratingVal);
    const hasHalf = ratingVal % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="star-filled" fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<Star key={i} size={14} className="star-half" fill="url(#star-grad)" />);
      } else {
        stars.push(<Star key={i} size={14} className="star-empty" />);
      }
    }
    return stars;
  };

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      {/* Star SVG gradient definition wrapper */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#ffb800" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stock Label */}
      {!inStock && <div className="stock-badge-out">{t('stock_out')}</div>}

      {/* Image Section */}
      <div className="product-card-image" onClick={() => onQuickView(product)}>
        <img src={image} alt={t(`p_${product.id}_name`, {}, name)} loading="lazy" />
        <div className="image-overlay-actions">
          <button className="icon-action-btn" title="Vista Rápida" onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}>
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="product-card-info">
        <div className="product-card-brand-row">
          <span className="product-brand">{brand}</span>
          <span className="product-category-tag">
            {t('cat_' + product.category, {}, categoryName || (product.category === 'oxido-nitroso' ? 'Óxido Nitroso' : product.category === 'coleccionismo' ? 'Coleccionismo' : 'Vapers'))}
          </span>
        </div>
        <h3 className="product-name" onClick={() => onQuickView(product)}>{t(`p_${product.id}_name`, {}, name)}</h3>
        
        {/* Rating */}
        <div className="product-rating">
          <div className="stars-wrapper">{renderStars(rating)}</div>
          <span className="rating-count">({reviews})</span>
        </div>

        {/* Dynamic Tags */}
        <div className="product-specs-preview">
          {details.tags && details.tags.length > 0 ? (
            details.tags.map((tag, idx) => (
              <span key={idx} className="spec-badge spec-custom-tag">{t(tag, {}, tag)}</span>
            ))
          ) : (
            <>
              {details.puffs && details.puffs !== "N/A" && (
                <span className="spec-badge">{t(`p_${product.id}_puffs`, {}, details.puffs)}</span>
              )}
              {details.capacity && (
                <span className="spec-badge">{t(`p_${product.id}_capacity`, {}, details.capacity)}</span>
              )}
            </>
          )}
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="product-card-footer">
          <div className="product-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div>
              <span className="currency">€</span>
              <span className="amount">{price.toFixed(2)}</span>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 'bold' }}>{t('b2b_iva_tag')}</span>
            {(() => {
              const units = details.units_per_package;
              if (!units) return null;
              const num = parseInt(units);
              const showUnits = isNaN(num) || num > 1;
              if (!showUnits) return null;
              return (
                <span style={{ fontSize: '0.68rem', color: 'var(--neon-cyan)', marginTop: '4px', fontWeight: '700', letterSpacing: '0.02em' }}>
                  Ux/ {units} {unitPrice && `(${unitPrice} €/U)`}
                </span>
              );
            })()}
          </div>
          
          <button 
            className="whatsapp-buy-btn" 
            onClick={() => {
              const defaultNicotine = product.category === 'vapers' && product.details.nicotine && product.details.nicotine.length > 0 ? product.details.nicotine[0] : null;
              handleBuyViaWhatsApp(product, 1, defaultNicotine, t);
            }}
            disabled={!inStock}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 512l148.4-38.9c32.8 17.9 69.6 27.3 107.4 27.3 122.4 0 222-99.6 222-222 0-59.3-23.2-115-65.1-157.1zM223.9 474c-33.2 0-65.7-8.9-94-25.7l-6.7-4-88 23 23.3-85.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
            <span>{t('btn_buy_whatsapp')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}


