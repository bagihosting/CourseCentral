
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { validateUser, registerUser as registerUserData, getUserById, RegisterUserInput, updateUser as updateUserData, UpdateUserInput } from '@/lib/data';

// Menggunakan localStorage untuk persistensi sesi yang lebih kuat.
// Data akan tetap ada bahkan setelah browser ditutup, sampai pengguna logout.
const SESSION_KEY = 'user_session_id';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterUserInput & { referredBy?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateUserInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem(SESSION_KEY);
      if (storedUserId) {
        const userData = getUserById(storedUserId);
        if (userData) {
          setUser(userData);
        } else {
          // Bersihkan sesi jika ID pengguna tidak valid
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error("Gagal memuat pengguna dari localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const validatedUser = validateUser(username, password);
    if (validatedUser) {
      setUser(validatedUser);
      localStorage.setItem(SESSION_KEY, validatedUser.id);
      router.push('/dashboard');
      router.refresh();
    } else {
      throw new Error('Nama pengguna atau kata sandi salah.');
    }
  }, [router]);

  const register = useCallback(async (data: RegisterUserInput & { referredBy?: string }) => {
    const newUser = registerUserData(data);
    // Masuk secara otomatis setelah registrasi
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, newUser.id);
    router.push('/dashboard');
    router.refresh();
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    router.push('/');
    router.refresh();
  }, [router]);

  const updateUser = useCallback(async (data: UpdateUserInput) => {
    if (!user) {
        throw new Error("Pengguna tidak diautentikasi.");
    }
    try {
        const updatedUser = updateUserData(user.id, data);
        setUser(updatedUser); // Update state pengguna di dalam context
    } catch (error) {
        console.error("Gagal memperbarui pengguna:", error);
        throw error;
    }
  }, [user]);

  const value = { user, loading, login, register, logout, updateUser };

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
