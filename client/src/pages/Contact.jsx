import { useI18n } from '../context/I18nContext.jsx';

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '+923001234567';
const SITE = import.meta.env.VITE_SITE_NAME || 'PrimeVault';

export default function Contact() {
  const { t } = useI18n();
  const waLink = `https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`;

  return (
    <section className="wrap-sm section">
      <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{t('contact')}</h1>
      <p className="muted" style={{ marginTop: 10, fontSize: 16 }}>{t('heroSub')}</p>

      <div className="contact-grid" style={{ marginTop: 32 }}>
        <a 
          className="card card-hover stack" 
          href={waLink} 
          target="_blank" 
          rel="noreferrer" 
          style={{ 
            color: 'inherit',
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 36, marginBottom: 8 }}>💬</span>
          <strong style={{ fontSize: 18, marginBottom: 8 }}>WhatsApp</strong>
          <span className="muted" style={{ marginBottom: 12 }}>{WHATSAPP}</span>
          <span style={{ 
            color: 'var(--good)', 
            fontSize: 13, 
            fontWeight: 700,
            background: 'rgba(34, 197, 94, 0.1)',
            padding: '4px 8px',
            borderRadius: '6px',
            alignSelf: 'center',
          }}>
            {t('heroBadge')}
          </span>
        </a>
        
        <div className="card stack" style={{ 
          padding: '28px 24px',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 36, marginBottom: 8 }}>✉️</span>
          <strong style={{ fontSize: 18, marginBottom: 8 }}>Email</strong>
          <span className="muted" style={{ marginBottom: 12 }}>support@{SITE.toLowerCase()}.pk</span>
          <span className="muted" style={{ fontSize: 13 }}>{t('warranty')}</span>
        </div>
      </div>
    </section>
  );
}
