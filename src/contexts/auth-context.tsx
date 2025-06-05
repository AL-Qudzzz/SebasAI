
'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming your Firebase init is in lib/firebase.ts

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loadingAuthState: boolean;
  signUp: (email: string, pass: string) => Promise<FirebaseUser | Error>;
  login: (email: string, pass: string) => Promise<FirebaseUser | Error>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    // Check if auth is initialized, otherwise onAuthStateChanged might throw
    // This can happen if Firebase app initialization itself failed (e.g. invalid API key)
    if (!auth) {
      console.error("Firebase auth is not initialized. Check your Firebase config.");
      setLoadingAuthState(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuthState(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const signUp = async (email: string, password: string): Promise<FirebaseUser | Error> => {
    try {
      if (!auth) throw new Error("Firebase auth is not initialized.");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return error as Error; // Return as generic Error
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser | Error> => {
    try {
      if (!auth) throw new Error("Firebase auth is not initialized.");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return error as Error; // Return as generic Error
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) {
      console.error("Firebase auth is not initialized. Cannot logout.");
      return;
    }
    setLoadingAuthState(true);
    await signOut(auth);
    // onAuthStateChanged will set currentUser to null and loadingAuthState to false
  };
  
  const value = {
    currentUser,
    loadingAuthState,
    signUp,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
