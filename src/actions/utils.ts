
'use server';

import type { User } from '@/types';
import type { PoolConnection } from 'mysql2/promise';
import { getPool } from '@/lib/db';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { getTenantBySubdomain } from '@/lib/tenants';
import { fetchUserById } from '@/data/users';

/**
 * A cached function to resolve a subdomain to a tenant ID from the database.
 * `React.cache` ensures this database query runs only once per request, even if `getActiveTenantId` is called multiple times.
 */
export const getTenantIdFromSubdomain = cache(async (subdomain: string): Promise<string | null> => {
    if (!subdomain) {
        return null;
    }
    const tenant = await getTenantBySubdomain(subdomain);
    return tenant?.id || null;
});


/**
 * Gets the active tenant ID for the current request.
 * It reads the subdomain from the request headers (set by middleware),
 * then uses a cached function to look up the tenant ID in the database.
 * This moves the database logic out of the middleware and into the React render cycle, which is more robust.
 * @returns The active tenant's ID, or 'platform_main' as a default.
 */
export async function getActiveTenantId(): Promise<string> {
    const headersList = headers();
    const subdomain = headersList.get('x-subdomain') || '';
    
    if (!subdomain) {
        return 'platform_main';
    }
    
    const tenantId = await getTenantIdFromSubdomain(subdomain);
    
    // If the subdomain is valid and resolves to a tenant, use that ID.
    // Otherwise, fall back to the main platform. This handles cases where a user lands on a non-existent subdomain.
    return tenantId || 'platform_main';
}

/**
 * Utility untuk mendapatkan pengguna yang terotentikasi dari cookie sesi.
 * Fungsi ini sekarang juga memeriksa apakah pengguna tersebut milik tenant yang aktif.
 * @param connection - Koneksi database opsional untuk digunakan dalam transaksi.
 * @returns Objek Pengguna yang terotentikasi.
 * @throws Akan melempar Error jika pengguna tidak terotentikasi atau mencoba mengakses tenant yang salah.
 */
export async function getAuthUser(connection?: PoolConnection): Promise<User> {
    const userId = cookies().get('user_session_id')?.value;

    if (!userId) {
        throw new Error('Not Authenticated. Sesi tidak valid atau telah berakhir.');
    }
    
    const user = await fetchUserById(userId);

    if (!user) {
        // This case can happen if the user was deleted but the cookie remains.
        // It's good practice to clear the cookie here.
        cookies().delete('user_session_id');
        throw new Error('User not found.');
    }

    // Pemeriksaan keamanan penting untuk multitenancy
    const activeTenantId = await getActiveTenantId();
    // Seorang Super Admin (dari 'platform_main') dapat mengakses tenant mana pun.
    // Pengguna biasa hanya bisa mengakses data di dalam tenant mereka sendiri.
    if (user.tenant_id !== 'platform_main' && user.tenant_id !== activeTenantId) {
        // Melempar error jika ada ketidakcocokan tenant, kecuali jika itu super admin.
        // Ini mencegah pengguna dari satu tenant melihat data di subdomain tenant lain.
        throw new Error('Tenant mismatch. Access denied.');
    }

    return user;
}
