
import { getPool } from '@/lib/db';
import type { User, RegisterUserInput, UpdateUserInput } from '@/types';
import type { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getActiveTenantId } from '@/actions/utils';

function generateReferralCode(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

function mapRowToUser(row: RowDataPacket): User {
  const user = { ...row } as User;
  delete user.password; // Ensure password hash is never returned
  return {
    ...user,
    affiliateBalance: Number(row.affiliateBalance),
    affiliatePaid: Number(row.affiliatePaid),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
    lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toISOString() : null,
    loginCount: Number(row.loginCount),
    lessonsCreatedToday: Number(row.lessons_created_today),
    lastLessonCreatedAt: row.last_lesson_created_at ? new Date(row.last_lesson_created_at).toISOString() : null,
  };
}

function mapRowToUserWithPassword(row: RowDataPacket): User {
    // This function is for internal use where password hash is needed (e.g., validation)
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

export async function fetchAllUsersFromDb(tenantId: string): Promise<User[]> {
    const pool = getPool();
    if (tenantId === 'platform_main') {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users ORDER BY createdAt DESC');
        return rows.map(mapRowToUser);
    }
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE tenant_id = ? ORDER BY createdAt DESC', [tenantId]);
    return rows.map(mapRowToUser);
}

export async function fetchUserById(id: string): Promise<User | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return mapRowToUser(rows[0]);
}

export async function fetchUserByUsername(username: string): Promise<User | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return null;
    return mapRowToUserWithPassword(rows[0]);
}

export async function fetchUserByReferralCode(referralCode: string): Promise<Pick<User, 'name'> | null> {
    const pool = getPool();
    const tenantId = await getActiveTenantId();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT name FROM users WHERE referralCode = ? AND tenant_id = ?', [referralCode, tenantId]);
    if (rows.length > 0) {
      return rows[0] as Pick<User, 'name'>;
    }
    return null;
}

export async function createUserInDb(data: RegisterUserInput): Promise<User> {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const tenantId = await getActiveTenantId();

        const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [data.username]);
        if (existing.length > 0) {
            throw new Error('Nama pengguna sudah digunakan.');
        }

        const newId = `user_${Date.now()}`;
        const referralCode = generateReferralCode();
        const hashedPassword = await bcrypt.hash(data.password, 10);

        await connection.query(
            'INSERT INTO users (id, tenant_id, name, username, password, whatsapp, role, avatarUrl, referralCode, referredBy) VALUES (?, ?, ?, ?, ?, ?, "member", ?, ?, ?)',
            [newId, tenantId, data.name, data.username, hashedPassword, data.whatsapp, data.avatarUrl || 'https://placehold.co/256x256.png', referralCode, data.referredBy]
        );
        
        await connection.commit();

        const newUser = await fetchUserById(newId);
        if (!newUser) throw new Error('Gagal memverifikasi pengguna baru.');
        return newUser;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateUserInDb(id: string, data: UpdateUserInput): Promise<User> {
    const pool = getPool();
    const fieldsToUpdate: { [key: string]: any } = { ...data };
    
    if (fieldsToUpdate.password) {
        fieldsToUpdate.password = await bcrypt.hash(fieldsToUpdate.password, 10);
    }

    const fieldEntries = Object.entries(fieldsToUpdate).filter(([key, value]) => value !== undefined && key !== 'id');
    if (fieldEntries.length === 0) {
      const user = await fetchUserById(id);
      if(!user) throw new Error("Pengguna tidak ditemukan");
      return user;
    }

    const querySet = fieldEntries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const queryValues = fieldEntries.map(([, value]) => value);

    await pool.query(`UPDATE users SET ${querySet} WHERE id = ?`, [...queryValues, id]);

    const updatedUser = await fetchUserById(id);
    if (!updatedUser) throw new Error('Gagal mengambil data pengguna setelah diperbarui.');
    return updatedUser;
}

export async function updateUserLoginStatus(userId: string): Promise<User> {
    const pool = getPool();
    const [userRows] = await pool.query<RowDataPacket[]>('SELECT loginCount FROM users WHERE id = ?', [userId]);
    const user = userRows[0];

    const newLoginCount = (Number(user.loginCount) || 0) + 1;
    await pool.query(
        'UPDATE users SET lastLoginAt = NOW(), loginCount = ?, status = ? WHERE id = ?',
        [newLoginCount, 'active', userId]
    );

    const updatedUser = await fetchUserById(userId);
    if (!updatedUser) throw new Error("Gagal mengambil data pengguna setelah login.");
    return updatedUser;
}

export async function deleteUserFromDb(id: string): Promise<void> {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
}
