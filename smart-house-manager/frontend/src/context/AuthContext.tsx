'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser } from '@/types';
import { seedRooms } from '@/lib/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserDoc = async (fbUser: FirebaseUser) => {
    const ref = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setUser({ id: snap.id, ...snap.data() } as AppUser);
    } else {
      // Create user doc if missing
      const newUser: Omit<AppUser, 'id'> = {
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        role: 'normal',
        isActive: true,
        totalDonations: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, newUser);
      setUser({ id: fbUser.uid, ...newUser } as AppUser);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await loadUserDoc(fbUser);
        // Seed rooms on first login
        seedRooms().catch(() => {});
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadUserDoc(cred.user);
    toast.success(`Welcome back!`);
  };

  const register = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const newUser = {
      name,
      email,
      role: 'normal' as const,
      isActive: true,
      totalDonations: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setUser({ id: cred.user.uid, ...newUser });
    // Seed rooms
    seedRooms().catch(() => {});
    toast.success(`Welcome, ${name}!`);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    toast.success('Logged out.');
  };

  const updateUser = async (data: Partial<AppUser>) => {
    if (!firebaseUser) return;
    const ref = doc(db, 'users', firebaseUser.uid);
    await setDoc(ref, data, { merge: true });
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  const refreshUser = async () => {
    if (firebaseUser) await loadUserDoc(firebaseUser);
  };

  return (
    <AuthContext.Provider value={{
      user, firebaseUser, isLoading,
      isAuthenticated: !!user,
      login, register, logout, updateUser, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
