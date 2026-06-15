import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('svs_lang') || 'en');
  const t = translations[lang];

  const toggleLang = () => {
    const next = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    localStorage.setItem('svs_lang', next);
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
