
'use server';

import { getPool } from '@/lib/db';
import type { User, RegisterUserInput, UpdateUserInput } from '@/types';
import { getUserById } from '@/actions/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getAuthUser, getActiveTenantId } from './utils';
import { validatePassword } from '@/lib/validation';

function generateReferralCode(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

export async function getAllUsers(): Promise<User[]> {
  const pool = getPool();
  const actor = await getAuthUser();

  try {
    if (actor.tenant_id === 'platform_main' && actor.role === 'admin') {
       const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT * FROM users ORDER BY createdAt DESC
       `);
       return rows.map(mapRowToUser);
    }
    
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT *
      FROM users
      WHERE tenant_id = ?
      ORDER BY createdAt DESC
    `, [actor.tenant_id]);
    return rows.map(mapRowToUser);
  } catch (error) {
    console.error("🔴 Gagal mengambil semua pengguna:", error);
    throw error;
  }
}

function mapRowToUser(row: RowDataPacket): User {
  return {
    ...row,
    affiliateBalance: Number(row.affiliateBalance),
    affiliatePaid: Number(row.affiliatePaid),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toISOString() : null,
    loginCount: Number(row.loginCount),
    lessonsCreatedToday: Number(row.lessons_created_today),
    lastLessonCreatedAt: row.last_lesson_created_at ? new Date(row.last_lesson_created_at).toISOString() : null,
  } as User;
}

export async function getUserByReferralCode(referralCode: string): Promise<Pick<User, 'name'> | null> {
  if (!referralCode) return null;
  const pool = getPool();
  const tenantId = await getActiveTenantId();
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT name FROM users WHERE referralCode = ? AND tenant_id = ?', [referralCode, tenantId]);
    if (rows.length > 0) {
      return rows[0] as Pick<User, 'name'>;
    }
    return null;
  } catch (error) {
    console.error(`🔴 Gagal mengambil pengguna dengan kode referral ${referralCode}:`, error);
    throw error;
  }
}

export async function registerUser(data: RegisterUserInput): Promise<User> {
    const pool = getPool();
    const tenantId = await getActiveTenantId();

    if (!validatePassword(data.password)) {
      throw new Error('Kata sandi tidak memenuhi persyaratan keamanan.');
    }

    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [data.username]);
    if (existing.length > 0) {
        throw new Error('Nama pengguna sudah digunakan.');
    }

    const newId = `user_${Date.now()}`;
    const referralCode = generateReferralCode();
    
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await pool.query(
        'INSERT INTO users (id, tenant_id, name, username, password, whatsapp, role, avatarUrl, referralCode, referredBy) VALUES (?, ?, ?, ?, ?, ?, "member", ?, ?, ?)',
        [newId, tenantId, data.name, data.username, hashedPassword, data.whatsapp, data.avatarUrl || 'https://placehold.co/256x256.png', referralCode, data.referredBy]
    );

    const newUser = await getUserById(newId);
    if (!newUser) throw new Error('Gagal memverifikasi pengguna baru.');
    return newUser;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const pool = getPool();
    const actor = await getAuthUser();

    // Security check: Only admins can update other users. Users can only update themselves.
    if (actor.id !== id && actor.role !== 'admin') {
      throw new Error("Anda tidak memiliki izin untuk mengubah pengguna ini.");
    }
    
    // Fetch the user being updated to check their tenant
    const userToUpdate = await getUserById(id);
    if (!userToUpdate) {
      throw new Error("Pengguna yang akan diupdate tidak ditemukan.");
    }

    // Security check for multi-tenancy: Tenant admin can only update users within their own tenant.
    if (actor.tenant_id !== 'platform_main' && userToUpdate.tenant_id !== actor.tenant_id) {
        throw new Error("Akses ditolak. Anda tidak dapat mengubah pengguna di tenant lain.");
    }

    const fieldsToUpdate: { [key: string]: any } = { ...data };
    
    if (fieldsToUpdate.password) {
        if (!validatePassword(fieldsToUpdate.password)) {
          throw new Error('Kata sandi tidak memenuhi persyaratan keamanan.');
        }
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

    const querySet = fieldEntries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const queryValues = fieldEntries.map(([, value]) => value);

    await pool.query(`UPDATE users SET ${querySet} WHERE id = ?`, [...queryValues, id]);

    const updatedUser = await getUserById(id);
    if (!updatedUser) throw new Error('Gagal mengambil data pengguna setelah diperbarui.');
    return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang bisa menghapus pengguna.");
    if(actor.id === id) throw new Error("Aksi tidak diizinkan: Anda tidak dapat menghapus akun Anda sendiri.");
    
    // Fetch user to be deleted to check tenant_id
    const userToDelete = await getUserById(id);
    if (!userToDelete) {
        return; // User already gone
    }

    // Security check for multi-tenancy
    if (actor.tenant_id !== 'platform_main' && userToDelete.tenant_id !== actor.tenant_id) {
        throw new Error("Akses ditolak. Anda tidak dapat menghapus pengguna di tenant lain.");
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

export async function reactivateUser(id: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang bisa mengaktifkan pengguna.");
    
    // Fetch user to be reactivated to check tenant_id
    const userToReactivate = await getUserById(id);
    if (!userToReactivate) {
        throw new Error("Pengguna tidak ditemukan.");
    }

    // Security check for multi-tenancy
    if (actor.tenant_id !== 'platform_main' && userToReactivate.tenant_id !== actor.tenant_id) {
        throw new Error("Akses ditolak. Anda tidak dapat mengaktifkan pengguna di tenant lain.");
    }

    await pool.query('UPDATE users SET status = "active" WHERE id = ?', [id]);
}
