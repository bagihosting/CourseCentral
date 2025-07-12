
'use server';

import { getPool } from '@/lib/db';
import type { User } from '@/types';
import { fetchUserById, fetchUserByUsername, updateUserLoginStatus } from '@/data/users';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getActiveTenantId } from './utils';

// --- Core Functions (Used by Server Actions) ---

export async function validateUser(username: string, password: string): Promise<User | null> {
    const activeTenantId = await getActiveTenantId();
    const user = await fetchUserByUsername(username);

    if (!user) {
        return null; // Pengguna tidak ditemukan
    }

    // Ensure password exists and is a string before proceeding
    const storedPassword = user.password;
    if (!storedPassword || typeof storedPassword !== 'string') {
        return null; // Password tidak ada atau format salah, login gagal
    }

    const passwordMatch = await bcrypt.compare(password, storedPassword);

    if (passwordMatch) {
        // Cek kecocokan tenant. Pengguna hanya bisa login via subdomain tenant mereka atau domain utama.
        if (user.tenant_id !== 'platform_main' && user.tenant_id !== activeTenantId) {
            return null; // Pengguna mencoba login di tenant yang salah.
        }
        
        if (user.role !== 'admin' && user.status === 'inactive') {
            throw new Error('ACCOUNT_INACTIVE');
        }
        
        const updatedUser = await updateUserLoginStatus(user.id);
        return updatedUser;
    }

    return null;
}

// --- Session Management Server Actions (Used by Client) ---

/**
 * Server action to get the current user session from the cookie.
 * Used by the AuthProvider to hydrate the user state on the client.
 */
export async function getSession(): Promise<User | null> {
    const sessionId = cookies().get('user_session_id')?.value;
    if (!sessionId) {
        return null;
    }
    const user = await fetchUserById(sessionId);
    return user || null;
}

/**
 * Server action to log in a user.
 * Validates credentials, and if successful, sets a secure, http-only cookie.
 */
export async function login(username: string, password: string): Promise<User> {
    const user = await validateUser(username, password);

    if (!user) {
        throw new Error('Nama pengguna atau kata sandi salah, atau Anda mencoba masuk di domain yang salah.');
    }

    cookies().set('user_session_id', user.id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    return user;
}

/**
 * Server action to log out a user.
 * Clears the session cookie.
 */
export async function logout(): Promise<void> {
    cookies().delete('user_session_id');
}
