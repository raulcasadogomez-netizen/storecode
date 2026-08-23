import { useTranslation } from '../i18n/LanguageContext';

export default function WhatsAppFloatingButton({ onClick }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="whatsapp-floating-btn"
      onClick={onClick}
      aria-label={t('btn_contact_whatsapp', {}, 'Contactar por WhatsApp')}
      title={t('btn_contact_whatsapp', {}, 'Contactar por WhatsApp')}
      id="whatsapp-floating-btn"
    >
      <span className="whatsapp-floating-pulse"></span>
      <svg 
        className="whatsapp-floating-icon" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        width="28" 
        height="28"
      >
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.81 1.246h.005c5.507 0 9.99-4.478 9.99-9.987C22.007 6.479 17.52 2 12.012 2zm0 18.29h-.004a8.256 8.256 0 0 1-4.218-1.164l-.303-.18-3.137.822.836-3.056-.197-.314A8.253 8.253 0 0 1 3.753 12c.002-4.549 3.702-8.249 8.261-8.249 2.207.001 4.281.861 5.84 2.422a8.204 8.204 0 0 1 2.41 5.837c-.002 4.55-3.702 8.25-8.252 8.28zm4.52-6.175c-.247-.124-1.467-.723-1.693-.807-.227-.082-.393-.124-.558.124-.165.247-.639.807-.784.969-.144.165-.29.185-.536.062-.247-.124-1.04-.383-1.982-1.223-.733-.654-1.228-1.462-1.372-1.71-.144-.247-.015-.38.109-.503.111-.11.247-.29.37-.433.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.433-.062-.124-.558-1.343-.764-1.838-.2-.482-.422-.416-.578-.423l-.495-.008c-.165 0-.433.062-.66.31-.227.247-.866.845-.866 2.062 0 1.216.886 2.392.99 2.536.103.144 1.742 2.66 4.223 3.73.59.254 1.05.406 1.41.52.593.189 1.133.162 1.56.098.476-.072 1.468-.6 1.674-1.18.207-.578.207-1.074.145-1.18-.063-.103-.228-.165-.475-.29z"/>
      </svg>
      <span className="whatsapp-floating-label">{t('btn_contact_whatsapp', {}, 'WhatsApp')}</span>
    </button>
  );
}
