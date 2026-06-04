import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

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
      setCouponError('Cupón inválido. Intenta con NEON10');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setCouponApplied('');
    setCouponCode('');
  };

  const handleCheckoutSubmit = () => {
    if (!companyName.trim() || !cifNif.trim() || !acceptB2B || !acceptPrivacy) {
      alert("Por favor rellena todos los campos obligatorios y acepta los términos comerciales.");
      return;
    }

    setCheckoutStep('paying');

    const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '34641324707';
    
    let text = `*NUEVO PEDIDO VAPEX (B2B Mayorista)*\n\n`;
    text += `*Empresa/Autónomo:* ${companyName.trim()}\n`;
    text += `*CIF/NIF:* ${cifNif.trim().toUpperCase()}\n`;
    text += `*Fecha/Hora:* ${new Date().toLocaleString('es-ES')}\n`;
    text += `----------------------------------------------\n`;
    
    cartItems.forEach((item) => {
      const nicText = item.hasNicotine ? ` (Nic: ${item.selectedNicotine}mg)` : '';
      text += `• ${item.quantity}x ${item.name}${nicText} - ${(item.price * item.quantity).toFixed(2)} €\n`;
    });
    
    text += `----------------------------------------------\n`;
    if (couponApplied) {
      text += `*Subtotal:* ${subtotal.toFixed(2)} €\n`;
      text += `*Cupón ${couponApplied}:* -${discountPercent}%\n`;
    }
    text += `*Envío:* ${shipping === 0 ? 'Gratis' : `${shipping.toFixed(2)} €`}\n`;
    text += `*Total estimado (Sin IVA):* ${total.toFixed(2)} €\n\n`;
    text += `Hola VAPEX, he confeccionado este pedido mayorista y me gustaría coordinar los detalles de pago y envío. Adjunto mis datos fiscales para verificación fiscal.`;

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
            <h2>Mi Carrito</h2>
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
                  <h3>Tu carrito está vacío</h3>
                  <p>Añade los mejores productos de importación para comenzar.</p>
                  <button className="btn-primary-neon" onClick={onClose}>
                    Explorar Tienda
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div className="cart-item-row" key={`${item.id}-${item.selectedNicotine}`}>
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <div className="cart-item-meta">
                          {item.hasNicotine && (
                            <span className="meta-badge">Nic: {item.selectedNicotine}mg</span>
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
                        title="Eliminar"
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
                      placeholder="Cupón de descuento (ej. NEON10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="submit">Aplicar</button>
                  </form>
                ) : (
                  <div className="coupon-applied-tag">
                    <span className="tag-text">
                      <Sparkles size={14} /> Cupón <strong>{couponApplied}</strong> aplicado (-{discountPercent}%)
                    </span>
                    <button type="button" onClick={handleRemoveCoupon} className="remove-coupon-btn">
                      Quitar
                    </button>
                  </div>
                )}
                {couponError && <p className="coupon-error-msg">{couponError}</p>}

                {/* Calculation Details */}
                <div className="totals-details">
                  <div className="totals-row">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="totals-row discount-row text-neon-pink">
                      <span>Descuento ({discountPercent}%)</span>
                      <span>-{discountAmount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="totals-row">
                    <span>Envío</span>
                    <span>{shipping === 0 ? 'Gratis' : `${shipping.toFixed(2)} €`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="shipping-hint">
                      Añade <strong>{(49 - subtotal).toFixed(2)} €</strong> más para envío gratuito.
                    </p>
                  )}
                  <div className="totals-row total-row">
                    <span>Total</span>
                    <span className="text-neon-cyan">{total.toFixed(2)} €</span>
                  </div>
                </div>

                {/* B2B Checkout Form */}
                <div className="cart-b2b-form">
                  <div className="b2b-legal-note">
                    <strong>INFORMACIÓN MAYORISTA B2B:</strong> VAPEX Import es exclusivo para profesionales. En cumplimiento del R.D. Ley 17/2017 de España, los vapers con nicotina solo se distribuyen a comercios autorizados. Se solicitará acreditación fiscal por WhatsApp.
                  </div>

                  <div className="b2b-input-group">
                    <label>Nombre de Empresa / Autónomo *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Vapor Distribuciones S.L." 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="b2b-input-group">
                    <label>CIF / NIF Comercial *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. B12345678" 
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
                      <span>Declaro que realizo este pedido como profesional/empresa para uso comercial.</span>
                    </label>

                    <label className="b2b-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={acceptPrivacy}
                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                      />
                      <span>Acepto la Política de Privacidad para el envío de mis datos comerciales por WhatsApp.</span>
                    </label>
                  </div>
                </div>

                <button 
                  className="btn-primary-neon checkout-btn" 
                  onClick={handleCheckoutSubmit}
                  disabled={!companyName.trim() || !cifNif.trim() || !acceptB2B || !acceptPrivacy}
                >
                  <MessageSquare size={18} />
                  <span>Enviar Pedido por WhatsApp</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* PAYING INTERMEDIARY STATE */}
        {checkoutStep === 'paying' && (
          <div className="checkout-loading-screen">
            <div className="spinner-glow"></div>
            <h3>Procesando Pago Seguro...</h3>
            <p>Por favor, no recargues la página ni cierres el navegador.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {checkoutStep === 'success' && (
          <div className="checkout-success-screen">
            <CheckCircle2 size={72} className="text-neon-cyan success-icon-anim" />
            <h2>¡Pedido Pre-Confirmado!</h2>
            <p className="success-order-num">Nº de Control B2B: #VP-{Math.floor(Math.random() * 90000 + 10000)}</p>
            <p className="success-detail">
              Tu desglose de pedido ha sido enviado a WhatsApp. Por favor, <strong>continúa la conversación en el chat de WhatsApp</strong> para validar tu documentación fiscal y finalizar los detalles de facturación, pago y envío.
            </p>
            <button className="btn-primary-neon finish-btn" onClick={handleFinishAll}>
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
