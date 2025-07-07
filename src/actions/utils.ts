
'use server';

import type { User } from '@/types';
import type { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';

// Utility to get the authenticated user from the session cookie.
// This is a server-side equivalent of the useAuth() hook.
export async function getAuthUser(connection?: PoolConnection): Promise<User> {
    const db = connection || pool;

    const userId = cookies().get('user_session_id')?.value;

    if (!userId) {
        throw new Error('Not Authenticated. Sesi tidak valid atau telah berakhir.');
    }
    
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT u.*, ib.customDomain 
        FROM users u
        LEFT JOIN instructor_branding ib ON u.id = ib.userId
        WHERE u.id = ?
    `, [userId]);

    if (rows.length === 0) {
        throw new Error('User not found.');
    }

    const user = rows[0] as User;
    return {
        ...user,
        affiliateBalance: Number(user.affiliateBalance),
        affiliatePaid: Number(user.affiliatePaid),
        loginCount: Number(user.loginCount),
        customDomain: user.customDomain
    };
}
