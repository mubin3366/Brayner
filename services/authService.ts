
import { getState, updateState } from './localEngine';
import { AuthUser, BraynerState } from '../types';

export const signup = async (userData: { name: string, email: string, password?: string, academicLevel: 'SSC' | 'HSC' }): Promise<AuthUser> => {
  const state = getState();
  const normalizedEmail = userData.email.toLowerCase().trim();
  
  // Strict Duplicate Check
  if (state.users.find((u: any) => u.email === normalizedEmail)) {
    console.error("[BRAYNER AUTH] Signup failed: Email already exists.");
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
    users: [...state.users, newUser],
    user: authUser
  });
  
  console.log("[BRAYNER AUTH] User registered successfully:", normalizedEmail);
  return authUser;
};

export const login = async (email: string, password?: string): Promise<AuthUser | null> => {
  const state = getState();
  const normalizedEmail = email.toLowerCase().trim();
  
  // Exact Match Check
  const user = state.users.find((u: any) => u.email === normalizedEmail && u.password === password);
  
  if (!user) {
    console.warn("[BRAYNER AUTH] Login attempt failed for:", normalizedEmail);
    return null;
  }

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    academicLevel: user.academicLevel || 'SSC',
    isGuest: false,
    assessment: user.assessment
  };

  updateState({
    user: authUser
  });

  console.log("[BRAYNER AUTH] User logged in:", normalizedEmail);
  return authUser;
};

export const logout = async () => {
  updateState({
    user: null
  });
  console.log("[BRAYNER AUTH] User logged out.");
  return Promise.resolve();
};

export const getCurrentUser = (): AuthUser | null => {
  const state = getState();
  return state.user;
};
