import { Star, ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product, onQuickView, onAddToCart }) {
  const { name, brand, price, rating, reviews, image, inStock, details } = product;

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
      {/* Star SVG gradient definition wrapper (rendered once in app is fine, but we can put it inline or just let regular styling handle color) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#ffb800" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stock Label */}
      {!inStock && <div className="stock-badge-out">Agotado</div>}
      {inStock && product.stockCount <= 5 && <div className="stock-badge-low">Últimas unidades</div>}

      {/* Image Section */}
      <div className="product-card-image" onClick={() => onQuickView(product)}>
        <img src={image} alt={name} loading="lazy" />
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
            {product.category === 'oxido-nitroso' ? 'N2O Culinario' : product.category === 'coleccionismo' ? 'Colección' : 'Vapeo'}
          </span>
        </div>
        <h3 className="product-name" onClick={() => onQuickView(product)}>{name}</h3>
        
        {/* Rating */}
        <div className="product-rating">
          <div className="stars-wrapper">{renderStars(rating)}</div>
          <span className="rating-count">({reviews})</span>
        </div>

        {/* Dynamic Tags */}
        <div className="product-specs-preview">
          {details.tags && details.tags.length > 0 ? (
            details.tags.map((tag, idx) => (
              <span key={idx} className="spec-badge spec-custom-tag">{tag}</span>
            ))
          ) : (
            <>
              {details.puffs && details.puffs !== "N/A" && (
                <span className="spec-badge">{details.puffs}</span>
              )}
              {details.capacity && (
                <span className="spec-badge">{details.capacity}</span>
              )}
            </>
          )}
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="product-card-footer">
          <div className="product-price">
            <span className="currency">€</span>
            <span className="amount">{price.toFixed(2)}</span>
          </div>
          
          <button 
            className="add-to-cart-btn" 
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
          >
            <ShoppingCart size={16} />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
