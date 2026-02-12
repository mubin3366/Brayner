
import React from 'react';
import { ArrowLeft, Zap, Award, Star, Trophy } from 'lucide-react';
import { getXP, getLevelInfo } from '../services/xpService';

interface XPLevelScreenProps {
  onBack: () => void;
}

const XPLevelScreen: React.FC<XPLevelScreenProps> = ({ onBack }) => {
  const xp = getXP();
  const info = getLevelInfo(xp);
  
  const progressPercent = ((xp - info.min) / (info.max - info.min)) * 100;

  const milestones = [
    { xp: 0, level: 1, name: 'Novice' },
    { xp: 200, level: 2, name: 'Disciplined' },
    { xp: 500, level: 3, name: 'Scholar' },
    { xp: 900, level: 4, name: 'Master' },
  ];

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">XP & Level</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Star className="w-20 h-20 text-indigo-50 dark:text-slate-800 absolute -top-4 -right-4 rotate-12" />
        </div>
        
        <div className="relative">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600 text-white text-4xl font-black shadow-xl shadow-indigo-200 dark:shadow-none mb-4">
            {info.level}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{info.label}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{xp} Total XP</p>
        </div>

        <div className="mt-10 space-y-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Level {info.level}</span>
            <span>{Math.round(progressPercent)}% to Level {info.level + 1}</span>
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
            Next Level at {info.max} XP
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Rank Milestones</h3>
        <div className="grid grid-cols-1 gap-3">
          {milestones.map((m) => (
            <div key={m.level} className={`p-5 rounded-2xl border flex items-center justify-between ${xp >= m.xp ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${xp >= m.xp ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {m.level === 4 ? <Trophy className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{m.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {m.level}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-400">{m.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default XPLevelScreen;
