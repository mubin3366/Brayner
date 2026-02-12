
import { AssessmentData, DisciplineTask } from '../types';

const TASK_POOL_BN = {
  focus: [
    "পড়াশোনার সময় ফোন অন্য রুমে রাখা (১ ঘণ্টা)",
    "২৫ মিনিটের ৩টি পোমোডোরো সেশন সম্পন্ন করা",
    "পড়ার টেবিল থেকে অপ্রয়োজনীয় সব কিছু সরানো",
    "কোনো বিরতি ছাড়া ৪৫ মিনিট একাগ্রভাবে পড়া",
    "পড়াশোনা শুরুর আগে ২ মিনিট মেডিটেশন করা"
  ],
  behavior: [
    "নির্ধারিত সময়ের ১৫ মিনিট আগে পড়া শুরু করা",
    "আজকের পড়ার লিস্ট ডায়েরিতে লিখে রাখা",
    "রাতে ঘুমানোর আগে পরের দিনের লক্ষ্য ঠিক করা",
    "পড়া শেষ করে অন্তত ২০ মিনিট হাঁটাহাঁটি করা",
    "বই গুছিয়ে পড়ার রুম ত্যাগ করা"
  ],
  consistency: [
    "দিনের সবচেয়ে কঠিন বিষয়টি সবার আগে শেষ করা",
    "টানা ৯০ মিনিট কোনো স্ক্রিন (ফোন/ল্যাপটপ) না দেখা",
    "আজকের শেখা নতুন ৩টি টপিক রিভিশন দেওয়া",
    "পড়াশোনার মাঝে অন্য কোনো কাজ না করা",
    "দিনের পড়া শেষ করে আজকের অগ্রগতি ডায়েরিতে লেখা"
  ],
  recovery: [
    "অতীতের গ্যাপ পূরণে ১ ঘণ্টা বাড়তি পড়াশোনা",
    "বাকি থাকা অন্তত ২টি রিভিশন টাস্ক সম্পন্ন করা",
    "কঠিন একটি অধ্যায় থেকে ১৫টি MCQ সলভ করা",
    "আজকের সব টাস্ক ১০০% ডিসিপ্লিনের সাথে শেষ করা",
    "কোনো অজুহাত ছাড়া টানা ২ ঘণ্টা পড়া"
  ],
  syllabus: [
    "সিলেবাসের একটি বড় টপিক ছোট ছোট ভাগে ভাগ করা",
    "আজকের টপিকের ওপর ৫টি নোট তৈরি করা",
    "সূত্রগুলো একটি কাগজে লিখে দেয়ালে টাঙানো",
    "গত বছরের অন্তত ২টি বোর্ড প্রশ্ন সলভ করা",
    "অধ্যায় শেষে নিজের একটি ছোট টেস্ট নেওয়া"
  ],
  procrastination: [
    "অলসতা কাটাতে ৫ মিনিটের মধ্যে পড়তে বসা",
    "সবচেয়ে বেশি ভয় পাওয়া টপিকটি ১০ মিনিট পড়া",
    "পড়ার সময় ইন্টারনেট কানেকশন অফ রাখা",
    "ছোট একটি টাস্ক সম্পন্ন করে নিজেকে পুরস্কৃত করা",
    "৫ সেকেন্ড রুল (৫-৪-৩-২-১) মেনে কাজ শুরু করা"
  ]
};

export const generateDailyTasks = (data: AssessmentData, isRecovery: boolean): DisciplineTask[] => {
  const tasks: DisciplineTask[] = [];
  const primaryProblem = data.primaryProblem;
  
  // 1. Add Recovery tasks if needed
  if (isRecovery) {
    const recoveryTasks = [...TASK_POOL_BN.recovery].sort(() => 0.5 - Math.random());
    tasks.push({
      id: 'rec_1',
      title: recoveryTasks[0],
      category: 'recovery',
      iconType: 'ShieldAlert'
    });
  }

  // 2. Focused Discipline Tasks based on Problem
  const problemTasks = [...(TASK_POOL_BN[primaryProblem] || TASK_POOL_BN.consistency)].sort(() => 0.5 - Math.random());
  tasks.push({
    id: 'prob_1',
    title: problemTasks[0],
    category: primaryProblem === 'focus' ? 'focus' : 'behavior',
    iconType: 'Target'
  });
  
  tasks.push({
    id: 'prob_2',
    title: problemTasks[1],
    category: primaryProblem === 'procrastination' ? 'behavior' : 'consistency',
    iconType: 'Zap'
  });

  // 3. Behavioral/Routine task
  const behaviorTasks = [...TASK_POOL_BN.behavior].sort(() => 0.5 - Math.random());
  tasks.push({
    id: 'beh_1',
    title: behaviorTasks[0],
    category: 'behavior',
    iconType: 'PenTool'
  });

  // 4. Intensity adjustment for GPA5/Competitive
  if (data.primaryGoal === 'gpa5' || data.primaryGoal === 'competitive') {
    const syllabusTasks = [...TASK_POOL_BN.syllabus].sort(() => 0.5 - Math.random());
    tasks.push({
      id: 'goal_1',
      title: syllabusTasks[0],
      category: 'consistency',
      iconType: 'Award'
    });
  }

  // Ensure 3-5 tasks
  return tasks.slice(0, 5);
};
