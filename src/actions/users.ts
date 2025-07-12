
'use server';

import { getPool } from '@/lib/db';
import type { User, RegisterUserInput, UpdateUserInput } from '@/types';
import { 
    fetchAllUsersFromDb, 
    fetchUserByReferralCode, 
    createUserInDb, 
    updateUserInDb, 
    deleteUserFromDb,
    fetchUserById
} from '@/data/users';
import { getAuthUser } from './utils';
import { validatePassword } from '@/lib/validation';

export async function getAllUsers(): Promise<User[]> {
  const actor = await getAuthUser();
  try {
    return await fetchAllUsersFromDb(actor.tenant_id);
  } catch (error) {
    console.error("🔴 Gagal mengambil semua pengguna:", error);
    throw error;
  }
}

export async function getUserByReferralCode(referralCode: string): Promise<Pick<User, 'name'> | null> {
  if (!referralCode) return null;
  const pool = getPool();
  try {
    return await fetchUserByReferralCode(referralCode);
  } catch (error) {
    console.error(`🔴 Gagal mengambil pengguna dengan kode referral ${referralCode}:`, error);
    throw error;
  }
}

export async function registerUser(data: RegisterUserInput): Promise<User> {
    if (!validatePassword(data.password)) {
      throw new Error('Kata sandi tidak memenuhi persyaratan keamanan.');
    }
    
    const newUser = await createUserInDb(data);
    return newUser;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const actor = await getAuthUser();

    // Security check: Only admins can update other users. Users can only update themselves.
    if (actor.id !== id && actor.role !== 'admin') {
      throw new Error("Anda tidak memiliki izin untuk mengubah pengguna ini.");
    }
    
    // Fetch the user being updated to check their tenant
    const userToUpdate = await fetchUserById(id);
    if (!userToUpdate) {
      throw new Error("Pengguna yang akan diupdate tidak ditemukan.");
    }

    // Security check for multi-tenancy: Tenant admin can only update users within their own tenant.
    if (actor.tenant_id !== 'platform_main' && userToUpdate.tenant_id !== actor.tenant_id) {
        throw new Error("Akses ditolak. Anda tidak dapat mengubah pengguna di tenant lain.");
    }

    if (data.password && !validatePassword(data.password)) {
      throw new Error('Kata sandi tidak memenuhi persyaratan keamanan.');
    }

    const updatedUser = await updateUserInDb(id, data);
    return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang bisa menghapus pengguna.");
    if(actor.id === id) throw new Error("Aksi tidak diizinkan: Anda tidak dapat menghapus akun Anda sendiri.");
    
    const userToDelete = await fetchUserById(id);
    if (!userToDelete) {
        return; // User already gone
    }

    // Security check for multi-tenancy
    if (actor.tenant_id !== 'platform_main' && userToDelete.tenant_id !== actor.tenant_id) {
        throw new Error("Akses ditolak. Anda tidak dapat menghapus pengguna di tenant lain.");
    }

    await deleteUserFromDb(id);
}

export async function reactivateUser(id: string): Promise<void> {
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang bisa mengaktifkan pengguna.");
    
    const userToReactivate = await fetchUserById(id);
    if (!userToReactivate) {
        throw new Error("Pengguna tidak ditemukan.");
    }

    if (actor.tenant_id !== 'platform_main' && userToReactivate.tenant_id !== actor.tenant_id) {
        throw new Error("Akses ditolak. Anda tidak dapat mengaktifkan pengguna di tenant lain.");
    }

    await updateUserInDb(id, { status: 'active' });
}
