
import React, { useState, useEffect } from 'react';
import { Zap, Timer, Target, Award, Search, BookOpen } from 'lucide-react';
import { SUBJECTS, SUBJECT_ICONS } from '../constants';
import { getProgress, scheduleRevision } from '../services/disciplineEngine';
import { analyzeWeakness } from '../services/geminiService';
import { WeakArea } from '../types';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';

const PracticeScreen: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [weakArea, setWeakArea] = useState<WeakArea | null>(getProgress().weakAreas[0] || null);

  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];

  const modes = [
    { id: 'easy', name: t.easyPractice, icon: <Award className="w-4 h-4" />, color: 'text-green-600' },
    { id: 'standard', name: t.standard, icon: <Target className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'exam', name: t.examSim, icon: <Timer className="w-4 h-4" />, color: 'text-indigo-600' },
    { id: 'quick', name: t.quick10, icon: <Zap className="w-4 h-4" />, color: 'text-amber-600' },
  ];

  const simulatePracticeSession = async (subject: string) => {
    setLoading(true);
    const summary = "Solved 15 problems. Struggled with trigonometric identities and took too long on each question.";
    const result = await analyzeWeakness(subject, summary);
    if (result) {
      setWeakArea({ subject, issue: result.weaknessType, suggestion: result.suggestion });
      scheduleRevision(subject, 'Trig Identities');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">{t.practiceLab}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.practiceSub}</p>
      </div>

      {weakArea ? (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl flex items-start gap-3 transition-colors">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border dark:border-slate-800">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400">{t.weakSuggestion}</h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">{weakArea.subject}: {weakArea.suggestion}</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed p-4 rounded-xl text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">Finish a session to get AI weakness analysis.</p>
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">{t.dueRevision}</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
          {getProgress().revisions.slice(0, 2).map((rev) => (
            <div key={rev.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.topic}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500">{rev.subject}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded">{t.reStudy}</span>
            </div>
          ))}
          {getProgress().revisions.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">No revisions scheduled yet.</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">{t.trainingMode}</h3>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                selectedMode === mode.id 
                  ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500 dark:ring-indigo-400' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className={mode.color}>{mode.icon}</span>
              <span className={`text-[13px] font-semibold ${selectedMode === mode.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                {mode.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="pb-4">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.selectSubject}</h3>
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SUBJECTS.map((subject) => (
            <button 
              key={subject.id} 
              onClick={() => simulatePracticeSession(subject.name)}
              disabled={loading}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${subject.color} dark:bg-opacity-20`}>
                {loading ? <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : SUBJECT_ICONS[subject.icon]}
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-900 dark:group-hover:text-indigo-400">{subject.name}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 uppercase tracking-tight">12 Chapters</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;
