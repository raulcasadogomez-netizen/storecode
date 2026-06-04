import { useState, useEffect } from 'react';

export default function AgeVerificationModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem('vapex-age-verified');
    if (isVerified !== 'true') {
      setShowModal(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('vapex-age-verified', 'true');
    setShowModal(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showModal) return null;

  return (
    <div className="age-verification-overlay">
      <div className="age-verification-card">
        <div className="logo-container">
          <span className="logo-neon-text">VAPEX</span>
        </div>
        
        <h2>Verificación de Edad y B2B</h2>
        
        <p className="warning-text">
          PORTAL DE IMPORTACIÓN MAYORISTA EXCLUSIVO PARA PROFESIONALES Y AUTÓNOMOS.
        </p>
        
        <p className="sub-text">
          Para ingresar a nuestro portal de distribución B2B, debes ser mayor de 18 años y profesional del sector.
        </p>

        <div className="age-disclaimer">
          <strong>INFORMACIÓN LEGAL:</strong> De acuerdo con el R.D. Ley 17/2017 de España, los vapers con nicotina solo se distribuyen a comercios y establecimientos autorizados. Se requerirá acreditación fiscal para cursar los pedidos.
        </div>

        <div className="action-buttons">
          <button className="btn-decline" onClick={handleDecline}>
            No, soy menor de 18
          </button>
          <button className="btn-verify" onClick={handleVerify}>
            Sí, tengo +18 años
          </button>
        </div>
      </div>
    </div>
  );
}
