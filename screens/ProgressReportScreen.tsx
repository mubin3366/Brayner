
import React from 'react';
import { ArrowLeft, TrendingUp, Zap, Clock, PieChart, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getProgress } from '../services/disciplineEngine';
import { getXP } from '../services/xpService';

interface ProgressReportScreenProps {
  onBack: () => void;
}

const ProgressReportScreen: React.FC<ProgressReportScreenProps> = ({ onBack }) => {
  const progress = getProgress();
  const xp = getXP();
  
  const stats = [
    { label: 'Study Time Today', value: `${progress.totalMinutesToday}m`, icon: <Clock className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total XP Earned', value: xp, icon: <Zap className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Current Streak', value: `${progress.streak} Days`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Missed Days', value: (progress.missedDays || []).length, icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">Progress Report</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color} dark:bg-opacity-10`}>
              {stat.icon}
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block">{stat.value}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Consistency Summary</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
            <span>Overall Discipline Level</span>
            <span className="text-indigo-600 dark:text-indigo-400">High</span>
          </div>
          <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-indigo-600" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            "You have completed {progress.completedDays?.length || 0} out of 30 plan days. {(progress.missedDays || []).length > 0 ? `You missed ${(progress.missedDays || []).length} calendar days. Reset your focus and maintain your streak.` : 'You are maintaining perfect discipline. Keep it up!'}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressReportScreen;
