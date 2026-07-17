import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function AgeVerificationModal() {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

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
          <img src="/images/logovapers.webp" alt="VAPEX Logo" className="modal-logo-img" />
        </div>
        
        <h2>{t('age_title')}</h2>
        
        <p className="warning-text">
          {t('age_warning')}
        </p>
        
        <p className="sub-text">
          {t('age_sub')}
        </p>

        <div className="age-disclaimer">
          {t('age_legal')}
        </div>

        <div className="action-buttons">
          <button className="btn-decline" onClick={handleDecline}>
            {t('age_btn_decline')}
          </button>
          <button className="btn-verify" onClick={handleVerify}>
            {t('age_btn_verify')}
          </button>
        </div>
      </div>
    </div>
  );
}

