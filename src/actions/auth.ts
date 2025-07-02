'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/data';
import type { User } from '@/types';

const USER_COOKIE_KEY = 'user_session';

export type UserRole = 'admin' | 'member';

export async function login(role: UserRole) {
  cookies().set(USER_COOKIE_KEY, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // Satu hari
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout() {
  cookies().delete(USER_COOKIE_KEY);
  redirect('/');
}

export async function getUser(): Promise<User | null> {
  const cookieStore = cookies();
  const userCookie = cookieStore.get(USER_COOKIE_KEY);
  
  if (!userCookie) return null;

  const role = userCookie.value;
  if (role === 'admin' || role === 'member') {
    const users = await getAllUsers();
    const user = users.find(u => u.role === role);
    return user || null;
  }
  
  return null;
}
