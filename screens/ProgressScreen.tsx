
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Zap, TrendingDown, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { Tab } from '../types';

interface ProgressScreenProps {
  onNavigate?: (tab: Tab) => void;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ onNavigate }) => {
  const user = getCurrentUser();
  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  const data = [
    { name: t.mon, mins: 45 },
    { name: t.tue, mins: 80 },
    { name: t.wed, mins: 60 },
    { name: t.thu, mins: 120 },
    { name: t.fri, mins: 90 },
    { name: t.sat, mins: 0 },
    { name: t.sun, mins: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.consistency}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.consistencySub}</p>
      </div>

      {user?.isGuest && (
        <div className="absolute inset-x-0 top-24 bottom-0 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center">
            <ShieldAlert className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
            <h3 className="font-bold text-indigo-900 dark:text-indigo-400 mb-2">{t.historyDisabled}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t.trackingAlert}</p>
            <button 
              className="bg-indigo-900 dark:bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold" 
              onClick={() => onNavigate?.('profile')}
            >
              {t.loginToTrack}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.weeklyMinutes}</h3>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-md">{t.avg} 65m</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc', className: 'dark:opacity-5' }}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
              <Bar dataKey="mins" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <TrendingDown className="w-5 h-5 text-red-500 mb-2" />
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.mistakePattern}</h4>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">Formula misuse</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Found in Math & Phy</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <Clock className="w-5 h-5 text-teal-500 mb-2" />
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.bestTime}</h4>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">8:00 AM - 10:00 AM</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{t.peakFocus}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">{t.milestones}</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {[
            { label: '3-Day Streak', icon: <Zap className="w-5 h-5" />, color: 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' },
            { label: 'Science Master', icon: <Award className="w-5 h-5" />, color: 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' },
            { label: 'Focused Soul', icon: <ShieldCheck className="w-5 h-5" />, color: 'bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400' },
            { label: 'Disciplined', icon: <Clock className="w-5 h-5" />, color: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' },
          ].map((badge, idx) => (
            <div key={idx} className="flex-shrink-0 flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${badge.color} border-4 border-white dark:border-slate-900 shadow-sm transition-colors`}>
                {badge.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-2 whitespace-nowrap uppercase tracking-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
