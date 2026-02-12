
import React from 'react';
import { BookOpen, Calculator, Beaker, Atom, Globe, PenTool, Cpu, Languages } from 'lucide-react';
import { Subject, DayPlan } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'phy', name: 'Physics', icon: 'Atom', color: 'text-blue-600 bg-blue-50' },
  { id: 'chem', name: 'Chemistry', icon: 'Beaker', color: 'text-purple-600 bg-purple-50' },
  { id: 'math', name: 'Math', icon: 'Calculator', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'bio', name: 'Biology', icon: 'BookOpen', color: 'text-green-600 bg-green-50' },
  { id: 'ban', name: 'Bangla', icon: 'PenTool', color: 'text-red-600 bg-red-50' },
  { id: 'eng', name: 'English', icon: 'Languages', color: 'text-amber-600 bg-amber-50' },
  { id: 'ict', name: 'ICT', icon: 'Cpu', color: 'text-teal-600 bg-teal-50' },
  { id: 'gs', name: 'General Sci', icon: 'Globe', color: 'text-slate-600 bg-slate-50' },
];

export const INITIAL_DAY_PLANS: DayPlan[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  // Added missing subject property to satisfy DayPlan type
  subject: i === 0 ? "Math" : "General Study",
  focusConcept: i === 0 ? "Fundamentals of Vector Calculus" : `Concept Topic ${i + 1}`,
  practiceTask: i === 0 ? "Solve 10 Previous Year Questions" : `Task details for day ${i + 1}`,
  disciplineChallenge: i === 0 ? "No social media during study block" : "Consistency challenge",
  reflectionQuestion: "What was the most challenging part today?",
  isCompleted: i === 0,
}));

export const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  Atom: <Atom className="w-6 h-6" />,
  Beaker: <Beaker className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  PenTool: <PenTool className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
};
