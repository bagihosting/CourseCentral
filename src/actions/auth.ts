
'use server';

import { pool } from '@/lib/db';
import type { User } from '@/types';
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

// --- Core Functions (Used by Server Actions) ---

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT u.*, ib.customDomain 
        FROM users u
        LEFT JOIN instructor_branding ib ON u.id = ib.userId
        WHERE u.id = ?
    `, [id]);
    if (rows.length > 0) {
      const user = rows[0] as User;
      // Konversi tipe data jika perlu (misalnya, dari TinyInt ke boolean)
      return {
        ...user,
        loginCount: Number(user.loginCount),
        customDomain: user.customDomain
      };
    }
    return undefined;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
    } else {
        console.error("🔴 Gagal mengambil pengguna dari DB di getUserById:", error);
    }
    return undefined;
  }
}

export async function validateUser(username: string, password: string): Promise<User | null> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT u.*, ib.customDomain
            FROM users u
            LEFT JOIN instructor_branding ib ON u.id = ib.userId
            WHERE u.username = ?
        `, [username]);

        if (rows.length === 0) {
            return null; // Pengguna tidak ditemukan
        }

        const user = rows[0] as User;
        const storedPassword = user.password;

        let passwordMatch = false;

        if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
            passwordMatch = await bcrypt.compare(password, storedPassword);
        } else {
            passwordMatch = (storedPassword === password);
        }

        if (passwordMatch) {
            if (user.role !== 'admin' && user.status === 'inactive') {
                throw new Error('ACCOUNT_INACTIVE');
            }
            
            if (!storedPassword.startsWith('$2a$') && !storedPassword.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
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
                customDomain: user.customDomain,
            };
        }

        return null;
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || 3306;
            console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
        } else if (error instanceof Error && error.message === 'ACCOUNT_INACTIVE') {
            throw error;
        } else {
            console.error("🔴 Error saat validasi pengguna di validateUser:", error);
        }
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
        throw new Error('Nama pengguna atau kata sandi salah.');
    }

    cookies().set('user_session_id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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
