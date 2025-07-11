
'use server';

import { getPool } from '@/lib/db';
import type { ResellerApplication, Tenant } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getAuthUser } from './utils';

// --- Reseller Applications ---

export async function applyForReseller(userId: string): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM reseller_applications WHERE userId = ? AND status IN ("pending", "approved")', [userId]);
        if (existing.length > 0) {
            throw new Error('Anda sudah memiliki permintaan menjadi reseller yang aktif atau sudah disetujui.');
        }

        const id = `rapp_${Date.now()}`;
        await connection.query('INSERT INTO reseller_applications (id, userId, requestDate, status) VALUES (?, ?, NOW(), "pending")', [id, userId]);
        await connection.query('UPDATE users SET resellerStatus = "pending" WHERE id = ?', [userId]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal mengajukan diri sebagai reseller:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function getResellerApplications(): Promise<ResellerApplication[]> {
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT ra.id, ra.userId, ra.requestDate, ra.status, u.name as userName, u.avatarUrl as userAvatar
            FROM reseller_applications ra
            JOIN users u ON ra.userId = u.id
            WHERE ra.status = 'pending'
            ORDER BY ra.requestDate ASC
        `);
        return rows.map(row => ({
            ...row,
            requestDate: new Date(row.requestDate).toISOString(),
        })) as ResellerApplication[];
    } catch(error) {
        console.error("Gagal mengambil permintaan reseller:", error);
        throw error;
    }
}

export async function approveResellerApplication(applicationId: string): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [appRows] = await connection.query<RowDataPacket[]>('SELECT userId FROM reseller_applications WHERE id = ? AND status = "pending"', [applicationId]);
        if(appRows.length === 0) throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        
        const userId = appRows[0].userId;
        await connection.query("UPDATE reseller_applications SET status = 'approved' WHERE id = ?", [applicationId]);
        await connection.query("UPDATE users SET role = 'reseller', resellerStatus = 'approved' WHERE id = ?", [userId]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal menyetujui permintaan reseller:", error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function rejectResellerApplication(applicationId: string): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [appRows] = await connection.query<RowDataPacket[]>('SELECT userId FROM reseller_applications WHERE id = ? AND status = "pending"', [applicationId]);
        if(appRows.length === 0) throw new Error('Permintaan tidak ditemukan atau sudah diproses.');
        
        const userId = appRows[0].userId;
        await connection.query("UPDATE reseller_applications SET status = 'rejected' WHERE id = ?", [applicationId]);
        await connection.query("UPDATE users SET resellerStatus = 'rejected' WHERE id = ?", [userId]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Gagal menolak permintaan reseller:", error);
        throw error;
    } finally {
        connection.release();
    }
}

// --- Tenant Management for Resellers ---

export async function getTenantForReseller(resellerId: string): Promise<Tenant | null> {
    const pool = getPool();
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE ownerId = ?', [resellerId]);
        if(rows.length > 0) {
            return rows[0] as Tenant;
        }
        return null;
    } catch (error) {
        console.error("Gagal mengambil tenant reseller:", error);
        throw error;
    }
}

export async function createTenantForReseller(data: {
    resellerId: string;
    subdomain: string;
    brandName: string;
    brandLogoUrl?: string;
    brandPrimaryColor?: string;
}): Promise<Tenant> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const existingTenantForUser = await getTenantForReseller(data.resellerId);
        if (existingTenantForUser) {
            throw new Error('Anda sudah memiliki tenant. Anda hanya dapat membuat satu tenant per akun reseller.');
        }

        const [subdomainCheck] = await connection.query<RowDataPacket[]>('SELECT id FROM tenants WHERE subdomain = ?', [data.subdomain]);
        if (subdomainCheck.length > 0) {
            throw new Error('Subdomain ini sudah digunakan. Silakan pilih yang lain.');
        }

        const tenantId = `tnt_${Date.now()}`;
        await connection.query(
            `INSERT INTO tenants (id, name, ownerId, subdomain, brandName, brandLogoUrl, brandPrimaryColor) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, data.brandName, data.resellerId, data.subdomain, data.brandName, data.brandLogoUrl || null, data.brandPrimaryColor || null]
        );
        
        // Move the reseller to their new tenant and upgrade their role to admin
        await connection.query('UPDATE users SET tenant_id = ?, role = "admin" WHERE id = ?', [tenantId, data.resellerId]);
        
        await connection.commit();
        
        const [newTenantRows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE id = ?', [tenantId]);
        return newTenantRows[0] as Tenant;

    } catch(error) {
        await connection.rollback();
        console.error("Gagal membuat tenant reseller:", error);
        throw error;
    } finally {
        connection.release();
    }
}


export async function updateTenantBranding(data: {
    subdomain: string;
    brandName: string;
    brandLogoUrl?: string;
    brandPrimaryColor?: string;
}): Promise<Tenant> {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const actor = await getAuthUser(connection);
        if (actor.role !== 'admin') {
            throw new Error('Hanya admin tenant yang dapat mengubah pengaturan branding.');
        }

        const [existingTenant] = await connection.query<RowDataPacket[]>('SELECT * FROM tenants WHERE id = ?', [actor.tenant_id]);
        if (existingTenant.length === 0) {
            throw new Error('Tenant tidak ditemukan.');
        }

        // Check if subdomain is being changed and if the new one is available
        if (data.subdomain !== existingTenant[0].subdomain) {
            const [subdomainCheck] = await connection.query<RowDataPacket[]>('SELECT id FROM tenants WHERE subdomain = ? AND id != ?', [data.subdomain, actor.tenant_id]);
            if (subdomainCheck.length > 0) {
                throw new Error('Subdomain ini sudah digunakan. Silakan pilih yang lain.');
            }
        }
        
        await connection.query(
            `UPDATE tenants SET subdomain = ?, brandName = ?, brandLogoUrl = ?, brandPrimaryColor = ? WHERE id = ?`,
            [data.subdomain, data.brandName, data.brandLogoUrl || null, data.brandPrimaryColor || null, actor.tenant_id]
        );
        
        await connection.commit();
        
        const [updatedTenantRows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE id = ?', [actor.tenant_id]);
        return updatedTenantRows[0] as Tenant;

    } catch(error) {
        await connection.rollback();
        console.error("Gagal memperbarui branding tenant:", error);
        throw error;
    } finally {
        connection.release();
    }
}
