
import React from 'react';
import { Tab } from '../types';
import { Home, ClipboardList, Calendar, BarChart2, User, PenTool } from 'lucide-react';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { getDisciplineLevel } from '../services/disciplineEngine';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];
  const disciplineLevel = getDisciplineLevel();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: 'practice', label: t.practice, icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'plan', label: t.plan, icon: <Calendar className="w-5 h-5" /> },
    { id: 'progress', label: t.progress, icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'profile', label: t.profile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Side Navigation for Tablet & Desktop */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter uppercase">
            {t.appName}
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-bold transition-all text-sm uppercase tracking-wide active:scale-[0.98] ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-indigo-50 dark:bg-slate-800 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 dark:text-slate-500 mb-1">Status</p>
            <p className="text-sm font-bold text-indigo-900 dark:text-slate-200">Discipline Level: {disciplineLevel}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 relative min-w-0 h-full overflow-hidden">
        <main className="h-full w-full max-w-4xl mx-auto px-5 py-8 md:px-10 md:py-12">
          {children}
        </main>
      </div>

      {/* Fixed Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-20 z-50">
        <div className="flex h-full justify-around items-center px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all active:scale-90 ${
                activeTab === tab.id 
                  ? 'text-indigo-700 dark:text-indigo-400' 
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-0.5 transition-colors ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tight ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
