
'use server';

import { pool } from '@/lib/db';
import type { InstructorApplication, InstructorBranding } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function applyForInstructor(userId: string): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM instructor_applications WHERE userId = ? AND status IN ("pending", "approved")', [userId]);
        if (existing.length > 0) {
            throw new Error('Anda sudah memiliki permintaan yang aktif atau sudah disetujui.');
        }

        const id = `iapp_${Date.now()}`;
        await connection.query('INSERT INTO instructor_applications (id, userId, requestDate, status) VALUES (?, ?, NOW(), "pending")', [id, userId]);
        await connection.query('UPDATE users SET instructorStatus = "pending" WHERE id = ?', [userId]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal mengajukan diri sebagai pengajar:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function getInstructorApplications(): Promise<InstructorApplication[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT ia.id, ia.userId, ia.requestDate, ia.status, u.name as userName, u.avatarUrl as userAvatar
        FROM instructor_applications ia
        JOIN users u ON ia.userId = u.id
        WHERE ia.status = 'pending'
        ORDER BY ia.requestDate ASC
    `);
    return rows.map(row => ({
        ...row,
        requestDate: new Date(row.requestDate).toISOString(),
    })) as InstructorApplication[];
}


export async function approveInstructorApplication(applicationId: string): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [appRows] = await connection.query<RowDataPacket[]>('SELECT userId FROM instructor_applications WHERE id = ? AND status = "pending"', [applicationId]);
        if(appRows.length === 0) {
            throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        }
        const userId = appRows[0].userId;

        await connection.query("UPDATE instructor_applications SET status = 'approved' WHERE id = ?", [applicationId]);
        await connection.query("UPDATE users SET role = 'instructor', instructorStatus = 'approved' WHERE id = ?", [userId]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal menyetujui permintaan pengajar:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function rejectInstructorApplication(applicationId: string): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [appRows] = await connection.query<RowDataPacket[]>('SELECT userId FROM instructor_applications WHERE id = ? AND status = "pending"', [applicationId]);
        if(appRows.length === 0) {
            throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        }
        const userId = appRows[0].userId;

        await connection.query("UPDATE instructor_applications SET status = 'rejected' WHERE id = ?", [applicationId]);
        await connection.query("UPDATE users SET instructorStatus = 'rejected' WHERE id = ?", [userId]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal menolak permintaan pengajar:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function getInstructorBranding(userId: string): Promise<InstructorBranding | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM instructor_branding WHERE userId = ?', [userId]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0] as InstructorBranding;
}

export async function saveInstructorBranding(userId: string, data: Partial<Omit<InstructorBranding, 'userId'>>): Promise<void> {
    const existing = await getInstructorBranding(userId);

    const { customDomain, brandName, brandLogoUrl, brandPrimaryColor } = data;

    if (existing) {
        await pool.query(
            'UPDATE instructor_branding SET customDomain = ?, brandName = ?, brandLogoUrl = ?, brandPrimaryColor = ? WHERE userId = ?',
            [customDomain, brandName, brandLogoUrl, brandPrimaryColor, userId]
        );
    } else {
        await pool.query(
            'INSERT INTO instructor_branding (userId, customDomain, brandName, brandLogoUrl, brandPrimaryColor) VALUES (?, ?, ?, ?, ?)',
            [userId, customDomain, brandName, brandLogoUrl, brandPrimaryColor]
        );
    }
}
