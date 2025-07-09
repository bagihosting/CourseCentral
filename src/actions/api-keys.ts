
'use server';

import { pool } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getAuthUser } from './utils';
import type { RowDataPacket } from 'mysql2';

const API_KEY_PREFIX = "cca_"; // Course Central API
const KEY_LENGTH_BYTES = 32; // 32 bytes = 64 hex characters

type ApiKeyInfo = {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    createdByName: string;
};

/**
 * Creates a new API key.
 * Only callable by an admin.
 * @param name A descriptive name for the API key.
 * @returns An object containing the full, unhashed API key. This is the only time it will be shown.
 */
export async function createApiKey(name: string): Promise<{ apiKey: string }> {
    const actor = await getAuthUser();
    if (actor.role !== 'admin') {
        throw new Error("Hanya admin yang dapat membuat API key.");
    }

    const keyId = `ak_${Date.now()}`;
    const plainTextKey = `${API_KEY_PREFIX}${crypto.randomBytes(KEY_LENGTH_BYTES).toString('hex')}`;
    const hashedKey = await bcrypt.hash(plainTextKey, 10);
    const prefix = plainTextKey.substring(0, API_KEY_PREFIX.length + 4);

    await pool.query(
        'INSERT INTO api_keys (id, name, hashed_key, prefix, created_by) VALUES (?, ?, ?, ?, ?)',
        [keyId, name, hashedKey, prefix, actor.id]
    );

    return { apiKey: plainTextKey };
}

/**
 * Retrieves a list of all API keys, excluding the sensitive hash.
 * Only callable by an admin.
 * @returns An array of API key information.
 */
export async function getApiKeys(): Promise<ApiKeyInfo[]> {
    const actor = await getAuthUser();
    if (actor.role !== 'admin') {
        throw new Error("Hanya admin yang dapat melihat API key.");
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT ak.id, ak.name, ak.prefix, ak.created_at, ak.last_used_at, u.name as createdByName
        FROM api_keys ak
        JOIN users u ON ak.created_by = u.id
        ORDER BY ak.created_at DESC
    `);
    
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        prefix: row.prefix,
        createdAt: new Date(row.created_at).toISOString(),
        lastUsedAt: row.last_used_at ? new Date(row.last_used_at).toISOString() : null,
        createdByName: row.createdByName
    })) as ApiKeyInfo[];
}

/**
 * Revokes (deletes) an API key.
 * Only callable by an admin.
 * @param keyId The ID of the API key to revoke.
 */
export async function revokeApiKey(keyId: string): Promise<void> {
    const actor = await getAuthUser();
    if (actor.role !== 'admin') {
        throw new Error("Hanya admin yang dapat mencabut API key.");
    }

    await pool.query('DELETE FROM api_keys WHERE id = ?', [keyId]);
}


/**
 * Validates a given API key.
 * @param key The plain-text API key from the request.
 * @returns `true` if the key is valid, `false` otherwise.
 */
export async function validateApiKey(key: string): Promise<boolean> {
    if (!key || !key.startsWith(API_KEY_PREFIX)) {
        return false;
    }

    const prefix = key.substring(0, API_KEY_PREFIX.length + 4);

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, hashed_key FROM api_keys WHERE prefix = ?',
            [prefix]
        );

        if (rows.length === 0) {
            return false;
        }

        for (const row of rows) {
            const isMatch = await bcrypt.compare(key, row.hashed_key);
            if (isMatch) {
                // Key is valid. Update last_used_at in the background (fire-and-forget).
                pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = ?', [row.id]).catch(console.error);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error validating API key:", error);
        return false;
    }
}
