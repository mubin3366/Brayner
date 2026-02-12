import { UserProgress, DisciplineTask, RevisionItem } from '../types';
import { getState, updateState } from './localEngine';
import { generateDailyTasks } from './taskEngine';
import { addXP } from './xpService';

const getTodayISO = () => new Date().toISOString().split('T')[0];

const syncAndGetState = () => {
  const state = getState();
  if (!state.plan.planStarted || !state.plan.planStartDate) return state;

  const todayStr = getTodayISO();
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
    updateState(nextState);
    return nextState;
  }

  return state;
};

export const getProgress = (): UserProgress => {
  const state = syncAndGetState();
  const todayDate = new Date().toDateString();
  const todayISO = getTodayISO();

  let tasksForToday = state.tasks.byDate[todayDate];
  let completedToday = state.tasks.completedToday;

  if (state.stats.lastActiveDate !== todayDate) {
    if (!tasksForToday && state.user.current?.assessment) {
      tasksForToday = generateDailyTasks(state.user.current.assessment, state.stats.missedDays.length > 0);
      completedToday = [];
      updateState({
        tasks: {
          ...state.tasks,
          completedToday: [],
          byDate: { ...state.tasks.byDate, [todayDate]: tasksForToday }
        },
        stats: {
          ...state.stats,
          lastActiveDate: todayDate,
          totalMinutesToday: 0
        }
      });
    }
  }

  const effectiveUnlockedDay = state.plan.planStarted ? Math.max(1, state.plan.currentUnlockedDay) : 0;

  return {
    currentDay: effectiveUnlockedDay,
    currentPlanDay: effectiveUnlockedDay,
    streak: state.stats.streak || state.stats.completedDays.length,
    completedTasks: completedToday,
    dailyTasks: tasksForToday || [],
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

export const startProgram = (): UserProgress => {
  const state = getState();
  const todayISO = getTodayISO();
  const todayDate = new Date().toDateString();

  const dailyTasks = state.user.current?.assessment ? generateDailyTasks(state.user.current.assessment, false) : [];

  updateState({
    plan: {
      ...state.plan,
      planStarted: true,
      planStartDate: todayISO,
      currentUnlockedDay: 1
    },
    tasks: {
      ...state.tasks,
      completedToday: [],
      byDate: { [todayDate]: dailyTasks }
    },
    stats: {
      ...state.stats,
      lastActiveDate: todayDate,
      totalMinutesToday: 0,
      streak: 0,
      completedDays: [],
      missedDays: []
    }
  });

  return getProgress();
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

  const todayISO = getTodayISO();
  if (state.stats.lastCompletedDate === todayISO) return;

  const completedDays = [...state.stats.completedDays];
  if (!completedDays.includes(state.plan.currentUnlockedDay)) {
    completedDays.push(state.plan.currentUnlockedDay);
  }

  updateState({
    stats: {
      ...state.stats,
      completedDays,
      lastCompletedDate: todayISO,
      streak: state.stats.streak + 1
    }
  });
};

export const getDisciplineLevel = (): 'Low' | 'Medium' | 'High' => {
  const state = getState();
  const todayDate = new Date().toDateString();
  const tasks = state.tasks.byDate[todayDate] || [];
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