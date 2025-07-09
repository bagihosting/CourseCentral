
import { getPool } from './db';
import type { Tenant } from '@/types';
import type { RowDataPacket } from 'mysql2';

/**
 * Mengambil satu tenant berdasarkan subdomainnya. Digunakan oleh middleware.
 * @param subdomain Subdomain yang akan dicari.
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    if (!subdomain) return null;
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE subdomain = ?', [subdomain]);
        if (rows.length > 0) {
            return rows[0] as Tenant;
        }
        return null;
    } catch (error) {
        console.error("Gagal mengambil tenant berdasarkan subdomain:", error);
        return null; // Return null jika terjadi error agar aplikasi tidak crash
    }
}

/**
 * Mengambil satu tenant berdasarkan ID-nya.
 * @param tenantId ID tenant yang akan dicari.
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
    if (!tenantId) return null;
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE id = ?', [tenantId]);
        if (rows.length > 0) {
            return rows[0] as Tenant;
        }
        return null;
    } catch (error) {
        console.error("Gagal mengambil tenant berdasarkan ID:", error);
        return null;
    }
}
