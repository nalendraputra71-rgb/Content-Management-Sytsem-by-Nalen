import { create } from 'zustand';

type Lang = 'id' | 'en';

interface I18nStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18n = create<I18nStore>((set) => {
  const explicitLang = localStorage.getItem('hubify_locale_explicit') as Lang;
  const initialLang = explicitLang || 'en';
  
  return {
    lang: initialLang,
    setLang: (lang: Lang) => {
      localStorage.setItem('hubify_locale', lang);
      localStorage.setItem('hubify_locale_explicit', lang);
      set({ lang });
    }
  };
});
