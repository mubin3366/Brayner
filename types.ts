
export type Tab = 'home' | 'practice' | 'plan' | 'progress' | 'profile' | 'focus' | 'vault' | 'xp' | 'report' | 'settings' | 'coach';

export type DisciplineMode = 'Gentle' | 'Balanced' | 'Strict';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'system' | 'bn' | 'en';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface AssessmentData {
  academicLevel: 'SSC' | 'HSC';
  targetExam: string;
  weakSubjects: string[];
  studyGoal: number;
  primaryProblem: 'focus' | 'discipline' | 'syllabus' | 'procrastination';
  primaryGoal: 'gpa5' | 'pass' | 'competitive' | 'comeback';
}

export interface DisciplineTask {
  id: string;
  title: string;
  category: 'focus' | 'behavior' | 'consistency' | 'recovery';
  iconType: string;
}

export interface UserProgress {
  currentDay: number;
  currentPlanDay: number;
  streak: number;
  completedTasks: string[];
  dailyTasks: DisciplineTask[];
  tasksByDate: Record<string, DisciplineTask[]>;
  isRecoveryMode: boolean;
  totalMinutesToday: number;
  disciplineMode: DisciplineMode;
  revisions: RevisionItem[];
  weakAreas: WeakArea[];
  lastActiveDate: string;
  planStarted: boolean;
  planStartDate: string;
  lastCompletedDate: string;
  completedDays: number[];
  missedDays: number[];
}

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  notifications: {
    dailyReminder: boolean;
    comebackReminder: boolean;
    revisionReminder: boolean;
  };
  disciplineMode: DisciplineMode;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface StudyResource {
  id: string;
  title: string;
  link: string;
}

export interface RevisionItem {
  id: string;
  subject: string;
  topic: string;
  scheduledFor: string; 
}

export interface WeakArea {
  subject: string;
  issue: string;
  suggestion: string;
}

export interface DayPlan {
  day: number;
  subject: string;
  focusConcept: string;
  practiceTask: string;
  disciplineChallenge: string;
  reflectionQuestion: string;
  isCompleted: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  academicLevel: 'SSC' | 'HSC';
  isGuest: boolean;
  assessment?: AssessmentData;
}

export interface BraynerState {
  user: AuthUser | null; // Current active user
  users: any[]; // List of registered users (braynerApp.users[])
  plan: {
    planStarted: boolean;
    planStartDate: string;
    currentUnlockedDay: number;
    personalizedPlans: DayPlan[];
  };
  tasks: {
    completedToday: string[];
    byDate: Record<string, DisciplineTask[]>;
  };
  stats: {
    xp: number;
    streak: number;
    totalMinutesToday: number;
    completedDays: number[];
    missedDays: number[];
    lastCompletedDate: string;
    lastActiveDate: string;
    revisions: RevisionItem[];
    weakAreas: WeakArea[];
  };
  vault: {
    notes: Note[];
    resources: StudyResource[];
  };
  preferences: AppSettings;
  coach: {
    history: ChatMessage[];
  };
}
