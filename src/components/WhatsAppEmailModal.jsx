import { useState, useEffect } from 'react';
import { X, Mail, ShieldAlert, MessageSquare, ArrowRight, Lock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { saveCustomerEmail } from '../lib/emailService';

export default function WhatsAppEmailModal({ isOpen, onClose, onConfirm, actionType = 'general' }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setEmail('');
      setAcceptTerms(false);
      setAcceptMarketing(false);
      setShowWarning(false);
      setEmailError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(val).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setShowWarning(false);

    if (!email || !validateEmail(email)) {
      setEmailError(t('email_invalid_error', {}, 'Por favor, introduce una dirección de correo electrónico válida.'));
      return;
    }

    // MANDATORY REQUIREMENT: User MUST accept terms (data storage) to advance!
    if (!acceptTerms) {
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Save email to Supabase and LocalStorage
      await saveCustomerEmail({
        email: email.trim(),
        acceptTerms: true,
        acceptMarketing: acceptMarketing,
        source: actionType === 'cart' ? 'whatsapp_cart' : actionType === 'product' ? 'whatsapp_product' : 'whatsapp_general'
      });

      // Execute redirect callback
      onConfirm({
        email: email.trim(),
        acceptTerms: true,
        acceptMarketing: acceptMarketing
      });

      onClose();
    } catch (err) {
      console.error("Error submitting email:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="email-modal-header">
          <div className="modal-title-row">
            <div className="icon-badge-wa">
              <MessageSquare size={22} className="text-neon-cyan" />
            </div>
            <div>
              <h3>{t('email_modal_title', {}, 'Contactar vía WhatsApp')}</h3>
              <p className="modal-subtitle">
                {t('email_modal_subtitle', {}, 'Introduce tu correo electrónico antes de continuar al chat de WhatsApp.')}
              </p>
            </div>
          </div>
          <button className="email-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="email-modal-form">
          {/* Warning Banner when Terms Checkbox is NOT checked */}
          {showWarning && (
            <div className="email-modal-warning-banner">
              <ShieldAlert size={22} className="warning-icon" />
              <div>
                <strong>{t('email_warning_title', {}, 'Acción requerida')}</strong>
                <p>{t('email_warning_msg', {}, 'Debes aceptar que la empresa almacene tu correo electrónico para poder avanzar a la compra o consulta por WhatsApp.')}</p>
              </div>
            </div>
          )}

          {/* Email Input Field */}
          <div className="email-input-group">
            <label htmlFor="customer-email-input">
              <Mail size={16} className="input-icon" />
              <span>{t('email_label', {}, 'Correo Electrónico')} <span className="req-star">*</span></span>
            </label>
            <div className={`input-field-wrapper ${emailError ? 'input-error' : ''}`}>
              <input
                id="customer-email-input"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                required
                autoFocus
              />
            </div>
            {emailError && <span className="email-error-text">{emailError}</span>}
          </div>

          {/* Checkboxes Section */}
          <div className="email-checkboxes-container">
            {/* Checkbox 1: MANDATORY Data Storage Consent */}
            <label className={`email-checkbox-item mandatory ${showWarning && !acceptTerms ? 'checkbox-highlight-error' : ''}`}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (e.target.checked) setShowWarning(false);
                }}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                <strong>{t('email_terms_mandatory_label', {}, 'Acepto el almacenamiento de mi correo')} <span className="req-badge">Obligatorio</span></strong>
                <small>{t('email_terms_mandatory_desc', {}, 'Consiento que la empresa guarde mi correo electrónico con el único fin de gestionar mi consulta y pedido.')}</small>
              </span>
            </label>

            {/* Checkbox 2: OPTIONAL Marketing / Spam Consent */}
            <label className="email-checkbox-item optional">
              <input
                type="checkbox"
                checked={acceptMarketing}
                onChange={(e) => setAcceptMarketing(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                <strong>{t('email_marketing_optional_label', {}, 'Acepto recibir novedades y promociones')} <span className="opt-badge">Opcional</span></strong>
                <small>{t('email_marketing_optional_desc', {}, 'Deseo recibir correos con descuentos exclusivos, catálogos nuevos y ofertas especiales de VAPEX.')}</small>
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="email-modal-footer">
            <div className="privacy-guarantee">
              <Lock size={14} />
              <span>{t('email_privacy_note', {}, 'Tus datos están 100% protegidos según el RGPD.')}</span>
            </div>
            
            <div className="button-group">
              <button type="button" className="btn-cancel" onClick={onClose}>
                {t('btn_cancel', {}, 'Cancelar')}
              </button>
              <button type="submit" className="btn-submit-wa" disabled={isSubmitting}>
                <span>{t('btn_continue_whatsapp', {}, 'Continuar a WhatsApp')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
