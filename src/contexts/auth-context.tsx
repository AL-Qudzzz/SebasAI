
'use client';

import type { User as FirebaseUser, AuthError } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming your Firebase init is in lib/firebase.ts

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loadingAuthState: boolean;
  signUp: (email: string, pass: string) => Promise<FirebaseUser | AuthError>;
  login: (email: string, pass: string) => Promise<FirebaseUser | AuthError>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuthState(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const signUp = async (email: string, password: string): Promise<FirebaseUser | AuthError> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser | AuthError> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    }
  };

  const logout = async (): Promise<void> => {
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
