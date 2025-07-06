'use server';

import { pool } from '@/lib/db';
import type { User, RegisterUserInput, UpdateUserInput } from '@/types';
import { getUserById } from '@/actions/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

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
  })) as User[];
}

export async function registerUser(data: RegisterUserInput): Promise<User> {
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [data.username]);
    if (existing.length > 0) {
        throw new Error('Nama pengguna sudah digunakan.');
    }

    const newId = `user_${Date.now()}`;
    const referralCode = generateReferralCode();
    
    // In a real app, hash the password: const hashedPassword = await bcrypt.hash(data.password, 10);
    const hashedPassword = data.password; // For simplicity, using plain text as in the original project

    await pool.query(
        'INSERT INTO users (id, name, username, password, whatsapp, role, avatarUrl, referralCode, referredBy) VALUES (?, ?, ?, ?, ?, "member", ?, ?, ?)',
        [newId, data.name, data.username, hashedPassword, data.whatsapp, data.avatarUrl || 'https://placehold.co/256x256.png', referralCode, data.referredBy]
    );

    const newUser = await getUserById(newId);
    if (!newUser) throw new Error('Gagal memverifikasi pengguna baru.');
    return newUser;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const fieldsToUpdate = { ...data };
    
    if (fieldsToUpdate.password) {
        // In a real app, hash the password
        fieldsToUpdate.password = fieldsToUpdate.password;
    }

    const fieldEntries = Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined);
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
    // Foreign key constraints with ON DELETE CASCADE should handle related data
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

export async function reactivateUser(id: string): Promise<void> {
    await pool.query('UPDATE users SET status = "active" WHERE id = ?', [id]);
}
