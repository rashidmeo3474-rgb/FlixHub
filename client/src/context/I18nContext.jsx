import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS, LANGUAGES } from '../i18n/strings.js';

const I18nContext = createContext(null);
export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('pv_lang') || 'en');
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || 'ltr';

  useEffect(() => {
    localStorage.setItem('pv_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo(() => ({
    lang, setLang, dir, languages: LANGUAGES,
    t: (key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
  }), [lang, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
