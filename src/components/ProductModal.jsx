import { useState } from 'react';
import { X, Star, Plus, Minus, ShieldCheck, Heart } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
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
              <img src={product.image} alt={product.name} />
            </div>
            {!product.inStock && <span className="modal-stock-badge-out">Sin Stock</span>}
            {product.inStock && product.stockCount <= 5 && (
              <span className="modal-stock-badge-low">¡Pocas unidades!</span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="modal-info-panel">
            <span className="info-brand">{product.brand}</span>
            <h2 className="info-name">{product.name}</h2>

            <div className="info-meta">
              <div className="stars-wrapper">
                <Star size={16} className="star-filled" fill="currentColor" />
                <span className="rating-num">{product.rating}</span>
              </div>
              <span className="reviews-num">{product.reviews} opiniones</span>
            </div>

            <div className="info-price" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div>
                <span className="currency">€</span>
                <span className="amount">{product.price.toFixed(2)}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>+ IVA (Precio Mayorista)</span>
            </div>

            <p className="info-description">{product.description}</p>

            {/* Custom Neon Tags */}
            {product.details.tags && product.details.tags.length > 0 && (
              <div className="modal-custom-tags">
                {product.details.tags.map((tag, idx) => (
                  <span key={idx} className="modal-tag-badge">{tag}</span>
                ))}
              </div>
            )}

            {/* Nicotine Selector */}
            {product.category === 'vapers' && product.details.nicotine && product.details.nicotine.length > 0 && (
              <div className="selector-group">
                <label className="selector-label">Nicotina</label>
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
              <h3>Especificaciones Técnicas</h3>
              <table className="specs-table">
                <tbody>
                  {product.details.flavor && (
                    <tr>
                      <td className="spec-name">
                        {product.category === 'oxido-nitroso' ? 'Pureza / Grado' : 
                         product.category === 'coleccionismo' ? 'Acabado / Material' : 
                         product.category === 'vapers' ? 'Sabor principal' : 'Especificación'}
                      </td>
                      <td className="spec-val">{product.details.flavor}</td>
                    </tr>
                  )}
                  {product.details.puffs && product.details.puffs !== "N/A" && (
                    <tr>
                      <td className="spec-name">Autonomía</td>
                      <td className="spec-val">{product.details.puffs}</td>
                    </tr>
                  )}
                  {product.details.battery && product.details.battery !== "N/A" && (
                    <tr>
                      <td className="spec-name">
                        {product.category === 'coleccionismo' ? 'Mecanismo' : 
                         product.category === 'vapers' ? 'Batería' : 'Batería / Mecanismo'}
                      </td>
                      <td className="spec-val">{product.details.battery}</td>
                    </tr>
                  )}
                  {product.details.capacity && (
                    <tr>
                      <td className="spec-name">
                        {product.category === 'oxido-nitroso' ? 'Contenido' : 
                         product.category === 'vapers' ? 'Capacidad' : 'Capacidad / Contenido'}
                      </td>
                      <td className="spec-val">{product.details.capacity}</td>
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
                  Añadir al carrito ({ (product.price * quantity).toFixed(2) } €)
                </button>

                <button 
                  className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => setIsLiked(!isLiked)}
                  title="Añadir a deseos"
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>
            ) : (
              <button className="modal-add-btn disabled-btn" disabled>
                Agotado Temporalmente
              </button>
            )}

            <div className="trust-badges">
              <span className="trust-item">
                <ShieldCheck size={14} className="text-cyan" /> Original Garantizado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
