
import { BraynerState } from '../types.ts';

const APP_KEY = 'braynerApp';

export const DEFAULT_STATE: BraynerState = {
  user: {
    current: null,
    registered: []
  },
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
  try {
    const stored = localStorage.getItem(APP_KEY);
    if (!stored) return DEFAULT_STATE;
    const parsed = JSON.parse(stored);
    // Deep merge with DEFAULT_STATE to ensure new fields are populated if they don't exist in local storage
    return {
      ...DEFAULT_STATE,
      ...parsed,
      user: { ...DEFAULT_STATE.user, ...parsed.user },
      plan: { ...DEFAULT_STATE.plan, ...parsed.plan },
      tasks: { ...DEFAULT_STATE.tasks, ...parsed.tasks },
      stats: { ...DEFAULT_STATE.stats, ...parsed.stats },
      vault: { ...DEFAULT_STATE.vault, ...parsed.vault },
      preferences: { ...DEFAULT_STATE.preferences, ...parsed.preferences },
      coach: { ...DEFAULT_STATE.coach, ...parsed.coach }
    };
  } catch (e) {
    console.error("Critical error reading app state from localStorage:", e);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: BraynerState) => {
  try {
    localStorage.setItem(APP_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Critical error saving app state to localStorage:", e);
  }
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
    user: { ...DEFAULT_STATE.user, registered: current.user.registered } 
  };
  saveState(next);
};

export const isAuthenticated = (): boolean => {
  try {
    const state = getState();
    return !!state.user.current && state.plan.personalizedPlans.length > 0;
  } catch (e) {
    return false;
  }
};
