
import { AssessmentData, DayPlan, DisciplineMode } from '../types';
import { translations } from '../locales/translations';

const CHALLENGES_BN: Record<string, string> = {
  focus: "পোমোডোরো পদ্ধতি: ২৫ মিনিট পড়া, ৫ মিনিট বিরতি। রুমে ফোন রাখা যাবে না।",
  discipline: "সকাল ৮টার আগে প্রথম স্টাডি ব্লক শুরু করুন।",
  syllabus: "পড়া শুরুর আগে একটি চ্যাপ্টার ম্যাপ তৈরি করুন।",
  procrastination: "সবচেয়ে কঠিন টপিকটি প্রথম ৪৫ মিনিটে শেষ করুন।"
};

const TOPICS_MAP_BN: Record<string, string[]> = {
  'Physics': ['ভেক্টর ক্যালকুলাস', 'নিউটনিয়ান মেকানিক্স', 'কাজ ও শক্তি', 'মহাকর্ষ', 'স্থির তড়িৎ', 'তাপগতিবিদ্যা', 'তরঙ্গ', 'নিউক্লিয়ার পদার্থবিজ্ঞান'],
  'Math': ['ত্রিকোণমিতি', 'ক্যালকুলাস', 'ম্যাট্রিক্স', 'ইন্টিগ্রেশন', 'সম্ভাবনা', 'স্থানাঙ্ক জ্যামিতি', 'সেট তত্ত্ব', 'ফাংশন'],
  'Chemistry': ['পরমাণুর গঠন', 'জৈব রসায়ন', 'সাম্যাবস্থা', 'তড়িৎ রসায়ন', 'পর্যায় সারণী', 'গ্যাস সূত্র', 'পরিমাণগত রসায়ন'],
  'Biology': ['কোষ জীববিজ্ঞান', 'জেনেটিক্স', 'মানব শারীরস্থান', 'উদ্ভিদবিজ্ঞান', 'বায়োটেকনোলজি', 'বাস্তুসংস্থান', 'টিস্যু'],
  'Bangla': ['ব্যাকরণ দক্ষতা', 'কবিতা বিশ্লেষণ', 'সৃজনশীল লিখন', 'ঐতিহাসিক প্রেক্ষাপট'],
  'English': ['গ্রামার ফাউন্ডেশন', 'ভোকাবুলারি', 'রিডিং কম্প্রিহেনশন', 'এসে স্ট্রাকচার'],
  'ICT': ['সংখ্যা পদ্ধতি', 'ডিজিটাল লজিক', 'ওয়েব ডিজাইন', 'প্রোগ্রামিং বেসিক'],
  'General Sci': ['পরিবেশ বিজ্ঞান', 'খাদ্য ও পুষ্টি', 'আলো ও শব্দ', 'ভৌত মহাবিশ্ব']
};

export const generateComebackPlan = (data: AssessmentData): DayPlan[] => {
  const plans: DayPlan[] = [];
  const subjects = data.weakSubjects.length > 0 ? data.weakSubjects : ['General Study'];
  
  const intensity = data.primaryGoal === 'gpa5' || data.primaryGoal === 'competitive' ? 'নিবিড়' : 'নিয়মিত';
  const questionCount = data.primaryGoal === 'gpa5' ? 25 : 15;

  for (let i = 1; i <= 30; i++) {
    const subject = subjects[(i - 1) % subjects.length];
    const topics = TOPICS_MAP_BN[subject] || ['প্রধান বিষয় দক্ষতা'];
    const topic = topics[Math.floor((i - 1) / subjects.length) % topics.length] || 'সাধারণ রিভিশন';
    
    plans.push({
      day: i,
      subject: subject,
      focusConcept: `${topic} - ${intensity} পর্যালোচনা`,
      practiceTask: `${questionCount}টি MCQ এবং ৩টি সৃজনশীল প্রশ্ন সমাধান (${subject} - ${topic})।`,
      disciplineChallenge: CHALLENGES_BN[data.primaryProblem] || "পড়ার টেবিল সব সময় গুছিয়ে রাখুন।",
      reflectionQuestion: "আজ কি আরামের চেয়ে শৃঙ্খলাকে বেশি প্রাধান্য দিয়েছেন?",
      isCompleted: false
    });
  }
  
  return plans;
};

export const getDisciplineMode = (problem: string): DisciplineMode => {
  if (problem === 'discipline' || problem === 'procrastination') return 'Strict';
  if (problem === 'focus') return 'Balanced';
  return 'Gentle';
};
