
import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, ArrowLeft, Zap } from 'lucide-react';
import { addXP } from '../services/xpService';
import { getProgress, addStudyMinutes } from '../services/disciplineEngine';
import { sendNotification } from '../services/notificationService';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';

interface FocusScreenProps {
  onBack: () => void;
}

const FocusScreen: React.FC<FocusScreenProps> = ({ onBack }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalToday, setTotalToday] = useState(getProgress().totalMinutesToday);

  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    addXP(10);
    addStudyMinutes(25);
    setTotalToday(getProgress().totalMinutesToday);
    
    // Trigger notification
    sendNotification(
      lang === 'bn' ? 'ফোকাস সেশন শেষ!' : 'Focus Session Complete!',
      lang === 'bn' ? 'আপনার ২৫ মিনিটের সেশন শেষ হয়েছে। ভালো কাজ!' : 'Your 25-minute focus session is done. Great work!'
    );

    alert(lang === 'bn' ? "ফোকাস সেশন সম্পন্ন! +১০ XP অর্জিত।" : "Focus session complete! +10 XP earned.");
    setTimeLeft(25 * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">Focus Mode</h1>
      </div>

      <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl flex items-center justify-center mb-8">
          <Timer className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="text-7xl font-black tabular-nums text-slate-900 dark:text-slate-100 mb-8">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4 w-full max-w-xs">
          <button 
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}
          >
            {isActive ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5 fill-current" /> Start</>}
          </button>
          <button 
            onClick={resetTimer}
            className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Today's Focus Time</span>
        </div>
        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{totalToday} mins</span>
      </div>
    </div>
  );
};

export default FocusScreen;
