
import { UserProgress, DisciplineTask, RevisionItem, BraynerState } from '../types';
import { getState, updateState, saveState } from './localEngine';
import { generateDailyTasks } from './taskEngine';
import { addXP } from './xpService';

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const syncStateWithDate = (state: BraynerState): BraynerState => {
  if (!state.plan.planStarted || !state.plan.planStartDate) return state;

  const todayStr = getTodayKey();
  const today = new Date(todayStr);
  const start = new Date(state.plan.planStartDate);
  
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  let realDay = Math.floor(diffTime / 86400000) + 1;
  
  if (realDay < 1) realDay = 1;
  if (realDay > 30) realDay = 30;

  if (realDay > state.plan.currentUnlockedDay) {
    const updatedMissed = [...state.stats.missedDays];
    for (let d = state.plan.currentUnlockedDay; d < realDay; d++) {
      if (!state.stats.completedDays.includes(d) && !updatedMissed.includes(d)) {
        updatedMissed.push(d);
      }
    }
    
    const nextState = {
      ...state,
      plan: { ...state.plan, currentUnlockedDay: realDay },
      stats: { ...state.stats, missedDays: updatedMissed }
    };
    saveState(nextState);
    return nextState;
  }

  return state;
};

export const getProgress = (providedState?: BraynerState): UserProgress => {
  const rawState = providedState || getState();
  const state = syncStateWithDate(rawState);
  const todayKey = getTodayKey();

  let tasksForToday = state.tasks.byDate[todayKey] || [];
  let completedToday = state.tasks.completedToday;

  if (state.stats.lastActiveDate !== todayKey) {
    if (state.user?.assessment) {
      tasksForToday = generateDailyTasks(state.user.assessment, state.stats.missedDays.length > 0);
      completedToday = [];
      
      const newState = {
        ...state,
        tasks: {
          ...state.tasks,
          completedToday: [],
          byDate: { ...state.tasks.byDate, [todayKey]: tasksForToday }
        },
        stats: {
          ...state.stats,
          lastActiveDate: todayKey,
          totalMinutesToday: 0
        }
      };
      saveState(newState);
      return getProgress(newState);
    }
  }

  const effectiveUnlockedDay = state.plan.planStarted ? Math.max(1, state.plan.currentUnlockedDay) : 0;

  return {
    currentDay: effectiveUnlockedDay,
    currentPlanDay: effectiveUnlockedDay,
    streak: state.stats.streak || state.stats.completedDays.length,
    completedTasks: completedToday,
    dailyTasks: tasksForToday,
    tasksByDate: state.tasks.byDate,
    isRecoveryMode: state.stats.missedDays.length > 0,
    totalMinutesToday: state.stats.totalMinutesToday,
    disciplineMode: state.preferences.disciplineMode,
    revisions: state.stats.revisions,
    weakAreas: state.stats.weakAreas,
    lastActiveDate: state.stats.lastActiveDate,
    planStarted: state.plan.planStarted,
    planStartDate: state.plan.planStartDate,
    lastCompletedDate: state.stats.lastCompletedDate,
    completedDays: state.stats.completedDays,
    missedDays: state.stats.missedDays
  };
};

export const startProgram = (): BraynerState => {
  console.log("[BRAYNER] Executing startProgram...");
  const state = getState();
  const todayKey = getTodayKey();

  if (!state.user?.assessment) {
    console.warn("[BRAYNER] Cannot start program: No assessment found.");
    return state;
  }

  console.log("[BRAYNER] Generating tasks for today:", todayKey);
  const dailyTasks = generateDailyTasks(state.user.assessment, false);

  const updatedState: BraynerState = {
    ...state,
    plan: {
      ...state.plan,
      planStarted: true,
      planStartDate: todayKey,
      currentUnlockedDay: 1
    },
    tasks: {
      ...state.tasks,
      completedToday: [],
      byDate: { ...state.tasks.byDate, [todayKey]: dailyTasks }
    },
    stats: {
      ...state.stats,
      lastActiveDate: todayKey,
      totalMinutesToday: 0,
      streak: 0,
      completedDays: [],
      missedDays: []
    }
  };

  saveState(updatedState);
  console.log("[BRAYNER] Program started and tasks saved for:", todayKey);
  return updatedState;
};

export const completeTask = async (taskId: string) => {
  const state = getState();
  let completed = [...state.tasks.completedToday];
  if (!completed.includes(taskId)) {
    completed.push(taskId);
    addXP(5);
  } else {
    completed = completed.filter(id => id !== taskId);
  }
  updateState({ tasks: { ...state.tasks, completedToday: completed } });
};

export const addStudyMinutes = async (mins: number) => {
  const state = getState();
  updateState({
    stats: {
      ...state.stats,
      totalMinutesToday: state.stats.totalMinutesToday + mins
    }
  });
};

export const advanceDay = async () => {
  const state = getState();
  if (!state.plan.planStarted) return;

  const todayKey = getTodayKey();
  if (state.stats.lastCompletedDate === todayKey) return;

  const completedDays = [...state.stats.completedDays];
  if (!completedDays.includes(state.plan.currentUnlockedDay)) {
    completedDays.push(state.plan.currentUnlockedDay);
  }

  updateState({
    stats: {
      ...state.stats,
      completedDays,
      lastCompletedDate: todayKey,
      streak: state.stats.streak + 1
    }
  });
};

export const getDisciplineLevel = (providedState?: BraynerState): 'Low' | 'Medium' | 'High' => {
  const state = providedState || getState();
  const todayKey = getTodayKey();
  const tasks = state.tasks.byDate[todayKey] || [];
  const completed = state.tasks.completedToday || [];
  if (tasks.length === 0) return 'Low';
  const score = (completed.length / tasks.length) * 100;
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

export const scheduleRevision = (subject: string, topic: string) => {
  const state = getState();
  const newRevision: RevisionItem = {
    id: `rev_${Date.now()}`,
    subject,
    topic,
    scheduledFor: new Date().toISOString()
  };
  updateState({
    stats: {
      ...state.stats,
      revisions: [...state.stats.revisions, newRevision]
    }
  });
};
