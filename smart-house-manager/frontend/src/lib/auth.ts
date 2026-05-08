import { User } from '@/types';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const storeAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'text-red-400 bg-red-400/10';
    case 'premium': return 'text-yellow-400 bg-yellow-400/10';
    default: return 'text-blue-400 bg-blue-400/10';
  }
};

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'premium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }
};

export const canBookMultiple = (role: string): boolean => {
  return role === 'admin' || role === 'premium';
};

export const getMaxDuration = (role: string): number => {
  switch (role) {
    case 'admin': return 1440;
    case 'premium': return 480;
    default: return 240;
  }
};
