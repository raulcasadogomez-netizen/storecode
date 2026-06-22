import { useState } from 'react';
import { X, Star, Plus, Minus, ShieldCheck, Heart } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const { t } = useTranslation();
  const [selectedNicotine, setSelectedNicotine] = useState(
    product.details.nicotine ? product.details.nicotine[0] : 0
  );
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= (product.stockCount || 10)) {
      setQuantity(newQty);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedNicotine);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-body-grid">
          {/* Left: Product Image */}
          <div className="modal-image-panel">
            <div className="image-wrapper">
              <img src={product.image} alt={t(`p_${product.id}_name`, {}, product.name)} />
            </div>
            {!product.inStock && <span className="modal-stock-badge-out">{t('modal_out_stock')}</span>}
            {product.inStock && product.stockCount <= 5 && (
              <span className="modal-stock-badge-low">{t('modal_low_stock')}</span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="modal-info-panel">
            <span className="info-brand">{product.brand}</span>
            <h2 className="info-name">{t(`p_${product.id}_name`, {}, product.name)}</h2>

            <div className="info-meta">
              <div className="stars-wrapper">
                <Star size={16} className="star-filled" fill="currentColor" />
                <span className="rating-num">{product.rating}</span>
              </div>
              <span className="reviews-num">{product.reviews} {t('modal_reviews')}</span>
            </div>

            <div className="info-price" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div>
                <span className="currency">€</span>
                <span className="amount">{product.price.toFixed(2)}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t('modal_price_tag')}</span>
            </div>

            <p className="info-description">{t(`p_${product.id}_desc`, {}, product.description)}</p>

            {/* Custom Neon Tags */}
            {product.details.tags && product.details.tags.length > 0 && (
              <div className="modal-custom-tags">
                {product.details.tags.map((tag, idx) => (
                  <span key={idx} className="modal-tag-badge">{t(tag, {}, tag)}</span>
                ))}
              </div>
            )}

            {/* Nicotine Selector */}
            {product.category === 'vapers' && product.details.nicotine && product.details.nicotine.length > 0 && (
              <div className="selector-group">
                <label className="selector-label">{t('modal_nicotine')}</label>
                <div className="nicotine-chips">
                  {product.details.nicotine.map((nic) => (
                    <button
                      key={nic}
                      className={`nic-chip ${selectedNicotine === nic ? 'active' : ''}`}
                      onClick={() => setSelectedNicotine(nic)}
                    >
                      {nic} mg/ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Table */}
            <div className="specs-table-wrapper">
              <h3>{t('modal_specs_title')}</h3>
              <table className="specs-table">
                <tbody>
                  {product.details.flavor && (
                    <tr>
                      <td className="spec-name">
                        {product.category === 'oxido-nitroso' ? t('spec_label_flavor_n2o') : 
                         product.category === 'coleccionismo' ? t('spec_label_flavor_collecting') : 
                         product.category === 'vapers' ? t('spec_label_flavor_vapers') : t('spec_label_flavor_default')}
                      </td>
                      <td className="spec-val">{t(`p_${product.id}_flavor`, {}, product.details.flavor)}</td>
                    </tr>
                  )}
                  {product.details.puffs && product.details.puffs !== "N/A" && (
                    <tr>
                      <td className="spec-name">{t('spec_label_puffs')}</td>
                      <td className="spec-val">{t(`p_${product.id}_puffs`, {}, product.details.puffs)}</td>
                    </tr>
                  )}
                  {product.details.battery && product.details.battery !== "N/A" && (
                    <tr>
                      <td className="spec-name">
                        {product.category === 'coleccionismo' ? t('spec_label_battery_collecting') : 
                         product.category === 'vapers' ? t('spec_label_battery_vapers') : t('spec_label_battery_default')}
                      </td>
                      <td className="spec-val">{t(`p_${product.id}_battery`, {}, product.details.battery)}</td>
                    </tr>
                  )}
                  {product.details.capacity && (
                    <tr>
                      <td className="spec-name">
                        {product.category === 'oxido-nitroso' ? t('spec_label_capacity_n2o') : 
                         product.category === 'vapers' ? t('spec_label_capacity_vapers') : t('spec_label_capacity_default')}
                      </td>
                      <td className="spec-val">{t(`p_${product.id}_capacity`, {}, product.details.capacity)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Purchase Controls */}
            {product.inStock ? (
              <div className="purchase-controls-bar">
                <div className="qty-selector">
                  <button onClick={() => handleQtyChange(-1)} disabled={quantity <= 1}>
                    <Minus size={16} />
                  </button>
                  <span className="qty-number">{quantity}</span>
                  <button onClick={() => handleQtyChange(1)} disabled={quantity >= product.stockCount}>
                    <Plus size={16} />
                  </button>
                </div>

                <button className="modal-add-btn" onClick={handleAdd}>
                  {t('modal_btn_add_to_cart')} ({ (product.price * quantity).toFixed(2) } €)
                </button>

                <button 
                  className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => setIsLiked(!isLiked)}
                  title={t('modal_wishlist_title')}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>
            ) : (
              <button className="modal-add-btn disabled-btn" disabled>
                {t('modal_btn_out_of_stock')}
              </button>
            )}

            <div className="trust-badges">
              <span className="trust-item">
                <ShieldCheck size={14} className="text-cyan" /> {t('modal_original_guaranteed')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

