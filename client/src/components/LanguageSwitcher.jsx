import { useState } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === lang);

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        🌐 {current?.native} ▾
      </button>
      {open && (
        <div style={{
          position: 'absolute', insetInlineEnd: 0, top: 46, width: 210, zIndex: 50,
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14,
          padding: 7, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
          boxShadow: 'var(--shadow)'
        }}>
          {languages.map((l) => (
            <button key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={l.code === lang ? 'chip active' : 'chip'}
              style={{ borderRadius: 9, padding: '9px 11px', fontSize: 13.5 }}>
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
