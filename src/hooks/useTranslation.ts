import { useSettingsStore } from '../stores/useSettingsStore';
import { en } from '../locales/en';
import { th } from '../locales/th';

type Translations = typeof en;

const dictionaries: Record<string, Translations> = { en, th };

export const useTranslation = () => {
  const { settings } = useSettingsStore();
  const lang = settings.language || 'en';
  const dict = dictionaries[lang] || dictionaries.en;

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dict;
    
    for (const k of keys) {
      if (value === undefined || value === null) return key;
      value = value[k as keyof typeof value];
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language: lang };
};
