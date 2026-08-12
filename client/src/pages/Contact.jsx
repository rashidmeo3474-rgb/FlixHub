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

      <div className="grid grid-2 contact-grid" style={{ marginTop: 26 }}>
        <a className="card card-hover stack" href={waLink} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
          <span style={{ fontSize: 30 }}>💬</span>
          <strong style={{ fontSize: 17 }}>WhatsApp</strong>
          <span className="muted">{WHATSAPP}</span>
          <span style={{ color: 'var(--good)', fontSize: 13, fontWeight: 700 }}>{t('heroBadge')}</span>
        </a>
        <div className="card stack">
          <span style={{ fontSize: 30 }}>✉️</span>
          <strong style={{ fontSize: 17 }}>Email</strong>
          <span className="muted">support@{SITE.toLowerCase()}.pk</span>
          <span className="muted" style={{ fontSize: 13 }}>{t('warranty')}</span>
        </div>
      </div>
    </section>
  );
}
