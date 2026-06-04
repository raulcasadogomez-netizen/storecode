import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onClearCart }) {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'paying', 'success'

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
    setCheckoutStep('paying');
    setTimeout(() => {
      setCheckoutStep('success');
    }, 2000);
  };

  const handleFinishAll = () => {
    onClearCart();
    setCheckoutStep('cart');
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

                <button className="btn-primary-neon checkout-btn" onClick={handleCheckoutSubmit}>
                  <CreditCard size={18} />
                  <span>Finalizar Compra</span>
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
            <h2>¡Pedido Confirmado!</h2>
            <p className="success-order-num">Nº de Pedido: #VP-{Math.floor(Math.random() * 90000 + 10000)}</p>
            <p className="success-detail">
              ¡Gracias por confiar en VAPEX! Hemos recibido tu pago de <strong>{total.toFixed(2)} €</strong>. Se ha enviado un correo electrónico con el resumen y seguimiento de tu envío.
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
