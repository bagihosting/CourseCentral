
'use server';

import { pool } from '@/lib/db';
import type { User, RegisterUserInput, UpdateUserInput } from '@/types';
import { getUserById } from '@/actions/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

function generateReferralCode(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

export async function getAllUsers(): Promise<User[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users ORDER BY createdAt DESC');
  return rows.map(row => ({
      ...row,
      affiliateBalance: Number(row.affiliateBalance),
      affiliatePaid: Number(row.affiliatePaid),
      loginCount: Number(row.loginCount),
      lessonsCreatedToday: Number(row.lessons_created_today),
      lastLessonCreatedAt: row.last_lesson_created_at ? new Date(row.last_lesson_created_at).toISOString() : null
  })) as User[];
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
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

export async function reactivateUser(id: string): Promise<void> {
    await pool.query('UPDATE users SET status = "active" WHERE id = ?', [id]);
}
