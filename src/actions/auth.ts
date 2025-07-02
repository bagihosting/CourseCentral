'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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
  
  // Since we are moving to localStorage, we can't query the DB from the server.
  // We'll return a static user object based on the role from the cookie.
  // The full user data will be managed on the client side.
  if (role === 'admin') {
    return { id: 'admin', name: 'Admin Utama', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png' };
  }
  if (role === 'member') {
    return { id: 'member', name: 'Siswa Rajin', role: 'member', avatarUrl: 'https://placehold.co/100x100.png' };
  }
  
  return null;
}
