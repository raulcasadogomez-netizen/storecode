import { Star, ShoppingCart, Eye } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function ProductCard({ product, categoryName, onQuickView, onAddToCart }) {
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
            {details.units_per_package && details.units_per_package !== '1 unidad' && (
              <span style={{ fontSize: '0.68rem', color: 'var(--neon-cyan)', marginTop: '4px', fontWeight: '700', letterSpacing: '0.02em' }}>
                Ux/ {details.units_per_package} {unitPrice && `(${unitPrice} €/U)`}
              </span>
            )}
          </div>
          
          <button 
            className="add-to-cart-btn" 
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
          >
            <ShoppingCart size={16} />
            <span>{t('btn_add')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}


