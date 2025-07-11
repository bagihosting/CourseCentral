
'use server';

import { getPool } from '@/lib/db';
import type { InstructorApplication } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getAuthUser } from './utils';

export async function applyForInstructor(userId: string): Promise<void> {
    const pool = getPool();
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
    const pool = getPool();
    const actor = await getAuthUser();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT ia.id, ia.userId, ia.requestDate, ia.status, u.name as userName, u.avatarUrl as userAvatar
            FROM instructor_applications ia
            JOIN users u ON ia.userId = u.id
            WHERE ia.status = 'pending' AND u.tenant_id = ?
            ORDER BY ia.requestDate ASC
        `, [actor.tenant_id]);
        return rows.map(row => ({
            ...row,
            requestDate: new Date(row.requestDate).toISOString(),
        })) as InstructorApplication[];
    } catch(error) {
        console.error('Error fetching instructor applications:', error);
        throw error;
    }
}


export async function approveInstructorApplication(applicationId: string): Promise<void> {
    const pool = getPool();
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
    const pool = getPool();
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
