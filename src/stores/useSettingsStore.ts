import { create } from 'zustand';
import { StoreSettings } from '../types';
import { initialStoreSettings } from '../data/initialData';
import { sound } from '../utils/audio';

interface SettingsState {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'en' | 'th') => void;
  toggleAudio: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'northline_pos_settings';

const loadSavedSettings = (): StoreSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...initialStoreSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
  }
  return initialStoreSettings;
};

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const initial = loadSavedSettings();
applyTheme(initial.theme);
sound.setEnabled(initial.enableAudio);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: initial,
  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
    if (newSettings.enableAudio !== undefined) {
      sound.setEnabled(newSettings.enableAudio);
    }
    set({ settings: updated });
  },
  setTheme: (theme) => {
    get().updateSettings({ theme });
  },
  setLanguage: (language) => {
    get().updateSettings({ language });
  },
  toggleAudio: () => {
    const current = get().settings.enableAudio;
    get().updateSettings({ enableAudio: !current });
  },
  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY);
    applyTheme(initialStoreSettings.theme);
    sound.setEnabled(initialStoreSettings.enableAudio);
    set({ settings: initialStoreSettings });
  }
}));
