
import { AppSettings, Language } from '../types';
import { getState, updateState } from './localEngine';

export const getSettings = (): AppSettings => {
  return getState().preferences;
};

export const saveSettings = (settings: AppSettings) => {
  updateState({ preferences: settings });
  applyTheme(settings.theme);
};

export const applyTheme = (theme: AppSettings['theme']) => {
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getEffectiveLanguage = (lang: Language): 'en' | 'bn' => {
  // Priority: User Setting -> Bangla (Default)
  if (lang === 'bn') return 'bn';
  if (lang === 'en') return 'en';
  
  // Default for BRAYNER is always Bangla
  return 'bn';
};
