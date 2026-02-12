
import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, LogOut, ChevronRight, User, BookOpen, ArrowLeft, Trash2, ShieldAlert, RotateCcw } from 'lucide-react';
import { DisciplineMode, Tab } from '../types';
import { getState, updateState, resetState } from '../services/localEngine';
import { getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { getLevelInfo } from '../services/xpService';

interface ProfileScreenProps {
  onLogout: () => void;
  onSettingsChange: () => void;
  onNavigate: (tab: Tab) => void;
}

type ProfileView = 'profile' | 'personal' | 'resources' | 'security';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, onSettingsChange, onNavigate }) => {
  // Always fetch fresh state on render
  const os = getState();
  const [view, setView] = useState<ProfileView>('profile');
  const lang = getEffectiveLanguage(os.preferences.language);
  const t = translations[lang];

  const handleFullReset = () => {
    resetState();
    onSettingsChange();
    setView('profile');
    alert(lang === 'bn' ? 'সব ডেটা রিসেট করা হয়েছে।' : 'All data has been reset.');
  };

  const handleAddResource = (res: any) => {
    const updatedResources = [...os.vault.resources, { ...res, id: Date.now().toString() }];
    updateState({ vault: { ...os.vault, resources: updatedResources } });
    // Trigger re-render in App.tsx
    onSettingsChange();
  };

  const handleDeleteResource = (id: string) => {
    const updatedResources = os.vault.resources.filter(r => r.id !== id);
    updateState({ vault: { ...os.vault, resources: updatedResources } });
    // Trigger re-render in App.tsx
    onSettingsChange();
  };

  if (view === 'personal') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
        <div className="flex items-center gap-4 px-1">
          <button onClick={() => setView('profile')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.personalInfo}</h1>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
            <input 
              // Fix: os.user is AuthUser, removing .current access
              defaultValue={os.user?.name || ''}
              onBlur={e => {
                if (os.user) {
                  // Fix: Update user directly without .current property
                  updateState({ user: { ...os.user, name: e.target.value } });
                  onSettingsChange();
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none dark:text-slate-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Daily Goal (Hours)</label>
            <input 
              type="number"
              // Fix: Direct access to os.user assessment
              defaultValue={os.user?.assessment?.studyGoal || 4}
              onBlur={e => {
                if (os.user?.assessment) {
                  // Fix: Proper nested object update for AuthUser assessment property
                  updateState({ 
                    user: { 
                      ...os.user, 
                      assessment: { ...os.user.assessment, studyGoal: parseInt(e.target.value) || 4 } 
                    } 
                  });
                  onSettingsChange();
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none dark:text-slate-200"
            />
          </div>
          <button onClick={() => setView('profile')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">Done</button>
        </div>
      </div>
    );
  }

  if (view === 'resources') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
        <div className="flex items-center gap-4 px-1">
          <button onClick={() => setView('profile')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.studyResources}</h1>
        </div>
        <div className="space-y-3">
          {os.vault.resources.map(res => (
            <div key={res.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{res.title}</h4>
                <p className="text-xs text-indigo-500 truncate">{res.link}</p>
              </div>
              <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => {
            const title = prompt('Title:');
            const link = prompt('Link:');
            if (title && link) handleAddResource({ title, link });
          }} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm font-bold">+ Add Resource</button>
        </div>
      </div>
    );
  }

  if (view === 'security') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
        <div className="flex items-center gap-4 px-1">
          <button onClick={() => setView('profile')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.securityPrivacy}</h1>
        </div>
        <div className="space-y-3">
          <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/40 space-y-4">
             <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
               <ShieldAlert className="w-5 h-5" />
               <h3 className="font-bold text-sm">Destructive Actions</h3>
             </div>
             <button onClick={handleFullReset} className="w-full p-4 bg-white dark:bg-slate-900 text-red-600 rounded-xl font-bold text-sm border border-red-200 flex items-center justify-between shadow-sm">
              Reset All Progress <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profileItems = [
    { id: 'personal' as ProfileView, label: t.personalInfo, icon: <User className="w-5 h-5" /> },
    { id: 'resources' as ProfileView, label: t.studyResources, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'security' as ProfileView, label: t.securityPrivacy, icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-left-10 duration-500 pb-10">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.profile}</h1>
        <button 
          onClick={() => onNavigate('settings')} 
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all active:scale-90"
        >
          <SettingsIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden border-2 border-indigo-100">
          {/* Fix: Direct access to os.user.name */}
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${os.user?.name || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          {/* Fix: Direct access to user metadata */}
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{os.user?.name || 'New Learner'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{os.user?.academicLevel} • Level {getLevelInfo(os.stats.xp).level}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
        {profileItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
              {item.icon} <span className="text-sm font-semibold">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout} 
        className="w-full py-4 text-red-500 font-bold text-sm flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/40 active:scale-[0.98] transition-all"
      >
        <LogOut className="w-4 h-4" /> {t.logout}
      </button>

      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stable Architecture v1.0.2</p>
      </div>
    </div>
  );
};

export default ProfileScreen;
