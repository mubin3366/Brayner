
import React, { useState } from 'react';
import { CheckCircle2, Lock, ChevronRight, ShieldAlert, Sparkles, AlertCircle, Zap } from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { getProgress, startProgram } from '../services/disciplineEngine';
import { Tab } from '../types';
import { getState } from '../services/localEngine';

interface PlanScreenProps {
  onNavigate?: (tab: Tab) => void;
}

const PlanScreen: React.FC<PlanScreenProps> = ({ onNavigate }) => {
  const os = getState();
  const [progress, setProgress] = useState(getProgress());
  const user = getCurrentUser();
  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  const handleStartProgram = () => {
    const next = startProgram();
    setProgress(next);
  };

  // Logic: Progression depends on currentUnlockedDay (progress.currentDay)
  // Rule: If planStarted is true, currentUnlockedDay must be at least 1.
  const currentUnlockedDay = progress.planStarted ? (progress.currentDay || 1) : 0;
  const plans = os.plan.personalizedPlans.length > 0 ? os.plan.personalizedPlans : [];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500 relative pb-10">
      <div className="px-1 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.journey}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.journeySub}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">AI Personalized</span>
        </div>
      </div>

      {/* Start Button inside Plan page if not started */}
      {!progress.planStarted && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-indigo-100 dark:border-indigo-900/30 text-center space-y-6 mb-8 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-100 dark:shadow-none">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-400 uppercase tracking-tighter">{t.startProgramTitle}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">{t.startProgramDesc}</p>
          </div>
          <button 
            onClick={handleStartProgram}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-xs"
          >
            {t.startProtocolBtn}
            <Sparkles className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {plans.map((plan) => {
          // Unlock Rules:
          // 1. If dayNumber < currentUnlockedDay -> show completed/missed
          // 2. If dayNumber === currentUnlockedDay -> show active/unlocked
          // 3. If dayNumber > currentUnlockedDay -> keep locked
          
          const isCurrent = progress.planStarted && plan.day === currentUnlockedDay;
          const isPast = progress.planStarted && plan.day < currentUnlockedDay;
          const isLocked = !progress.planStarted || plan.day > currentUnlockedDay;
          
          const isCompleted = isPast && (progress.completedDays || []).includes(plan.day);
          const isMissed = isPast && (progress.missedDays || []).includes(plan.day);

          return (
            <div key={plan.day} className="relative pl-8">
              {plan.day !== plans.length && (
                <div className={`absolute left-3 top-6 bottom-[-16px] w-[2px] ${isPast ? 'bg-indigo-200 dark:bg-indigo-950/40' : 'bg-slate-200 dark:border-slate-800 border-l'}`}></div>
              )}
              
              <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                isCompleted ? 'bg-indigo-600' : 
                isMissed ? 'bg-red-500' :
                isCurrent ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600' : 
                'bg-slate-100 dark:bg-slate-800'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : 
                 isMissed ? <AlertCircle className="w-4 h-4 text-white" /> :
                 isCurrent ? <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div> :
                 <Lock className="w-3 h-3 text-slate-400 dark:text-slate-600" />}
              </div>

              <div className={`p-4 rounded-xl border transition-all ${
                isCurrent ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800 shadow-md ring-1 ring-indigo-50 dark:ring-indigo-900/20' : 
                isPast ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-80' :
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
                  }`}>{t.day} {plan.day} - {plan.subject}</span>
                  {isCurrent && <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{t.current}</span>}
                  {isMissed && <span className="text-[9px] bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Missed</span>}
                </div>
                
                <h3 className={`font-semibold text-sm ${isLocked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {plan.focusConcept}
                </h3>
                
                {!isLocked && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{t.practice}:</span> {plan.practiceTask}
                    </p>
                    {isCurrent && (
                      <div className="bg-teal-50/50 dark:bg-teal-950/20 p-2.5 rounded-lg border border-teal-100/50 dark:border-teal-900/30">
                        <p className="text-[11px] text-teal-800 dark:text-teal-400 italic font-medium leading-relaxed">
                          "{plan.disciplineChallenge}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanScreen;
