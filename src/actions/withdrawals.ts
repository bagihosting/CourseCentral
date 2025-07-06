
'use server';

import { pool } from '@/lib/db';
import { getUserById } from './auth';
import type { WithdrawalRequest, User } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const MIN_INSTRUCTOR_AGE_DAYS = 40;

type WithdrawalInput = Pick<WithdrawalRequest, 'amount' | 'bankName' | 'accountHolder' | 'accountNumber'>;

export async function createWithdrawalRequest(data: WithdrawalInput, userId: string): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // SECURITY: Fetch the user's current balance directly from the database within a transaction.
        // This ensures we are working with the real, server-side balance, not a value from the client that could be manipulated.
        // The `FOR UPDATE` clause locks the row to prevent race conditions (e.g., two simultaneous withdrawal requests).
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT role, createdAt, affiliateBalance FROM users WHERE id = ? FOR UPDATE', [userId]);
        if (userRows.length === 0) throw new Error('Pengguna tidak ditemukan.');
        const user = userRows[0];
        
        // --- 1. Validate Eligibility ---
        const memberSinceDays = (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24);
        const isEligible = user.role === 'pro' || user.role === 'admin' || (user.role === 'instructor' && memberSinceDays >= MIN_INSTRUCTOR_AGE_DAYS);
        
        if (!isEligible) {
            throw new Error(`Anda tidak memenuhi syarat. Anda harus menjadi member Pro atau menjadi Pengajar selama lebih dari ${MIN_INSTRUCTOR_AGE_DAYS} hari.`);
        }

        // --- 2. CRITICAL: Server-Side Balance Validation ---
        // This is the most important security check. It compares the requested amount against the true balance from the database.
        // Even if a user alters the balance displayed on the frontend, this server-side check will fail, preventing fraud.
        if (Number(user.affiliateBalance) < data.amount) {
            throw new Error('Saldo Anda tidak mencukupi untuk jumlah penarikan yang diminta.');
        }

        // --- 3. Check for Pending Requests ---
        const [pendingRows] = await connection.query<RowDataPacket[]>('SELECT id FROM withdrawal_requests WHERE userId = ? AND status = "pending"', [userId]);
        if (pendingRows.length > 0) {
            throw new Error('Anda sudah memiliki permintaan penarikan yang sedang diproses.');
        }

        // --- 4. Create Request ---
        const id = `wdrl_${Date.now()}`;
        await connection.query(
            'INSERT INTO withdrawal_requests (id, userId, amount, bankName, accountHolder, accountNumber) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, data.amount, data.bankName, data.accountHolder, data.accountNumber]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Failed to create withdrawal request:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export type PopulatedWithdrawalRequest = WithdrawalRequest & {
    userName: string;
    userAvatar: string;
    userBalance: number;
};

export async function getWithdrawalRequests(): Promise<PopulatedWithdrawalRequest[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT w.*, u.name as userName, u.avatarUrl as userAvatar, u.affiliateBalance as userBalance
        FROM withdrawal_requests w
        JOIN users u ON w.userId = u.id
        ORDER BY w.status = 'pending' DESC, w.requestDate DESC
    `);
    
    return rows.map(row => ({
        ...row,
        amount: Number(row.amount),
        userBalance: Number(row.userBalance),
        requestDate: new Date(row.requestDate).toISOString(),
        processedAt: row.processedAt ? new Date(row.processedAt).toISOString() : undefined,
    })) as PopulatedWithdrawalRequest[];
}

export async function getWithdrawalRequestsForUser(userId: string): Promise<WithdrawalRequest[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM withdrawal_requests WHERE userId = ? ORDER BY requestDate DESC', [userId]);
    return rows.map(row => ({
        ...row,
        amount: Number(row.amount),
        requestDate: new Date(row.requestDate).toISOString(),
        processedAt: row.processedAt ? new Date(row.processedAt).toISOString() : undefined,
    })) as WithdrawalRequest[];
}

export async function approveWithdrawalRequest(requestId: string): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [requestRows] = await connection.query<RowDataPacket[]>('SELECT * FROM withdrawal_requests WHERE id = ? AND status = "pending" FOR UPDATE', [requestId]);
        if (requestRows.length === 0) throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        const request = requestRows[0];

        const [userRows] = await connection.query<RowDataPacket[]>('SELECT affiliateBalance FROM users WHERE id = ? FOR UPDATE', [request.userId]);
        if (userRows.length === 0) throw new Error('Pengguna tidak ditemukan.');
        const user = userRows[0];

        if (Number(user.affiliateBalance) < Number(request.amount)) {
            throw new Error('Saldo pengguna tidak mencukupi.');
        }

        // Deduct balance and add to paid
        await connection.query(
            'UPDATE users SET affiliateBalance = affiliateBalance - ?, affiliatePaid = affiliatePaid + ? WHERE id = ?',
            [request.amount, request.amount, request.userId]
        );

        // Update request status
        await connection.query(
            "UPDATE withdrawal_requests SET status = 'approved', processedAt = NOW() WHERE id = ?",
            [requestId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Failed to approve withdrawal request:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function rejectWithdrawalRequest(requestId: string, adminNotes: string): Promise<void> {
    await pool.query(
        "UPDATE withdrawal_requests SET status = 'rejected', adminNotes = ?, processedAt = NOW() WHERE id = ? AND status = 'pending'",
        [adminNotes, requestId]
    );
}
