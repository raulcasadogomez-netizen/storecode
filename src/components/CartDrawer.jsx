import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onClearCart }) {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'paying', 'success'
  
  // B2B Customer States
  const [companyName, setCompanyName] = useState('');
  const [cifNif, setCifNif] = useState('');
  const [acceptB2B, setAcceptB2B] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const { t, language } = useTranslation();

  if (!isOpen) return null;

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const shipping = subtotal >= 49 || subtotal === 0 ? 0 : 4.90;
  const total = subtotal - discountAmount + shipping;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'NEON10') {
      setDiscountPercent(10);
      setCouponApplied('NEON10');
      setCouponError('');
    } else {
      setCouponError(t('cart_coupon_error'));
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setCouponApplied('');
    setCouponCode('');
  };

  const handleCheckoutSubmit = () => {
    if (!companyName.trim() || !cifNif.trim() || !acceptB2B || !acceptPrivacy) {
      alert(t('cart_validation_error', {}, "Por favor rellena todos los campos obligatorios y acepta los términos comerciales."));
      return;
    }

    setCheckoutStep('paying');

    const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '34641324707';
    
    const localeString = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'es-ES';
    
    let text = t('whatsapp_order_title');
    text += `${t('whatsapp_company')}${companyName.trim()}\n`;
    text += `${t('whatsapp_cif')}${cifNif.trim().toUpperCase()}\n`;
    text += `${t('whatsapp_datetime')}${new Date().toLocaleString(localeString)}\n`;
    text += `----------------------------------------------\n`;
    
    cartItems.forEach((item) => {
      const translatedName = t(`p_${item.id}_name`, {}, item.name);
      const nicText = item.hasNicotine ? t('whatsapp_item_nic', { nic: item.selectedNicotine }) : '';
      const packText = item.unitsPerPackage > 1 ? ` (${item.unitsPerPackage} U/${item.packageName || 'unidad'})` : '';
      text += `• ${item.quantity}x ${translatedName}${nicText}${packText} - ${(item.price * item.quantity).toFixed(2)} €\n`;
    });
    
    text += `----------------------------------------------\n`;
    if (couponApplied) {
      text += `${t('whatsapp_subtotal')}${subtotal.toFixed(2)} €\n`;
      text += t('whatsapp_coupon_applied', { coupon: couponApplied, discount: discountPercent });
    }
    text += `${t('whatsapp_shipping')}${shipping === 0 ? t('whatsapp_shipping_free') : `${shipping.toFixed(2)} €`}\n`;
    text += `${t('whatsapp_total')}${total.toFixed(2)} €\n\n`;
    text += t('whatsapp_footer_msg');

    const whatsAppUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;

    setTimeout(() => {
      window.open(whatsAppUrl, '_blank');
      setCheckoutStep('success');
    }, 1500);
  };

  const handleFinishAll = () => {
    onClearCart();
    setCheckoutStep('cart');
    setCompanyName('');
    setCifNif('');
    setAcceptB2B(false);
    setAcceptPrivacy(false);
    handleRemoveCoupon();
    onClose();
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cart-header">
          <div className="title-wrapper">
            <ShoppingBag size={20} className="text-neon-cyan" />
            <h2>{t('cart_title')}</h2>
          </div>
          <button className="cart-close-btn" onClick={onClose} disabled={checkoutStep === 'paying'}>
            <X size={20} />
          </button>
        </div>

        {/* CART STATE */}
        {checkoutStep === 'cart' && (
          <>
            {/* Body */}
            <div className="cart-body">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={64} className="empty-cart-icon" />
                  <h3>{t('cart_empty_title')}</h3>
                  <p>{t('cart_empty_desc')}</p>
                  <button className="btn-primary-neon" onClick={onClose}>
                    {t('cart_btn_explore')}
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div className="cart-item-row" key={`${item.id}-${item.selectedNicotine}`}>
                      <img src={item.image} alt={t(`p_${item.id}_name`, {}, item.name)} className="cart-item-img" />
                      <div className="cart-item-details">
                        <h4>{t(`p_${item.id}_name`, {}, item.name)}</h4>
                        <div className="cart-item-meta">
                          {item.hasNicotine && (
                            <span className="meta-badge">{t('modal_nicotine')}: {item.selectedNicotine}mg</span>
                          )}
                          {item.unitsPerPackage > 1 && (
                            <span className="meta-badge" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                              {item.unitsPerPackage} U/{item.packageName || 'unidad'} ({((item.price) / item.unitsPerPackage).toFixed(2)} €/U)
                            </span>
                          )}
                        </div>
                        <div className="cart-item-footer">
                          {/* Qty edit */}
                          <div className="qty-selector-small">
                            <button onClick={() => onUpdateQty(item.id, item.selectedNicotine, -1)}>
                              <Minus size={12} />
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button onClick={() => onUpdateQty(item.id, item.selectedNicotine, 1)}>
                              <Plus size={12} />
                            </button>
                          </div>
                          {/* Price */}
                          <div className="cart-item-price">
                            {(item.price * item.quantity).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                      <button 
                        className="btn-remove-item" 
                        onClick={() => onRemoveItem(item.id, item.selectedNicotine)}
                        title={t('cart_coupon_remove')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary */}
            {cartItems.length > 0 && (
              <div className="cart-footer">
                {/* Coupon Form */}
                {!couponApplied ? (
                  <form onSubmit={handleApplyCoupon} className="coupon-form">
                    <input
                      type="text"
                      placeholder={t('cart_coupon_placeholder')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="submit">{t('cart_coupon_btn')}</button>
                  </form>
                ) : (
                  <div className="coupon-applied-tag">
                    <span className="tag-text">
                      <Sparkles size={14} /> {t('cart_coupon_applied', { coupon: couponApplied })}
                    </span>
                    <button type="button" onClick={handleRemoveCoupon} className="remove-coupon-btn">
                      {t('cart_coupon_remove')}
                    </button>
                  </div>
                )}
                {couponError && <p className="coupon-error-msg">{couponError}</p>}

                {/* Calculation Details */}
                <div className="totals-details">
                  <div className="totals-row">
                    <span>{t('cart_subtotal')}</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="totals-row discount-row text-neon-pink">
                      <span>{t('cart_discount')} ({discountPercent}%)</span>
                      <span>-{discountAmount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="totals-row">
                    <span>{t('cart_shipping')}</span>
                    <span>{shipping === 0 ? t('cart_shipping_free') : `${shipping.toFixed(2)} €`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="shipping-hint">
                      {t('cart_shipping_hint', { amount: (49 - subtotal).toFixed(2) })}
                    </p>
                  )}
                  <div className="totals-row total-row">
                    <span>{t('cart_total')}</span>
                    <span className="text-neon-cyan">{total.toFixed(2)} €</span>
                  </div>
                </div>

                {/* B2B Checkout Form */}
                <div className="cart-b2b-form">
                  <div className="b2b-legal-note">
                    {t('cart_b2b_warning')}
                  </div>

                  <div className="b2b-input-group">
                    <label>{t('cart_company_name_label')}</label>
                    <input 
                      type="text" 
                      placeholder={t('cart_company_name_placeholder')} 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="b2b-input-group">
                    <label>{t('cart_cif_label')}</label>
                    <input 
                      type="text" 
                      placeholder={t('cart_cif_placeholder')} 
                      value={cifNif}
                      onChange={(e) => setCifNif(e.target.value)}
                      required
                    />
                  </div>

                  <div className="b2b-checkbox-wrapper">
                    <label className="b2b-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={acceptB2B}
                        onChange={(e) => setAcceptB2B(e.target.checked)}
                      />
                      <span>{t('cart_chk_b2b')}</span>
                    </label>

                    <label className="b2b-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={acceptPrivacy}
                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                      />
                      <span>{t('cart_chk_privacy')}</span>
                    </label>
                  </div>
                </div>

                <button 
                  className="btn-primary-neon checkout-btn" 
                  onClick={handleCheckoutSubmit}
                  disabled={!companyName.trim() || !cifNif.trim() || !acceptB2B || !acceptPrivacy}
                >
                  <MessageSquare size={18} />
                  <span>{t('cart_btn_whatsapp')}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* PAYING INTERMEDIARY STATE */}
        {checkoutStep === 'paying' && (
          <div className="checkout-loading-screen">
            <div className="spinner-glow"></div>
            <h3>{t('cart_loading_title')}</h3>
            <p>{t('cart_loading_desc')}</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {checkoutStep === 'success' && (
          <div className="checkout-success-screen">
            <CheckCircle2 size={72} className="text-neon-cyan success-icon-anim" />
            <h2>{t('cart_success_title')}</h2>
            <p className="success-order-num">{t('cart_success_b2b_num')}: #VP-{Math.floor(Math.random() * 90000 + 10000)}</p>
            <p className="success-detail">
              {t('cart_success_desc')}
            </p>
            <button className="btn-primary-neon finish-btn" onClick={handleFinishAll}>
              {t('cart_btn_keep_shopping')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
