
import React, { useEffect } from 'react';
import { PenTool } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-[100] animate-in fade-in duration-700">
      <div className="flex flex-col items-center space-y-6">
        {/* Solid brand color instead of heavy gradient, removed bounce animation */}
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100 dark:shadow-none">
          <PenTool className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter uppercase">BRAYNER</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide mt-1">30 Day Academic Comeback</p>
        </div>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 dark:bg-indigo-800 animate-pulse"></div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.3em]">Discipline & Consistency</p>
      </div>
    </div>
  );
};

export default SplashScreen;
