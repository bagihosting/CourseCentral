'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const USER_COOKIE_KEY = 'user_session';

export type UserRole = 'admin' | 'member';

export async function login(role: UserRole) {
  cookies().set(USER_COOKIE_KEY, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // One day
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout() {
  cookies().delete(USER_COOKIE_KEY);
  redirect('/');
}

export async function getUser(): Promise<{ role: UserRole | null }> {
  const cookieStore = cookies();
  const userCookie = cookieStore.get(USER_COOKIE_KEY);
  
  if (userCookie && (userCookie.value === 'admin' || userCookie.value === 'member')) {
    return { role: userCookie.value };
  }
  
  return { role: null };
}
