
'use server';

import { pool } from '@/lib/db';
import type { Tenant, User } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getAuthUser } from './utils';
import { validatePassword } from '@/lib/validation';

function generateReferralCode(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

/**
 * Mengambil semua tenant yang ada di platform.
 * Hanya bisa dipanggil oleh Super Admin.
 */
export async function getAllTenants(): Promise<Tenant[]> {
    const actor = await getAuthUser();
    if (actor.role !== 'admin' || actor.tenant_id !== 'platform_main') {
        throw new Error('Hanya Super Admin yang dapat melihat tenant.');
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM tenants ORDER BY createdAt DESC');
    return rows as Tenant[];
}

/**
 * Mengambil satu tenant berdasarkan subdomainnya. Digunakan oleh middleware.
 * @param subdomain Subdomain yang akan dicari.
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    if (!subdomain) return null;
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
 * Membuat tenant baru beserta admin pertama untuk tenant tersebut.
 * Hanya bisa dipanggil oleh Super Admin.
 * @param data Data untuk membuat tenant dan adminnya.
 */
export async function createTenant(data: {
    tenantName: string;
    subdomain: string;
    ownerName: string;
    ownerUsername: string;
    ownerPassword: string;
}): Promise<{ tenantId: string; ownerId: string }> {
    
    const actor = await getAuthUser();
    if (actor.role !== 'admin' || actor.tenant_id !== 'platform_main') {
        throw new Error('Hanya Super Admin yang dapat membuat tenant baru.');
    }

    // Validasi input
    if (!data.tenantName || !data.subdomain || !data.ownerName || !data.ownerUsername || !data.ownerPassword) {
        throw new Error('Semua kolom wajib diisi.');
    }
    if (!validatePassword(data.ownerPassword)) {
        throw new Error('Kata sandi admin tenant tidak memenuhi persyaratan keamanan.');
    }
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(data.subdomain)) {
        throw new Error('Subdomain tidak valid. Hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).');
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // Cek duplikasi subdomain atau username (secara global)
        const [existingSubdomain] = await connection.query<RowDataPacket[]>('SELECT id FROM tenants WHERE subdomain = ?', [data.subdomain]);
        if (existingSubdomain.length > 0) {
            throw new Error('Subdomain sudah digunakan.');
        }

        const [existingUsername] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [data.ownerUsername]);
        if (existingUsername.length > 0) {
            throw new Error('Nama pengguna sudah digunakan. Harap pilih yang lain.');
        }

        // Generate IDs
        const tenantId = `tnt_${Date.now()}`;
        const ownerId = `user_${Date.now()}`;
        const referralCode = generateReferralCode();
        const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);
        
        // 1. Masukkan data tenant terlebih dahulu
        await connection.query(
            `INSERT INTO tenants (id, name, subdomain, ownerId) VALUES (?, ?, ?, ?)`,
            [tenantId, data.tenantName, data.subdomain, ownerId]
        );

        // 2. Masukkan data admin tenant, dengan tenant_id yang sudah valid
        await connection.query(
            `INSERT INTO users (id, tenant_id, name, username, password, role, referralCode) VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
            [ownerId, tenantId, data.ownerName, data.ownerUsername, hashedPassword, referralCode]
        );
        
        // Jika ada kesalahan, transaksi akan di-rollback secara otomatis.
        await connection.commit();

        return { tenantId, ownerId };

    } catch (error) {
        await connection.rollback();
        console.error("Gagal membuat tenant:", error);
        throw error;
    } finally {
        connection.release();
    }
}
