
import React, { useState } from 'react';
import { 
  ChevronLeft, Moon, Sun, Monitor, Globe, Bell, 
  Volume2, Trash2, RotateCcw, Check
} from 'lucide-react';
import { AppSettings, Language, ThemeMode } from '../types';
import { getSettings, saveSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { requestNotificationPermission, triggerTestNotification } from '../services/notificationService';
import { resetState } from '../services/localEngine';

interface SettingsScreenProps {
  onBack: () => void;
  onLanguageChange: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLanguageChange }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
    if (updates.language) onLanguageChange();
  };

  const toggleNotification = async (key: keyof AppSettings['notifications']) => {
    const newValue = !settings.notifications[key];
    
    if (newValue) {
      const permission = await requestNotificationPermission();
      if (permission === 'denied') {
        alert(lang === 'bn' ? "নোটিফিকেশন অনুমতি প্রত্যাখ্যান করা হয়েছে।" : "Notification permission denied.");
        return;
      } else if (permission === 'unsupported') {
        alert(lang === 'bn' ? "আপনার ব্রাউজার নোটিফিকেশন সমর্থন করে না।" : "Your browser does not support notifications.");
        return;
      } else if (permission === 'granted') {
        triggerTestNotification();
      }
    }

    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: newValue
      }
    });
  };

  const handleReset = () => {
    resetState();
    onLanguageChange();
    setShowConfirmReset(false);
    alert(lang === 'bn' ? "অগ্রগতি রিসেট করা হয়েছে।" : "Progress has been reset.");
  };

  const handleClearCache = () => {
    const confirmClear = confirm(lang === 'bn' ? "আপনি কি নিশ্চিত যে আপনি সব ডেটা মুছতে চান?" : "Are you sure you want to clear all app data?");
    if (confirmClear) {
      localStorage.clear();
      resetState();
      onLanguageChange();
      alert(lang === 'bn' ? "ক্যাশে ক্লিয়ার করা হয়েছে।" : "Cache cleared successfully.");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500 pb-10">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.settings}</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Monitor className="w-3 h-3" /> {t.theme}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => updateSettings({ theme: mode })}
              className={`py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                settings.theme === mode 
                  ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 ring-1 ring-indigo-600 dark:ring-indigo-400' 
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600'
              }`}
            >
              {mode === 'light' && <Sun className="w-4 h-4" />}
              {mode === 'dark' && <Moon className="w-4 h-4" />}
              {mode === 'system' && <Monitor className="w-4 h-4" />}
              <span className="text-[10px] font-bold uppercase">{t[mode as keyof typeof t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Globe className="w-3 h-3" /> {t.language}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(['en', 'bn'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => updateSettings({ language: l })}
              className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                settings.language === l 
                  ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300' 
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600'
              }`}
            >
              <span className="text-sm font-bold">{l === 'en' ? 'English' : 'বাংলা'}</span>
              {settings.language === l && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Bell className="w-3 h-3" /> {t.notifications}
          </h3>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {(['dailyReminder', 'comebackReminder', 'revisionReminder'] as const).map((key) => (
            <div key={key} className="flex items-center justify-between p-5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t[key as keyof typeof t]}</span>
              <button 
                onClick={() => toggleNotification(key)}
                className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications[key] ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-300 rounded-full transition-all ${settings.notifications[key] ? 'left-5' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{t.dataControls}</h3>
        
        <button 
          onClick={handleClearCache}
          className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-sm active:bg-slate-50 dark:active:bg-slate-800 transition-colors shadow-sm"
        >
          <Trash2 className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          {t.clearCache}
        </button>

        <button 
          onClick={() => setShowConfirmReset(true)}
          className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-red-600 dark:text-red-400 font-bold text-sm active:bg-red-50 dark:active:bg-red-950/20 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-red-400 dark:text-red-500" />
          {t.resetProgress}
        </button>
      </div>

      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 w-full rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <RotateCcw className="w-10 h-10 text-red-600 dark:text-red-500 mb-4 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2">{t.resetProgress}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{t.confirmReset}</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowConfirmReset(false)}
                className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-sm"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleReset}
                className="py-3 bg-red-600 dark:bg-red-500 text-white font-bold rounded-xl text-sm"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
