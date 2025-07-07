
'use server';

import { pool } from '@/lib/db';
import type { User } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export type PopulatedReferredUser = Pick<User, 'id' | 'name' | 'role' | 'createdAt'>;

export async function getReferredUsers(userId: string): Promise<PopulatedReferredUser[]> {
    const [referrerRows] = await pool.query<RowDataPacket[]>('SELECT referralCode FROM users WHERE id = ?', [userId]);
    if (referrerRows.length === 0) return [];

    const referralCode = referrerRows[0].referralCode;

    const [referredRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, role, created_at AS createdAt FROM users WHERE referredBy = ?',
        [referralCode]
    );

    return referredRows as PopulatedReferredUser[];
}

export type PopulatedAffiliateStat = {
    userId: string;
    userName: string;
    userAvatar: string;
    userRole: User['role'];
    successfulReferrals: number;
    unpaidBalance: number;
    paidBalance: number;
}

export async function getAffiliateStats(): Promise<PopulatedAffiliateStat[]> {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, avatarUrl, role, referralCode, affiliateBalance, affiliatePaid FROM users');
    
    const statsPromises = users.map(async (user) => {
        const [referralCount] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM users WHERE referredBy = ? AND role = "pro"',
            [user.referralCode]
        );
        
        return {
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatarUrl,
            userRole: user.role,
            successfulReferrals: referralCount[0].count,
            unpaidBalance: Number(user.affiliateBalance),
            paidBalance: Number(user.affiliatePaid),
        };
    });

    const stats = await Promise.all(statsPromises);

    return stats
        .filter(stat => stat.successfulReferrals > 0 || stat.unpaidBalance > 0 || stat.paidBalance > 0)
        .sort((a, b) => b.unpaidBalance - a.unpaidBalance);
}

export async function processPayout(userId: string): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT affiliateBalance FROM users WHERE id = ? FOR UPDATE', [userId]);
        if (userRows.length === 0) {
            throw new Error('Pengguna tidak ditemukan.');
        }

        const user = userRows[0];
        const balanceToPay = Number(user.affiliateBalance);

        if (balanceToPay <= 0) {
            throw new Error('Tidak ada saldo untuk dibayarkan.');
        }

        await connection.query(
            'UPDATE users SET affiliatePaid = affiliatePaid + ?, affiliateBalance = 0 WHERE id = ?',
            [balanceToPay, userId]
        );
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Failed to process payout:", error);
        throw error;
    } finally {
        connection.release();
    }
}

    
