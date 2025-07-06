'use server';

import { pool } from '@/lib/db';
import type { User } from '@/types';
import type { RowDataPacket } from 'mysql2';

// This file contains the new, database-backed authentication functions.
// Client components should import from here to use server actions.

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) {
      const user = rows[0] as User;
      // Konversi tipe data jika perlu (misalnya, dari TinyInt ke boolean)
      return {
        ...user,
        affiliateBalance: Number(user.affiliateBalance),
        affiliatePaid: Number(user.affiliatePaid),
        loginCount: Number(user.loginCount),
      };
    }
    return undefined;
  } catch (error) {
    console.error("🔴 Gagal mengambil pengguna dari DB di getUserById:", error);
    // Mengembalikan undefined secara diam-diam agar tidak merusak seluruh aplikasi jika DB tidak terjangkau.
    // Error sudah dicatat di log server untuk debugging.
    return undefined;
  }
}

export async function validateUser(username: string, password: string): Promise<User | null> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return null; // Pengguna tidak ditemukan
        }

        const user = rows[0] as User;

        // Di dunia nyata, gunakan bcrypt.compare(password, user.password)
        if (user.password === password) {
            if (user.role !== 'admin' && user.status === 'inactive') {
                throw new Error('ACCOUNT_INACTIVE');
            }
            
            // Update statistik login
            const newLoginCount = (Number(user.loginCount) || 0) + 1;
            await pool.query(
                'UPDATE users SET lastLoginAt = NOW(), loginCount = ?, status = ? WHERE id = ?',
                [newLoginCount, 'active', user.id]
            );

            // Kembalikan data pengguna yang sudah diperbarui
            return {
                ...user,
                lastLoginAt: new Date().toISOString(),
                loginCount: newLoginCount,
                status: 'active',
                affiliateBalance: Number(user.affiliateBalance),
                affiliatePaid: Number(user.affiliatePaid),
            };
        }

        return null; // Kata sandi salah
    } catch (error) {
        if (error instanceof Error && error.message === 'ACCOUNT_INACTIVE') {
            throw error; // Lemparkan kembali error spesifik ini
        }
        console.error("🔴 Error saat validasi pengguna di validateUser:", error);
        // Lemparkan kembali error asli untuk debugging.
        throw error;
    }
}
