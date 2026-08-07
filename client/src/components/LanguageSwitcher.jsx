import { useState } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === lang);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{current?.flag}</span>
        <span>{current?.native}</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', insetInlineEnd: 0, top: 46, width: 230, zIndex: 50,
            background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)',
            borderRadius: 14, padding: 8,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5,
            boxShadow: '0 20px 50px oklch(0 0 0 / 0.6)',
          }}>
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 9, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                  border: l.code === lang ? '1.5px solid transparent' : '1.5px solid var(--line)',
                  background: l.code === lang
                    ? 'linear-gradient(oklch(0.18 0.02 265),oklch(0.18 0.02 265)) padding-box, linear-gradient(135deg,var(--accent),var(--accent-2)) border-box'
                    : 'oklch(0.11 0.012 265)',
                  color: 'var(--text)',
                  transition: 'all 0.15s',
                  textAlign: l.dir === 'rtl' ? 'right' : 'left',
                  direction: l.dir,
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{l.flag}</span>
                <span>{l.native}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
