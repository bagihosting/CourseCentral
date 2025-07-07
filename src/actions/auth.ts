
'use server';

import { pool } from '@/lib/db';
import type { User } from '@/types';
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

// This file contains the new, database-backed authentication functions.
// Client components should import from here to use server actions.

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
        affiliateBalance: Number(user.affiliateBalance),
        affiliatePaid: Number(user.affiliatePaid),
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
    // Mengembalikan undefined secara diam-diam agar tidak merusak seluruh aplikasi jika DB tidak terjangkau.
    // Error sudah dicatat di log server untuk debugging.
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

        // Cek apakah password yang tersimpan adalah hash bcrypt
        if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
            passwordMatch = await bcrypt.compare(password, storedPassword);
        } else {
            // Fallback untuk password plaintext (untuk pengguna lama/default)
            passwordMatch = (storedPassword === password);
        }

        if (passwordMatch) {
            if (user.role !== 'admin' && user.status === 'inactive') {
                throw new Error('ACCOUNT_INACTIVE');
            }
            
            // Lazy migration: Jika password masih plaintext, hash dan update sekarang
            if (!storedPassword.startsWith('$2a$') && !storedPassword.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
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
                customDomain: user.customDomain,
            };
        }

        return null; // Kata sandi salah
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || 3306;
            console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
        } else if (error instanceof Error && error.message === 'ACCOUNT_INACTIVE') {
            throw error; // Lemparkan kembali error spesifik ini
        } else {
            console.error("🔴 Error saat validasi pengguna di validateUser:", error);
        }
        // Lemparkan kembali error asli untuk debugging.
        throw error;
    }
}
