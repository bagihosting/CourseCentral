
'use server';

import { getPool } from '@/lib/db';
import type { User, Commission, WithdrawalRequest, AffiliateStat } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { getAuthUser } from './utils';

const REFERRAL_COMMISSION = 25000;
export const INSTRUCTOR_MILESTONE_COMMISSION = 25000;

export async function awardReferralCommission(referredUserId: string, referrerId: string, connection: PoolConnection): Promise<void> {
    const commissionId = `comm_${Date.now()}`;
    await connection.query(
        'INSERT INTO commissions (id, userId, amount, type, sourceUserId) VALUES (?, ?, ?, "referral", ?)',
        [commissionId, referrerId, REFERRAL_COMMISSION, referredUserId]
    );
    await connection.query(
        'UPDATE users SET affiliateBalance = affiliateBalance + ? WHERE id = ?',
        [REFERRAL_COMMISSION, referrerId]
    );
}

export async function getAffiliateStatsForUser(userId: string): Promise<{
    referralCount: number;
    unpaidBalance: number;
    totalPaid: number;
}> {
    const pool = getPool();
    try {
        const [userRows] = await pool.query<RowDataPacket[]>('SELECT affiliateBalance, affiliatePaid FROM users WHERE id = ?', [userId]);
        const [referralRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users WHERE referredBy = (SELECT referralCode FROM users WHERE id = ?)', [userId]);
        
        if (userRows.length === 0) return { referralCount: 0, unpaidBalance: 0, totalPaid: 0 };
        
        return {
            referralCount: referralRows[0].count,
            unpaidBalance: Number(userRows[0].affiliateBalance),
            totalPaid: Number(userRows[0].affiliatePaid)
        };
    } catch (error) {
        console.error("Gagal mengambil statistik afiliasi:", error);
        throw error;
    }
}

export async function getCommissionHistory(userId: string): Promise<Commission[]> {
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT c.*, u.name AS sourceUserName 
            FROM commissions c
            LEFT JOIN users u ON c.sourceUserId = u.id
            WHERE c.userId = ? 
            ORDER BY c.createdAt DESC
        `, [userId]);
        return rows.map(row => ({
            ...row,
            amount: Number(row.amount),
            createdAt: new Date(row.createdAt).toISOString(),
        })) as Commission[];
    } catch (error) {
        console.error("Gagal mengambil riwayat komisi:", error);
        throw error;
    }
}

export async function getWithdrawalHistory(userId: string): Promise<WithdrawalRequest[]> {
    const pool = getPool();
    try {
         const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM withdrawal_requests WHERE userId = ? ORDER BY requestDate DESC', [userId]);
         return rows.map(row => ({
             ...row,
             amount: Number(row.amount),
             bankDetails: JSON.parse(row.bankDetails || '{}'),
             requestDate: new Date(row.requestDate).toISOString(),
             processedDate: row.processedDate ? new Date(row.processedDate).toISOString() : null,
         })) as WithdrawalRequest[];
    } catch (error) {
        console.error("Gagal mengambil riwayat penarikan:", error);
        throw error;
    }
}

export async function requestWithdrawal(bankDetails: WithdrawalRequest['bankDetails']): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const user = await getAuthUser(connection);
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT affiliateBalance FROM users WHERE id = ? FOR UPDATE', [user.id]);
        
        if (userRows.length === 0) throw new Error("Pengguna tidak ditemukan.");
        
        const balance = Number(userRows[0].affiliateBalance);
        if (balance <= 0) {
            throw new Error("Saldo Anda tidak mencukupi untuk melakukan penarikan.");
        }

        const [existingPending] = await connection.query<RowDataPacket[]>('SELECT id FROM withdrawal_requests WHERE userId = ? AND status = "pending"', [user.id]);
        if(existingPending.length > 0) {
            throw new Error("Anda sudah memiliki permintaan penarikan yang sedang diproses.");
        }

        const withdrawalId = `wd_${Date.now()}`;
        
        // Create withdrawal request
        await connection.query(
            'INSERT INTO withdrawal_requests (id, userId, amount, bankDetails, status, requestDate) VALUES (?, ?, ?, ?, "pending", NOW())',
            [withdrawalId, user.id, balance, JSON.stringify(bankDetails)]
        );

        // Deduct from balance
        await connection.query(
            'UPDATE users SET affiliateBalance = 0 WHERE id = ?',
            [user.id]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal meminta penarikan:", error);
        throw error;
    } finally {
        connection.release();
    }
}


// --- Admin Actions ---

export async function getAffiliateStats(): Promise<AffiliateStat[]> {
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                u.id as userId, 
                u.name as userName, 
                u.affiliateBalance as unpaidBalance, 
                u.affiliatePaid as totalPaid,
                (SELECT COUNT(*) FROM users ref WHERE ref.referredBy = u.referralCode) as referralCount
            FROM users u
            WHERE u.role IN ('pro', 'instructor')
            ORDER BY unpaidBalance DESC
        `);
        return rows.map(row => ({
            ...row,
            unpaidBalance: Number(row.unpaidBalance),
            totalPaid: Number(row.totalPaid),
            referralCount: Number(row.referralCount),
        })) as AffiliateStat[];
    } catch (error) {
        console.error("Gagal mengambil statistik afiliasi untuk admin:", error);
        throw error;
    }
}

export async function getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT w.*, u.name as userName, u.avatarUrl as userAvatar
            FROM withdrawal_requests w
            JOIN users u ON w.userId = u.id
            ORDER BY w.requestDate ASC
        `);
        return rows.map(row => ({
            ...row,
            amount: Number(row.amount),
            bankDetails: JSON.parse(row.bankDetails || '{}'),
            requestDate: new Date(row.requestDate).toISOString(),
            processedDate: row.processedDate ? new Date(row.processedDate).toISOString() : null,
        })) as WithdrawalRequest[];
    } catch (error) {
        console.error("Gagal mengambil permintaan penarikan:", error);
        throw error;
    }
}

export async function processWithdrawal(requestId: string, action: 'approve' | 'reject'): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const actor = await getAuthUser(connection);
        if(actor.role !== 'admin') throw new Error("Hanya admin yang dapat memproses penarikan.");

        const [requestRows] = await connection.query<RowDataPacket[]>('SELECT * FROM withdrawal_requests WHERE id = ? AND status = "pending" FOR UPDATE', [requestId]);
        if (requestRows.length === 0) {
            throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        }
        const request = requestRows[0];

        if (action === 'approve') {
            await connection.query('UPDATE withdrawal_requests SET status = "approved", processedDate = NOW() WHERE id = ?', [requestId]);
            await connection.query('UPDATE users SET affiliatePaid = affiliatePaid + ? WHERE id = ?', [request.amount, request.userId]);
        } else { // reject
            await connection.query('UPDATE withdrawal_requests SET status = "rejected", processedDate = NOW() WHERE id = ?', [requestId]);
            // Return funds to user's balance
            await connection.query('UPDATE users SET affiliateBalance = affiliateBalance + ? WHERE id = ?', [request.amount, request.userId]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal memproses penarikan:", error);
        throw error;
    } finally {
        connection.release();
    }
}
