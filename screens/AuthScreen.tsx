
import React, { useState } from 'react';
import { ChevronRight, PenTool, User, UserPlus, Zap, ArrowLeft, CheckCircle2, Sparkles, GraduationCap, Mail, Lock } from 'lucide-react';
import { login, signup } from '../services/authService';
// Fix: Import Language type for correct casting in finalState object
import { AssessmentData, Language } from '../types';
import { SUBJECTS } from '../constants';
import { generateComebackPlan, getDisciplineMode } from '../services/onboardingService';
import { getState, saveState, DEFAULT_STATE } from '../services/localEngine';
import { getSettings, getEffectiveLanguage } from '../services/settingsService';
import { translations } from '../locales/translations';

interface AuthScreenProps {
  onAuthComplete: () => void;
}

type AuthView = 'entry' | 'login' | 'assessment' | 'generating';

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthComplete }) => {
  const [view, setView] = useState<AuthView>('entry');
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const settings = getSettings();
  const lang = getEffectiveLanguage(settings.language);
  const t = translations[lang];
  
  const [assessment, setAssessment] = useState<AssessmentData>({
    academicLevel: 'SSC',
    targetExam: '',
    weakSubjects: [],
    studyGoal: 4,
    primaryProblem: 'focus',
    primaryGoal: 'comeback'
  });

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => {
    if (step === 1) setView('entry');
    else setStep(s => s - 1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) return setError(t.emailReq);
    
    try {
      const user = await login(email, password);
      if (user) {
        onAuthComplete();
      } else {
        setError(t.loginError);
      }
    } catch (err) {
      setError(t.loginError);
    }
  };

  const finalizeOnboarding = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(t.fieldsReq);
      return;
    }
    
    setError('');
    
    try {
      const newUser = await signup({
        name: name,
        email: email,
        password: password,
        academicLevel: assessment.academicLevel
      });

      setView('generating');
      
      setTimeout(async () => {
        const plans = generateComebackPlan(assessment);
        const disciplineMode = getDisciplineMode(assessment.primaryProblem);
        const currentState = getState(); // Get state containing registered users

        const finalState = {
          ...currentState, // Keep registered users
          user: {
            ...newUser,
            assessment: assessment
          },
          plan: {
            ...DEFAULT_STATE.plan,
            personalizedPlans: plans,
            planStarted: false,
            planStartDate: '',
            currentUnlockedDay: 1
          },
          stats: {
            ...DEFAULT_STATE.stats,
            weakAreas: assessment.weakSubjects.map(s => ({
              subject: s,
              issue: 'Concept confusion',
              suggestion: `${s} এর মূল বিষয়ের দিকে মনোযোগ দিন।`
            }))
          },
          preferences: {
            ...DEFAULT_STATE.preferences,
            // Fix: Cast 'bn' to Language type to avoid inference as string
            language: 'bn' as Language,
            disciplineMode: disciplineMode
          }
        };

        saveState(finalState);
        onAuthComplete();
      }, 2800);
      
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        setError(t.emailExistsError);
      } else {
        setError(t.regError);
      }
    }
  };

  const toggleSubject = (subject: string) => {
    setAssessment(prev => ({
      ...prev,
      weakSubjects: prev.weakSubjects.includes(subject)
        ? prev.weakSubjects.filter(s => s !== subject)
        : [...prev.weakSubjects, subject]
    }));
  };

  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-indigo-950 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-indigo-950 dark:text-indigo-400 uppercase tracking-tighter">{t.coachTitle}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 mb-10">{t.analyzingPlan}</p>
        <div className="w-full max-w-xs space-y-4">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 animate-[loading_2.8s_ease-in-out]" />
          </div>
          <p className="text-xs text-slate-500 italic font-medium">"Excellence is not an act, but a habit. We are what we repeatedly do."</p>
        </div>
        <style>{`@keyframes loading { 0% { width: 0% } 100% { width: 100% } }`}</style>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setView('entry')} className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest"><ArrowLeft className="w-4 h-4" /> {t.back}</button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-indigo-950 dark:text-indigo-400 uppercase tracking-tighter">{t.welcomeBack}</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{t.resumeStreak}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold outline-none focus:border-indigo-600 dark:text-slate-200"
                    placeholder="name@email.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold outline-none focus:border-indigo-600 dark:text-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">{error}</p>}
            <button type="submit" className="w-full bg-indigo-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">{t.signIn}</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'entry') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in duration-700">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-100 dark:shadow-none">
              <PenTool className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter uppercase">{t.appName}</h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">{t.protocolTitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setView('assessment')}
              className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-xs"
            >
              {t.startComeback}
              <Zap className="w-5 h-5 fill-current text-amber-300" />
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setView('login')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-4 rounded-2xl text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 active:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" /> {t.login}
              </button>
              <button 
                onClick={() => setView('assessment')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-4 rounded-2xl text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 active:bg-slate-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> {t.register}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
            {t.freshStartDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-start pt-12 md:pt-20">
      <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right-4 duration-500">
        <div className="flex justify-between items-center px-1">
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-4 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
            ))}
          </div>
          <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">{t.phase} {step}/7</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <button onClick={handlePrevStep} className="p-2 -ml-2 text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.stepOf}</span>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.academicLevelQ}</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['SSC', 'HSC'] as const).map(l => (
                <button 
                  key={l}
                  onClick={() => { setAssessment({...assessment, academicLevel: l}); handleNextStep(); }}
                  className={`p-10 rounded-3xl border-2 font-black transition-all text-2xl ${assessment.academicLevel === l ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.weakSubjectsQ}</h3>
            <div className="grid grid-cols-2 gap-2 max-h-[22rem] overflow-y-auto pr-1 hide-scrollbar">
              {SUBJECTS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => toggleSubject(s.name)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all group ${assessment.weakSubjects.includes(s.name) ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${assessment.weakSubjects.includes(s.name) ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${assessment.weakSubjects.includes(s.name) ? 'text-white opacity-100' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                  <span className={`text-[13px] font-bold uppercase tracking-tight ${assessment.weakSubjects.includes(s.name) ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500'}`}>{s.name}</span>
                </button>
              ))}
            </div>
            <button onClick={handleNextStep} className="w-full bg-indigo-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs mt-4">{t.continue}</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.commitmentQ}</h3>
            <div className="space-y-3">
              {[4, 6, 8, 10, 12].map(h => (
                <button 
                  key={h}
                  onClick={() => { setAssessment({...assessment, studyGoal: h}); handleNextStep(); }}
                  className={`w-full p-5 rounded-2xl border text-left font-black transition-all flex justify-between items-center ${assessment.studyGoal === h ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                >
                  <span className="text-sm uppercase tracking-widest">{h} {t.hoursDay}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.obstacleQ}</h3>
            <div className="space-y-3">
              {[
                { id: 'focus', label: t.obstacle_focus },
                { id: 'discipline', label: t.obstacle_discipline },
                { id: 'syllabus', label: t.obstacle_syllabus },
                { id: 'procrastination', label: t.obstacle_procrastination }
              ].map(o => (
                <button 
                  key={o.id}
                  onClick={() => { setAssessment({...assessment, primaryProblem: o.id as any}); handleNextStep(); }}
                  className={`w-full p-5 rounded-2xl border text-left font-bold transition-all uppercase tracking-tight text-xs ${assessment.primaryProblem === o.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.goalQ}</h3>
            <div className="space-y-3">
              {[
                { id: 'gpa5', label: t.goal_gpa5 },
                { id: 'pass', label: t.goal_pass },
                { id: 'competitive', label: t.goal_competitive },
                { id: 'comeback', label: t.goal_comeback }
              ].map(g => (
                <button 
                  key={g.id}
                  onClick={() => { setAssessment({...assessment, primaryGoal: g.id as any}); handleNextStep(); }}
                  className={`w-full p-5 rounded-2xl border text-left font-bold transition-all uppercase tracking-tight text-xs ${assessment.primaryGoal === g.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.examNameQ}</h3>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder={t.examPlaceholder}
                value={assessment.targetExam}
                onChange={(e) => setAssessment({...assessment, targetExam: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-sm font-black outline-none focus:border-indigo-600 dark:text-slate-200 uppercase tracking-widest shadow-inner"
              />
              <button onClick={handleNextStep} className="w-full bg-indigo-950 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg">{t.lockTarget}</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{t.finalStepTitle}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.finalStepDesc}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.nameLabel}</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 dark:text-slate-200"
                  placeholder="ABDULLAH"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.emailLabel}</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 dark:text-slate-200"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-600 dark:text-slate-200"
                  placeholder="••••••••"
                />
              </div>
              
              {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">{error}</p>}
              
              <button 
                onClick={finalizeOnboarding}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-xs mt-4"
              >
                {t.assemblePlan}
                <Sparkles className="w-5 h-5 text-amber-300" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthScreen;
