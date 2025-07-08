
'use server';

import { pool } from '@/lib/db';
import type { User, RegisterUserInput, UpdateUserInput } from '@/types';
import { getUserById } from '@/actions/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getAuthUser } from './utils';

function generateReferralCode(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT u.*, ib.customDomain
      FROM users u
      LEFT JOIN instructor_branding ib ON u.id = ib.userId
      ORDER BY u.createdAt DESC
    `);
    return rows.map(row => ({
        ...row,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
        lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toISOString() : '',
        affiliateBalance: Number(row.affiliateBalance),
        affiliatePaid: Number(row.affiliatePaid),
        loginCount: Number(row.loginCount),
        lessonsCreatedToday: Number(row.lessons_created_today),
        lastLessonCreatedAt: row.last_lesson_created_at ? new Date(row.last_lesson_created_at).toISOString() : null,
        customDomain: row.customDomain
    })) as User[];
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
    } else {
        console.error("🔴 Gagal mengambil semua pengguna:", error);
    }
    return [];
  }
}

export async function getUserByReferralCode(referralCode: string): Promise<Pick<User, 'name'> | null> {
  if (!referralCode) return null;
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT name FROM users WHERE referralCode = ?', [referralCode]);
    if (rows.length > 0) {
      return rows[0] as Pick<User, 'name'>;
    }
    return null;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
    } else {
        console.error(`🔴 Gagal mengambil pengguna dengan kode referral ${referralCode}:`, error);
    }
    return null;
  }
}

export async function registerUser(data: RegisterUserInput): Promise<User> {
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [data.username]);
    if (existing.length > 0) {
        throw new Error('Nama pengguna sudah digunakan.');
    }

    const newId = `user_${Date.now()}`;
    const referralCode = generateReferralCode();
    
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await pool.query(
        'INSERT INTO users (id, name, username, password, whatsapp, role, avatarUrl, referralCode, referredBy) VALUES (?, ?, ?, ?, ?, "member", ?, ?, ?)',
        [newId, data.name, data.username, hashedPassword, data.whatsapp, data.avatarUrl || 'https://placehold.co/256x256.png', referralCode, data.referredBy]
    );

    const newUser = await getUserById(newId);
    if (!newUser) throw new Error('Gagal memverifikasi pengguna baru.');
    return newUser;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const fieldsToUpdate: { [key: string]: any } = { ...data };
    
    if (fieldsToUpdate.password) {
        fieldsToUpdate.password = await bcrypt.hash(fieldsToUpdate.password, 10);
    } else {
        delete fieldsToUpdate.password;
    }

    const fieldEntries = Object.entries(fieldsToUpdate).filter(([, value]) => value !== undefined);
    if (fieldEntries.length === 0) {
      const user = await getUserById(id);
      if(!user) throw new Error("Pengguna tidak ditemukan");
      return user;
    }

    const querySet = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const queryValues = fieldEntries.map(([, value]) => value);

    await pool.query(`UPDATE users SET ${querySet} WHERE id = ?`, [...queryValues, id]);

    const updatedUser = await getUserById(id);
    if (!updatedUser) throw new Error('Gagal mengambil data pengguna setelah diperbarui.');
    return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang bisa menghapus pengguna.");
    if(actor.id === id) throw new Error("Anda tidak bisa menghapus akun Anda sendiri.");
    
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

export async function reactivateUser(id: string): Promise<void> {
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang bisa mengaktifkan pengguna.");
    await pool.query('UPDATE users SET status = "active" WHERE id = ?', [id]);
}
