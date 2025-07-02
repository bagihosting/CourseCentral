'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (userId) {
    cookies().set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    redirect('/dashboard');
  } else {
    redirect('/?error=Login failed');
  }
}

export async function logout() {
  cookies().delete('userId');
  redirect('/');
}
