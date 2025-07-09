
'use server';

import type { User } from '@/types';
import type { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { getPool } from '@/lib/db';
import { cookies, headers } from 'next/headers';

/**
 * Mengambil ID tenant aktif dari header permintaan.
 * Middleware bertanggung jawab untuk mengatur header ini berdasarkan subdomain.
 * @returns ID tenant aktif, atau 'platform_main' sebagai default.
 */
export async function getActiveTenantId(): Promise<string> {
    const headersList = headers();
    return headersList.get('x-tenant-id') || 'platform_main';
}

/**
 * Utility untuk mendapatkan pengguna yang terotentikasi dari cookie sesi.
 * Fungsi ini sekarang juga memeriksa apakah pengguna tersebut milik tenant yang aktif.
 * @param connection - Koneksi database opsional untuk digunakan dalam transaksi.
 * @returns Objek Pengguna yang terotentikasi.
 * @throws Akan melempar Error jika pengguna tidak terotentikasi atau mencoba mengakses tenant yang salah.
 */
export async function getAuthUser(connection?: PoolConnection): Promise<User> {
    const db = connection || getPool();
    const activeTenantId = await getActiveTenantId();
    const userId = cookies().get('user_session_id')?.value;

    if (!userId) {
        throw new Error('Not Authenticated. Sesi tidak valid atau telah berakhir.');
    }
    
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
        throw new Error('User not found.');
    }

    const user = rows[0] as User;

    // Pemeriksaan keamanan penting untuk multitenancy
    // Seorang Super Admin (dari 'platform_main') dapat mengakses tenant mana pun.
    // Pengguna biasa hanya bisa mengakses data di dalam tenant mereka sendiri.
    if (user.tenant_id !== 'platform_main' && user.tenant_id !== activeTenantId) {
        // Melempar error jika ada ketidakcocokan tenant, kecuali jika itu super admin.
        // Ini mencegah pengguna dari satu tenant melihat data di subdomain tenant lain.
        throw new Error('Tenant mismatch. Access denied.');
    }

    return {
        ...user,
        affiliateBalance: Number(user.affiliateBalance),
        affiliatePaid: Number(user.affiliatePaid),
        loginCount: Number(user.loginCount),
    };
}
