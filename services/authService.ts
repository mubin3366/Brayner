
import { getState, updateState } from './localEngine.ts';
import { BraynerState } from '../types.ts';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  academicLevel: 'SSC' | 'HSC';
  isGuest: boolean;
}

export const signup = async (userData: { name: string, email: string, password?: string, academicLevel: 'SSC' | 'HSC' }): Promise<AuthUser> => {
  const state = getState();
  const normalizedEmail = userData.email.toLowerCase().trim();
  
  if (state.user.registered.find((u: any) => u.email === normalizedEmail)) {
    throw new Error('EMAIL_EXISTS');
  }

  const userId = `user_${Date.now()}`;
  const newUser = {
    ...userData,
    id: userId,
    email: normalizedEmail,
    createdAt: new Date().toISOString()
  };

  const authUser: AuthUser = {
    id: userId,
    name: userData.name,
    email: normalizedEmail,
    academicLevel: userData.academicLevel,
    isGuest: false
  };

  updateState({
    user: {
      ...state.user,
      registered: [...state.user.registered, newUser],
      current: { ...authUser, assessment: undefined }
    }
  });
  
  return authUser;
};

export const login = async (email: string, password?: string): Promise<AuthUser | null> => {
  const state = getState();
  const normalizedEmail = email.toLowerCase().trim();
  const user = state.user.registered.find((u: any) => u.email === normalizedEmail && u.password === password);
  
  if (!user) return null;

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    academicLevel: user.academicLevel || 'SSC',
    isGuest: false
  };

  updateState({
    user: {
      ...state.user,
      current: { ...authUser, assessment: user.assessment }
    }
  });

  return authUser;
};

export const logout = async () => {
  const state = getState();
  updateState({
    user: {
      ...state.user,
      current: null
    }
  });
  return Promise.resolve();
};

export const getCurrentUser = (): AuthUser | null => {
  const state = getState();
  return state.user.current;
};
