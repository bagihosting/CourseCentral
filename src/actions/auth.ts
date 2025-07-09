
'use server';

import { getPool } from '@/lib/db';
import type { User } from '@/types';
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { getActiveTenantId } from './utils';

// --- Core Functions (Used by Server Actions) ---

export async function getUserById(id: string): Promise<User | undefined> {
  const pool = getPool();
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) {
      const user = rows[0] as User;
      // Konversi tipe data jika perlu (misalnya, dari TinyInt ke boolean)
      return {
        ...user,
        loginCount: Number(user.loginCount),
      };
    }
    return undefined;
  } catch (error: any) {
    console.error("🔴 Gagal mengambil pengguna dari DB di getUserById:", error);
    throw error;
  }
}

export async function validateUser(username: string, password: string): Promise<User | null> {
    const pool = getPool();
    const activeTenantId = await getActiveTenantId();
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return null; // Pengguna tidak ditemukan
        }

        const user = rows[0] as User;
        
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
            
            const newLoginCount = (Number(user.loginCount) || 0) + 1;
            await pool.query(
                'UPDATE users SET lastLoginAt = NOW(), loginCount = ?, status = ? WHERE id = ?',
                [newLoginCount, 'active', user.id]
            );

            return {
                ...user,
                lastLoginAt: new Date().toISOString(),
                loginCount: newLoginCount,
                status: 'active',
            };
        }

        return null;
    } catch (error: any) {
        if (error instanceof Error && error.message === 'ACCOUNT_INACTIVE') {
            throw error;
        }
        console.error("🔴 Error saat validasi pengguna di validateUser:", error);
        throw error;
    }
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
    const user = await getUserById(sessionId);
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
