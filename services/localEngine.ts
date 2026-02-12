
import { BraynerState } from '../types';

const APP_KEY = 'braynerApp';

export const DEFAULT_STATE: BraynerState = {
  user: null,
  users: [],
  plan: {
    planStarted: false,
    planStartDate: '',
    currentUnlockedDay: 0,
    personalizedPlans: []
  },
  tasks: {
    completedToday: [],
    byDate: {}
  },
  stats: {
    xp: 0,
    streak: 0,
    totalMinutesToday: 0,
    completedDays: [],
    missedDays: [],
    lastCompletedDate: '',
    lastActiveDate: '',
    revisions: [],
    weakAreas: []
  },
  vault: {
    notes: [],
    resources: []
  },
  preferences: {
    theme: 'light',
    language: 'bn',
    notifications: {
      dailyReminder: true,
      comebackReminder: true,
      revisionReminder: true
    },
    disciplineMode: 'Balanced',
    soundEnabled: true,
    vibrationEnabled: true
  },
  coach: {
    history: []
  }
};

export const getState = (): BraynerState => {
  const stored = localStorage.getItem(APP_KEY);
  if (!stored) return DEFAULT_STATE;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_STATE;
  }
};

export const saveState = (state: BraynerState) => {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
  // In a real app we might want to trigger a 'storage' event here for cross-tab sync
  // window.dispatchEvent(new Event('storage')); 
};

export const updateState = (updates: Partial<BraynerState>) => {
  const current = getState();
  const next = { ...current, ...updates };
  saveState(next);
  return next;
};

export const resetState = () => {
  const current = getState();
  const next = { 
    ...DEFAULT_STATE, 
    users: current.users 
  };
  saveState(next);
};

export const isAuthenticated = (): boolean => {
  const state = getState();
  return !!state.user && state.plan.personalizedPlans.length > 0;
};
