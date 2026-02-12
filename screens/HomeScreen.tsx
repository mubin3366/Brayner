
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  PenTool, 
  CheckCircle, 
  Menu, 
  X, 
  Target, 
  Library, 
  Zap, 
  FileText, 
  Settings as SettingsIcon,
  ChevronRight,
  GraduationCap,
  Award,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SUBJECTS, SUBJECT_ICONS } from '../constants';
import { getProgress, completeTask, addStudyMinutes, advanceDay, getDisciplineLevel, startProgram } from '../services/disciplineEngine';
import { UserProgress, Tab, DayPlan } from '../types';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';
import { sendNotification } from '../services/notificationService';
import { getState } from '../services/localEngine';

const TASK_ICON_MAP: Record<string, any> = {
  Target: Target,
  Zap: Zap,
  PenTool: PenTool,
  Award: Award,
  ShieldAlert: ShieldAlert
};

interface HomeScreenProps {
  setActiveTab: (tab: Tab) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab }) => {
  const os = getState();
  const [progress, setProgress] = useState<UserProgress>(getProgress());
  const [isStudying, setIsStudying] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  useEffect(() => {
    let interval: number;
    if (isStudying) {
      interval = window.setInterval(() => {
        setStudyTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const handleStartSession = () => {
    if (isStudying) {
      const mins = Math.ceil(studyTime / 60);
      addStudyMinutes(mins);
      setIsStudying(false);
      setStudyTime(0);
      setProgress(getProgress());
    } else {
      setIsStudying(true);
    }
  };

  const toggleTask = (id: string) => {
    completeTask(id);
    setProgress(getProgress());
  };

  const handleAdvanceDay = () => {
    advanceDay();
    const updatedProgress = getProgress();
    setProgress(updatedProgress);
    
    sendNotification(
      lang === 'bn' ? 'দিনের কাজ সম্পন্ন!' : 'Day Completed!',
      lang === 'bn' ? `অভিনন্দন! আপনি ${progress.currentDay} দিন শেষ করেছেন।` : `Congratulations! You have completed Day ${progress.currentDay}.`
    );
  };

  const tasks = progress.dailyTasks || [];
  const allTasksDone = tasks.length > 0 && tasks.every(task => progress.completedTasks.includes(task.id));
  const disciplineLevel = getDisciplineLevel();

  const drawerMenu: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'coach', label: t.coachTitle, icon: <GraduationCap className="w-5 h-5" />, color: 'text-indigo-900' },
    { id: 'focus', label: t.focusLabel, icon: <Target className="w-5 h-5" />, color: 'text-indigo-600' },
    { id: 'vault', label: t.vaultLabel, icon: <Library className="w-5 h-5" />, color: 'text-blue-600' },
    { id: 'xp', label: t.xpLabel, icon: <Zap className="w-5 h-5" />, color: 'text-amber-600' },
    { id: 'report', label: t.reportLabel, icon: <FileText className="w-5 h-5" />, color: 'text-teal-600' },
    { id: 'settings', label: t.settings, icon: <SettingsIcon className="w-5 h-5" />, color: 'text-slate-600' },
  ];

  const handleMenuClick = (tabId: Tab) => {
    setIsDrawerOpen(false);
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Side Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-300"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-72 h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300 ease-out flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-indigo-900 dark:text-indigo-400 tracking-tighter uppercase">{t.appName}</h2>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2">
              {drawerMenu.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.98] group ${item.id === 'coach' ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} transition-transform group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm font-bold ${item.id === 'coach' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-indigo-50 dark:bg-slate-800/50 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">{t.currentJourney}</p>
                <p className="text-sm font-bold text-indigo-900 dark:text-slate-200">{t.dayCountLabel.replace('{{day}}', progress.currentDay.toString())}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-90"
          >
            <Menu className="w-7 h-7 text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* BRAYNER Logo - Centered and Enlarged */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter uppercase leading-none">{t.appName}</h1>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 leading-none mb-1.5">
            <span className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              {progress.streak}
            </span>
            <span className="text-xl md:text-2xl">🔥</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
            {t.streak}
          </span>
        </div>
      </div>

      {progress.isRecoveryMode && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-300 uppercase tracking-tight">Recovery Mode Active</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">You missed a session. Complete today's special discipline tasks to recover your streak.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-indigo-950 dark:text-indigo-400 uppercase tracking-tighter">{t.todayTask}</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-0.5">{t.protocolDayLabel.replace('{{day}}', progress.currentDay.toString())}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-full">
                  {isStudying ? `${t.active}: ${Math.floor(studyTime / 60)}m` : `${t.est} ${os.user.current?.assessment?.studyGoal || 0}h`}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {progress.planStarted && tasks.map((task) => {
                const Icon = TASK_ICON_MAP[task.iconType] || Target;
                const isCompleted = progress.completedTasks.includes(task.id);
                return (
                  <button 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-4 w-full text-left p-4 rounded-2xl transition-all border active:scale-[0.98] ${
                      isCompleted 
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-60' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-[13px] md:text-sm font-bold ${isCompleted ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                        {task.title}
                      </span>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-0.5">{task.category}</p>
                    </div>
                  </button>
                );
              })}
              {!progress.planStarted && (
                <div className="p-10 text-center opacity-40">
                   <PenTool className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">{t.tasksHidden}</p>
                </div>
              )}
            </div>
            
            {progress.planStarted && (
              allTasksDone ? (
                <button 
                  onClick={handleAdvanceDay}
                  className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-teal-100 dark:shadow-none uppercase tracking-widest text-xs"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t.completeDayAction.replace('{{day}}', progress.currentDay.toString())}
                </button>
              ) : (
                <button 
                  onClick={handleStartSession}
                  className={`w-full ${isStudying ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40' : 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-xl shadow-indigo-100'} py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all uppercase tracking-widest text-xs`}
                >
                  {isStudying ? <div className="w-4 h-4 bg-red-600 dark:bg-red-400 rounded-sm animate-pulse"></div> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isStudying ? t.finishSession : t.startSession}</span>
                </button>
              )
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">{t.quickPractice}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SUBJECTS.slice(0, 4).map((subject) => (
                <button key={subject.id} onClick={() => setActiveTab('practice')} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 transition-all active:scale-[0.95] group">
                  <div className={`p-3 rounded-xl ${subject.color} dark:bg-opacity-10 transition-transform`}>
                    {SUBJECT_ICONS[subject.icon]}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">{subject.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">{t.disciplineStats}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none block">{progress.streak}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{t.streak}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none block truncate">{progress.weakAreas[0]?.subject || 'None'}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{t.weakArea}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 transition-all shadow-sm">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 dark:border-slate-800"></div>
                <div className={`absolute inset-0 rounded-full border-[3px] border-indigo-600 transition-all duration-700`} 
                      style={{ clipPath: `inset(0 0 ${tasks.length > 0 ? (100 - (progress.completedTasks.length / tasks.length) * 100) : 100}% 0)` }}></div>
                <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 leading-none">
                  {tasks.length > 0 ? Math.round((progress.completedTasks.length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none block">{disciplineLevel}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">Discipline Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
