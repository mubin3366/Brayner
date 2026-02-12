
import { getState, updateState } from './localEngine';

export const getXP = (): number => {
  return getState().stats.xp;
};

export const addXP = (amount: number): number => {
  const state = getState();
  const updatedXP = state.stats.xp + amount;
  updateState({
    stats: {
      ...state.stats,
      xp: updatedXP
    }
  });
  return updatedXP;
};

export const getLevelInfo = (xp: number) => {
  const level = Math.floor(xp / 200) + 1;
  const minXP = (level - 1) * 200;
  const maxXP = level * 200;
  
  let label = 'Novice';
  if (level === 2) label = 'Disciplined';
  if (level === 3) label = 'Scholar';
  if (level >= 4) label = 'Master';

  return { level, min: minXP, max: maxXP, label };
};
