'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { validateUser, registerUser as registerUserData, getUserById, RegisterUserInput } from '@/lib/data';

const SESSION_KEY = 'user_session_id';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterUserInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUserId = sessionStorage.getItem(SESSION_KEY);
      if (storedUserId) {
        const userData = getUserById(storedUserId);
        if (userData) {
          setUser(userData);
        } else {
          // Clear session if user ID is invalid
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load user from session storage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const validatedUser = validateUser(username, password);
    if (validatedUser) {
      setUser(validatedUser);
      sessionStorage.setItem(SESSION_KEY, validatedUser.id);
      router.push('/dashboard');
      router.refresh();
    } else {
      throw new Error('Nama pengguna atau kata sandi salah.');
    }
  }, [router]);

  const register = useCallback(async (data: RegisterUserInput) => {
    const newUser = registerUserData(data);
    // Automatically log in after registration
    setUser(newUser);
    sessionStorage.setItem(SESSION_KEY, newUser.id);
    router.push('/dashboard');
    router.refresh();
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    router.push('/');
    router.refresh();
  }, [router]);

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
