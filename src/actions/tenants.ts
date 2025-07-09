
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
        // Cek duplikasi subdomain atau username
        const [existingSubdomain] = await connection.query<RowDataPacket[]>('SELECT id FROM tenants WHERE subdomain = ?', [data.subdomain]);
        if (existingSubdomain.length > 0) {
            throw new Error('Subdomain sudah digunakan.');
        }

        const [existingUsername] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ? AND tenant_id != "platform_main"', [data.ownerUsername]);
        if (existingUsername.length > 0) {
            throw new Error('Nama pengguna sudah digunakan oleh tenant lain.');
        }

        // Generate IDs
        const tenantId = `tnt_${Date.now()}`;
        const ownerId = `user_${Date.now()}`;
        const referralCode = generateReferralCode();
        const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);

        // 1. Buat User (owner) terlebih dahulu, tapi dengan tenant_id sementara
        // Kita tidak bisa membuat tenant dulu karena ownerId butuh user.id
        // Ini adalah dilema "ayam dan telur". Solusinya adalah membuat user, lalu tenant, lalu update user.
        // TAPI, Foreign Key Constraint akan gagal.
        
        // Solusi yang lebih baik: Hapus sementara foreign key check, lakukan operasi, lalu aktifkan kembali.
        // Namun, ini kurang ideal.
        
        // Solusi terbaik: Transaksi dengan logika yang benar.
        // Kita tidak bisa membuat tenant tanpa ownerId. Kita tidak bisa membuat user (dengan FK) tanpa tenant.id.
        // Jadi, kita harus memodifikasi skema untuk MENGIZINKAN ownerId di tenant NULLABLE sementara,
        // ATAU, kita membuat user, LALU membuat tenant, LALU mengupdate user.
        // Saya akan memilih pendekatan kedua, yang memerlukan skema yang lebih fleksibel, atau kita handle di level aplikasi.
        // Karena skema kita saat ini strict, mari kita asumsikan skema sudah diubah untuk handle ini.
        // UPDATE: Skema yang saya buat sudah menghapus foreign key dari tenant->users, jadi kita aman.

        // Mari kita coba pendekatan transaksi yang benar:
        // 1. Masukkan data admin tenant
        await connection.query(
            `INSERT INTO users (id, tenant_id, name, username, password, role, referralCode) VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
            [ownerId, tenantId, data.ownerName, data.ownerUsername, hashedPassword, referralCode]
        );

        // 2. Masukkan data tenant
        await connection.query(
            `INSERT INTO tenants (id, name, subdomain, ownerId) VALUES (?, ?, ?, ?)`,
            [tenantId, data.tenantName, data.subdomain, ownerId]
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
