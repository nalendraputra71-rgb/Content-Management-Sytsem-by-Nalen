import { create } from 'zustand';

type Lang = 'id' | 'en';

interface I18nStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18n = create<I18nStore>((set) => ({
  lang: (localStorage.getItem('hubify_locale') as Lang) || 'id',
  setLang: (lang: Lang) => {
    localStorage.setItem('hubify_locale', lang);
    set({ lang });
  }
}));
