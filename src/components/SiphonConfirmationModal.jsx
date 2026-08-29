import React from 'react';
import { AlertCircle, Check, X, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SiphonConfirmationModal({ isOpen, onConfirm, onCancel }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="category-terms-overlay" onClick={onCancel}>
      <div className="category-terms-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Close button */}
        <button className="category-terms-close" onClick={onCancel} title={t('btn_cancel', {}, 'Cancelar')}>
          <X size={20} />
        </button>

        {/* Warning Icon Badge */}
        <div className="category-terms-icon-wrapper">
          <div className="category-terms-icon-glow" style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, transparent 70%)' }}></div>
          <div className="category-terms-icon-badge" style={{ background: 'rgba(0, 240, 255, 0.12)', borderColor: 'rgba(0, 240, 255, 0.45)', boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' }}>
            <AlertCircle size={36} className="text-neon-cyan" />
          </div>
        </div>

        {/* Tag & Title */}
        <div className="category-terms-header">
          <span className="category-terms-tag" style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.35)' }}>
            {t('siphon_confirm_tag', {}, 'REQUISITO OBLIGATORIO - ÓXIDO NITROSO')}
          </span>
          <h2 className="category-terms-title">
            {t('siphon_confirm_title', {}, 'Confirmación de Sifón de Repostería')}
          </h2>
        </div>

        {/* Statement Box */}
        <div className="category-terms-body">
          <div className="category-terms-statement" style={{ borderLeftColor: 'var(--neon-cyan, #00f0ff)' }}>
            <p className="category-terms-quote">
              "{t('siphon_confirm_text', {}, 'La venta sin sifón se realiza únicamente en caso de que confirmes que dispones de uno actualmente en tu propiedad.')}"
            </p>
          </div>

          <div className="category-terms-question-box" style={{ background: 'rgba(0, 240, 255, 0.08)', borderColor: 'rgba(0, 240, 255, 0.4)' }}>
            <p className="category-terms-question">
              {t('siphon_confirm_question', {}, '¿Confirmas que dispones de uno?')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="category-terms-actions">
          <button 
            type="button" 
            className="btn-terms-decline" 
            onClick={onCancel}
          >
            <ArrowLeft size={16} />
            <span>{t('siphon_btn_cancel', {}, 'No dispongo de sifón')}</span>
          </button>
          
          <button 
            type="button" 
            className="btn-terms-accept" 
            style={{ background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 100%)', boxShadow: '0 4px 15px rgba(0, 240, 255, 0.4)' }}
            onClick={onConfirm}
            autoFocus
          >
            <Check size={18} />
            <span>{t('siphon_btn_confirm', {}, 'Sí, confirmo que dispongo de uno')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
