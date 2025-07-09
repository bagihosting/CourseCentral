
'use server';

import { pool } from '@/lib/db';
import type { ResellerApplication, Tenant } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getAuthUser } from './utils';

// --- Reseller Applications ---

export async function applyForReseller(userId: string): Promise<void> {
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
}

export async function approveResellerApplication(applicationId: string): Promise<void> {
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
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE ownerId = ?', [resellerId]);
    if(rows.length > 0) {
        return rows[0] as Tenant;
    }
    return null;
}

export async function createOrUpdateTenantForReseller(data: {
    resellerId: string;
    subdomain: string;
    brandName: string;
    brandLogoUrl?: string;
    brandPrimaryColor?: string;
}): Promise<Tenant> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const existingTenant = await getTenantForReseller(data.resellerId);

        // Check if subdomain is already taken by someone else
        const [subdomainCheck] = await connection.query<RowDataPacket[]>('SELECT id, ownerId FROM tenants WHERE subdomain = ?', [data.subdomain]);
        if (subdomainCheck.length > 0 && subdomainCheck[0].ownerId !== data.resellerId) {
            throw new Error('Subdomain ini sudah digunakan. Silakan pilih yang lain.');
        }

        if(existingTenant) {
            // Update
            await connection.query(
                `UPDATE tenants SET subdomain = ?, brandName = ?, brandLogoUrl = ?, brandPrimaryColor = ? WHERE id = ?`,
                [data.subdomain, data.brandName, data.brandLogoUrl || null, data.brandPrimaryColor || null, existingTenant.id]
            );
            await connection.commit();
            return { ...existingTenant, ...data };
        } else {
            // Create
            const tenantId = `tnt_${Date.now()}`;
            await connection.query(
                `INSERT INTO tenants (id, name, ownerId, subdomain, brandName, brandLogoUrl, brandPrimaryColor) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [tenantId, data.brandName, data.resellerId, data.subdomain, data.brandName, data.brandLogoUrl || null, data.brandPrimaryColor || null]
            );
            
            // Link the reseller user to their new tenant
            await connection.query('UPDATE users SET tenant_id = ? WHERE id = ?', [tenantId, data.resellerId]);
            
            await connection.commit();
            
            const [newTenantRows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants WHERE id = ?', [tenantId]);
            return newTenantRows[0] as Tenant;
        }

    } catch(error) {
        await connection.rollback();
        console.error("Gagal membuat/memperbarui tenant reseller:", error);
        throw error;
    } finally {
        connection.release();
    }
}
