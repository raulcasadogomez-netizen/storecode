import React from 'react';
import { ShieldAlert, AlertTriangle, X, Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function CategoryTermsModal({ isOpen, categoryId, onAccept, onDecline }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isColeccionismo = categoryId === 'coleccionismo' || categoryId?.includes('colecc');
  const isReposteria = categoryId === 'reposteria' || categoryId?.includes('repost') || categoryId?.includes('n2o') || categoryId?.includes('nitro');

  const title = isColeccionismo
    ? t('terms_coleccionismo_title', {}, 'Aviso Legal y de Responsabilidad: Coleccionismo')
    : isReposteria
    ? t('terms_reposteria_title', {}, 'Aviso Legal y de Responsabilidad: Óxido Nitroso')
    : t('terms_generic_title', {}, 'Términos de Uso y Responsabilidad');

  const message = isColeccionismo
    ? t(
        'terms_coleccionismo_text',
        {},
        'Es un producto diseñado para coleccionismo y exhibición, usted al comprar este producto nos compromete que no le va a dar un uso distinto al señalado anteriormente, ya que no es apto para el consumo humano. Además, queda totalmente prohibida la venta a menores de edad según la legislación local, en España 18 años.'
      )
    : isReposteria
    ? t(
        'terms_reposteria_text',
        {},
        'Este producto es ÚNICAMENTE para uso en repostería y gastronomía profesional, y no es apto para ningún otro uso. Usted al comprar este producto nos compromete que no le va a dar un uso distinto al señalado anteriormente.'
      )
    : t(
        'terms_generic_text',
        {},
        'Este producto requiere el compromiso de uso exclusivo según sus especificaciones técnicas y legales.'
      );

  const question = isColeccionismo
    ? t('terms_coleccionismo_question', {}, '¿Aceptas estos términos?')
    : isReposteria
    ? t('terms_reposteria_question', {}, '¿Aceptas estos términos?')
    : t('terms_generic_question', {}, '¿Aceptas estos términos?');

  return (
    <div className="category-terms-overlay" onClick={onDecline}>
      <div className="category-terms-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Close button */}
        <button className="category-terms-close" onClick={onDecline} title={t('btn_cancel', {}, 'Cancelar')}>
          <X size={20} />
        </button>

        {/* Warning Icon Badge */}
        <div className="category-terms-icon-wrapper">
          <div className="category-terms-icon-glow"></div>
          <div className="category-terms-icon-badge">
            <ShieldAlert size={36} className="text-neon-pink" />
          </div>
        </div>

        {/* Tag & Title */}
        <div className="category-terms-header">
          <span className="category-terms-tag">
            <AlertTriangle size={14} />
            {isColeccionismo ? 'COLECCIONISMO & EXHIBICIÓN' : isReposteria ? 'USO EXCLUSIVO REPOSTERÍA' : 'CONDICIONES DE USO'}
          </span>
          <h2 className="category-terms-title">{title}</h2>
        </div>

        {/* Disclaimer Message Box */}
        <div className="category-terms-body">
          <div className="category-terms-statement">
            <p className="category-terms-quote">
              "{message}"
            </p>
          </div>

          <div className="category-terms-question-box">
            <p className="category-terms-question">{question}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="category-terms-actions">
          <button 
            type="button" 
            className="btn-terms-decline" 
            onClick={onDecline}
          >
            <ArrowLeft size={16} />
            <span>{t('terms_btn_decline', {}, 'No acepto')}</span>
          </button>
          
          <button 
            type="button" 
            className="btn-terms-accept" 
            onClick={onAccept}
            autoFocus
          >
            <Check size={18} />
            <span>{t('terms_btn_accept', {}, 'Sí, acepto los términos')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
