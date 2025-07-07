
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { login as loginAction, logout as logoutAction, getSession } from '@/actions/auth';
import { updateUser as updateUserAction, UpdateUserInput } from '@/actions/users';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateUserInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const sessionUser = await getSession();
      setUser(sessionUser);
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (username: string, password: string) => {
    const validatedUser = await loginAction(username, password);
    setUser(validatedUser);
    router.push('/dashboard');
    router.refresh(); // Ensure layout re-renders with new user state
  }, [router]);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    router.push('/');
    router.refresh(); // Ensure layout re-renders in logged-out state
  }, [router]);

  const updateUser = useCallback(async (data: UpdateUserInput) => {
    if (!user) {
      throw new Error("Pengguna tidak diautentikasi.");
    }
    try {
      const updatedUser = await updateUserAction(user.id, data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Gagal memperbarui pengguna:", error);
      throw error;
    }
  }, [user]);

  const value = { user, loading, login, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
