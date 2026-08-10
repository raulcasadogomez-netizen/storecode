import { useState } from 'react';
import { X, Star, Plus, Minus, ShieldCheck, Heart } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { handleBuyViaWhatsApp } from '../lib/whatsapp';
import WhatsAppEmailModal from './WhatsAppEmailModal';

export default function ProductModal({ product, onClose }) {
  const { t } = useTranslation();
  const [selectedNicotine, setSelectedNicotine] = useState(
    product.details.nicotine ? product.details.nicotine[0] : 0
  );
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  const handleBuy = () => {
    setIsEmailModalOpen(true);
  };

  const handleConfirmEmail = ({ email }) => {
    handleBuyViaWhatsApp(product, quantity, selectedNicotine, t, email);
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

            {(() => {
              const units = product.details.units_per_package;
              if (!units) return null;
              const num = parseInt(units);
              const showUnits = isNaN(num) || num > 1;
              if (!showUnits) return null;
              const unitPrice = (!isNaN(num) && num > 1) ? (product.price / num).toFixed(2) : null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.9rem', color: 'var(--neon-cyan)', fontWeight: '600' }}>
                  <span>Ux/ {units}</span>
                  {unitPrice && (
                    <>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
                      <span>({unitPrice} € / U)</span>
                    </>
                  )}
                </div>
              );
            })()}

            <p className="info-description">{t(`p_${product.id}_desc`, {}, product.description)}</p>

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
                        {product.category === 'reposteria' ? t('spec_label_flavor_n2o') : 
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
                        {product.category === 'reposteria' ? t('spec_label_capacity_n2o') : 
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
                  <button onClick={() => handleQtyChange(1)}>
                    <Plus size={16} />
                  </button>
                </div>

                <button className="modal-whatsapp-btn" onClick={handleBuy}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 512l148.4-38.9c32.8 17.9 69.6 27.3 107.4 27.3 122.4 0 222-99.6 222-222 0-59.3-23.2-115-65.1-157.1zM223.9 474c-33.2 0-65.7-8.9-94-25.7l-6.7-4-88 23 23.3-85.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                  <span>{t('btn_buy_whatsapp')} ({ (product.price * quantity).toFixed(2) } €)</span>
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

      <WhatsAppEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onConfirm={handleConfirmEmail}
        actionType="product"
      />
    </div>
  );
}


