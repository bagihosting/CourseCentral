
'use server';

import { getPool } from '@/lib/db';
import type { UpgradeRequest, CertificateRequest, CustomAppRequest } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getAuthUser } from './utils';
import { awardReferralCommission } from './affiliate';

// --- Upgrade Requests ---
export type PopulatedUpgradeRequest = UpgradeRequest & {
    userName: string;
    userAvatar: string;
    userWhatsapp: string | undefined;
};

export async function createUpgradeRequest(userId: string, bankName: string, accountHolder: string): Promise<void> {
    const pool = getPool();
    const existingRequest = await getUpgradeRequestByUserId(userId);
    if (existingRequest) {
        throw new Error('Anda sudah memiliki permintaan upgrade yang aktif.');
    }
    const id = `upg_${Date.now()}`;
    await pool.query('INSERT INTO upgrade_requests (id, userId, bankName, accountHolder, requestDate) VALUES (?, ?, ?, ?, NOW())', [id, userId, bankName, accountHolder]);
}

export async function getUpgradeRequests(): Promise<PopulatedUpgradeRequest[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT ur.*, u.name as userName, u.avatarUrl as userAvatar, u.whatsapp as userWhatsapp
        FROM upgrade_requests ur
        JOIN users u ON ur.userId = u.id
        ORDER BY ur.requestDate DESC
    `);
    return rows.map(row => ({
        ...row,
        requestDate: new Date(row.requestDate).toISOString()
    })) as PopulatedUpgradeRequest[];
}

export async function getUpgradeRequestByUserId(userId: string): Promise<UpgradeRequest | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM upgrade_requests WHERE userId = ? AND status = "pending"', [userId]);
    if (rows.length === 0) return null;
    return { ...rows[0], requestDate: new Date(rows[0].requestDate).toISOString() } as UpgradeRequest;
}

export async function cancelUpgradeRequest(userId: string): Promise<void> {
    const pool = getPool();
    await pool.query('DELETE FROM upgrade_requests WHERE userId = ? AND status = "pending"', [userId]);
}

export async function approveUpgrade(requestId: string): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [requestRows] = await connection.query<RowDataPacket[]>('SELECT * FROM upgrade_requests WHERE id = ? AND status = "pending" FOR UPDATE', [requestId]);
        if (requestRows.length === 0) {
            throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        }
        const request = requestRows[0];
        
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT role, referredBy FROM users WHERE id = ?', [request.userId]);
        if (userRows.length === 0) throw new Error('Pengguna tidak ditemukan.');

        const user = userRows[0];
        if (user.role === 'pro' || user.role === 'admin' || user.role === 'instructor') {
            await connection.query('UPDATE upgrade_requests SET status = "approved" WHERE id = ?', [requestId]);
            await connection.commit();
            return;
        }
        
        await connection.query('UPDATE users SET role = "pro" WHERE id = ?', [request.userId]);
        
        await connection.query('UPDATE upgrade_requests SET status = "approved" WHERE id = ?', [requestId]);
        
        // Award commission if referred
        if (user.referredBy) {
            const [referrerRows] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE referralCode = ?', [user.referredBy]);
            if (referrerRows.length > 0) {
                const referrerId = referrerRows[0].id;
                await awardReferralCommission(request.userId, referrerId, connection);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal menyetujui upgrade:", error);
        throw error;
    } finally {
        connection.release();
    }
}


// --- Certificate Requests ---
export type PopulatedCertificateRequest = CertificateRequest & {
    userName: string;
    userAvatar: string;
    courseTitle: string;
};

export async function createCertificateRequest(userId: string, courseId: string): Promise<void> {
    const pool = getPool();
    const existing = await hasUserRequestedCertificate(userId, courseId);
    if(existing) throw new Error("Anda sudah pernah meminta sertifikat untuk kursus ini.");

    const id = `certreq_${Date.now()}`;
    await pool.query('INSERT INTO certificate_requests (id, userId, courseId, requestDate) VALUES (?, ?, ?, NOW())', [id, userId, courseId]);
}

export async function hasUserRequestedCertificate(userId: string, courseId: string): Promise<boolean> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM certificate_requests WHERE userId = ? AND courseId = ? LIMIT 1', [userId, courseId]);
    return rows.length > 0;
}

export async function getCertificateRequests(): Promise<PopulatedCertificateRequest[]> {
     const pool = getPool();
     const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT cr.*, u.name as userName, u.avatarUrl as userAvatar, c.title as courseTitle
        FROM certificate_requests cr
        JOIN users u ON cr.userId = u.id
        JOIN courses c ON cr.courseId = c.id
        ORDER BY cr.requestDate DESC
    `);
    return rows.map(row => ({
        ...row,
        requestDate: new Date(row.requestDate).toISOString(),
        approvedAt: row.approvedAt ? new Date(row.approvedAt).toISOString() : undefined,
    })) as PopulatedCertificateRequest[];
}

export async function getApprovedCertificatesForUser(userId: string): Promise<PopulatedCertificateRequest[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT cr.*, u.name as userName, u.avatarUrl as userAvatar, c.title as courseTitle
        FROM certificate_requests cr
        JOIN users u ON cr.userId = u.id
        JOIN courses c ON cr.courseId = c.id
        WHERE cr.userId = ? AND cr.status = 'approved'
        ORDER BY cr.approvedAt DESC
    `, [userId]);
    return rows.map(row => ({
        ...row,
        requestDate: new Date(row.requestDate).toISOString(),
        approvedAt: row.approvedAt ? new Date(row.approvedAt).toISOString() : undefined,
    })) as PopulatedCertificateRequest[];
}

export async function approveCertificateRequest(requestId: string, certificateHtml: string): Promise<void> {
    const pool = getPool();
    await pool.query(
        'UPDATE certificate_requests SET status = "approved", certificateHtml = ?, approvedAt = NOW() WHERE id = ? AND status = "pending"',
        [certificateHtml, requestId]
    );
}

export async function awardCertificateToUser(userId: string, courseId: string, certificateHtml: string): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM certificate_requests WHERE userId = ? AND courseId = ?', [userId, courseId]);
        if (existing.length > 0) {
            const requestId = existing[0].id;
            await connection.query(
                'UPDATE certificate_requests SET status = "approved", certificateHtml = ?, approvedAt = NOW() WHERE id = ?',
                [certificateHtml, requestId]
            );
        } else {
            const requestId = `certreq_${Date.now()}`;
            await connection.query(
                'INSERT INTO certificate_requests (id, userId, courseId, requestDate, status, certificateHtml, approvedAt) VALUES (?, ?, ?, NOW(), "approved", ?, NOW())',
                [requestId, userId, courseId, certificateHtml]
            );
        }
        await connection.commit();
    } catch(e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
}

// --- Custom App Requests ---
export type PopulatedCustomAppRequest = CustomAppRequest & {
    userName: string;
    userAvatar: string;
};

export async function createCustomAppRequest(userId: string, appName: string, appKeywords: string, topology: any, paymentDetails: any): Promise<void> {
    const pool = getPool();
    const id = `appreq_${Date.now()}`;
    await pool.query('INSERT INTO custom_app_requests (id, userId, appName, appKeywords, topology, paymentDetails, requestDate) VALUES (?, ?, ?, ?, ?, ?, NOW())',
     [id, userId, appName, appKeywords, JSON.stringify(topology), JSON.stringify(paymentDetails)]);
}

export async function getCustomAppRequests(): Promise<PopulatedCustomAppRequest[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT car.*, u.name as userName, u.avatarUrl as userAvatar
        FROM custom_app_requests car
        JOIN users u ON car.userId = u.id
        ORDER BY car.requestDate DESC
    `);
    return rows.map(row => ({
        ...row,
        requestDate: new Date(row.requestDate).toISOString(),
        topology: JSON.parse(row.topology || '{}'),
        paymentDetails: JSON.parse(row.paymentDetails || '{}'),
    })) as PopulatedCustomAppRequest[];
}

export async function getCustomAppRequestsForUser(userId: string): Promise<CustomAppRequest[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM custom_app_requests WHERE userId = ? ORDER BY requestDate DESC', [userId]);
    return rows.map(row => ({
        ...row,
        requestDate: new Date(row.requestDate).toISOString(),
        topology: JSON.parse(row.topology || '{}'),
        paymentDetails: JSON.parse(row.paymentDetails || '{}'),
    })) as CustomAppRequest[];
}

export async function approveCustomAppRequest(requestId: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if (actor.role !== 'admin') throw new Error("Hanya admin yang dapat menyetujui permintaan.");
    await pool.query(`UPDATE custom_app_requests SET status = 'in_progress' WHERE id = ? AND status = 'pending_approval'`, [requestId]);
}

export async function completeCustomAppRequest(requestId: string, resultLink: string, adminNotes: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if (actor.role !== 'admin') throw new Error("Hanya admin yang dapat menyelesaikan permintaan.");
    await pool.query(`UPDATE custom_app_requests SET status = 'completed', resultLink = ?, adminNotes = ? WHERE id = ? AND status = 'in_progress'`, [resultLink, adminNotes, requestId]);
}
