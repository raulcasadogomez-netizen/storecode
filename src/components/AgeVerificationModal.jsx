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
        
        <h2>Verificación de Edad</h2>
        
        <p className="warning-text">
          ESTA WEB CONTIENE PRODUCTOS DE VAPEO Y ACCESORIOS PARA ADULTOS.
        </p>
        
        <p className="sub-text">
          Para ingresar a nuestro sitio web, debes tener al menos 18 años de edad (o la edad mínima legal en tu país de residencia).
        </p>

        <div className="age-disclaimer">
          ¡Atención! La nicotina es una sustancia altamente adictiva.
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
