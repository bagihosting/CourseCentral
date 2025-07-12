
'use server';

import { getPool } from '@/lib/db';
import type { Course, CourseForReview } from '@/types';
import { getAuthUser, getActiveTenantId } from './utils';
import {
    fetchCourseByIdFromDb,
    fetchAllCoursesFromDb,
    fetchAllCoursesForAdminFromDb,
    fetchCoursesByAuthorFromDb,
    fetchCoursesForReviewFromDb,
    createCourseInDb,
    updateCourseInDb,
    deleteCourseFromDb
} from '@/data/courses';

// For public catalog, only show published courses for the active tenant
export async function getAllCourses(): Promise<Course[]> {
  const tenantId = await getActiveTenantId();
  try {
    return await fetchAllCoursesFromDb(tenantId);
  } catch (error) {
    console.error("🔴 Peringatan di getAllCourses: Tidak dapat terhubung ke database. Mengembalikan array kosong.", error);
    return [];
  }
}

// For admin, show all courses for their tenant. Super admin sees all.
export async function getAllCoursesForAdmin(): Promise<Course[]> {
  const actor = await getAuthUser();
  try {
    return await fetchAllCoursesForAdminFromDb(actor.tenant_id);
  } catch (error) {
    console.error("🔴 Gagal mengambil semua kursus untuk admin:", error);
    throw error;
  }
}

// For instructors, get their own courses
export async function getCoursesByAuthor(authorId: string): Promise<Course[]> {
  const tenantId = await getActiveTenantId();
  try {
    return await fetchCoursesByAuthorFromDb(authorId, tenantId);
  } catch (error) {
    console.error(`🔴 Gagal mengambil kursus untuk author ${authorId}:`, error);
    throw error;
  }
}

// Get courses pending review for the current tenant admin
export async function getCoursesForAdminReview(): Promise<CourseForReview[]> {
    const actor = await getAuthUser();
    try {
        return await fetchCoursesForReviewFromDb(actor.tenant_id);
    } catch (error) {
        console.error("🔴 Gagal mengambil kursus untuk direview:", error);
        throw error;
    }
}

export async function getCourseById(id: string): Promise<Course | null> {
    try {
        return await fetchCourseByIdFromDb(id);
    } catch (error) {
        console.error(`🔴 Peringatan di getCourseById: Tidak dapat terhubung ke database untuk ID ${id}. Mengembalikan null.`, error);
        return null;
    }
}

export async function createCourse(data: Omit<Course, 'id' | 'modules' | 'status' | 'reviewNotes' | 'created_at' | 'updated_at' | 'authorId' | 'tenant_id'>): Promise<Course> {
    const author = await getAuthUser();
    if (author.role !== 'admin' && author.role !== 'instructor') {
        throw new Error("Hanya admin atau pengajar yang dapat membuat kursus.");
    }
    
    try {
        const newCourse = await createCourseInDb(data, author.id, author.tenant_id);
        return newCourse;
    } catch (error) {
        console.error("🔴 Gagal membuat kursus baru:", error);
        throw error;
    }
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'authorId' | 'tenant_id'>>): Promise<Course> {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const actor = await getAuthUser(connection);
        
        const courseToUpdate = await fetchCourseByIdFromDb(id, connection);
        if (!courseToUpdate) throw new Error("Kursus tidak ditemukan untuk diperbarui.");

        // Security Check
        if (actor.tenant_id !== 'platform_main' && courseToUpdate.tenant_id !== actor.tenant_id) {
            throw new Error("Akses ditolak. Anda tidak dapat mengubah kursus di tenant lain.");
        }
        if (actor.role !== 'admin' && courseToUpdate.authorId !== actor.id) {
            throw new Error("Anda tidak memiliki izin untuk mengubah kursus ini.");
        }
        
        const updatedCourse = await updateCourseInDb(id, data, connection);
        
        await connection.commit();
        return updatedCourse;
    } catch (error) {
        await connection.rollback();
        console.error(`🔴 Gagal memperbarui kursus dengan ID ${id}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function deleteCourse(id: string): Promise<void> {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const actor = await getAuthUser(connection);

        const courseToDelete = await fetchCourseByIdFromDb(id, connection);
        if (!courseToDelete) {
            await connection.commit();
            return;
        }
        
        // Security Check
        if(actor.tenant_id !== 'platform_main' && courseToDelete.tenant_id !== actor.tenant_id) {
             throw new Error("Akses ditolak. Anda tidak dapat menghapus kursus di tenant lain.");
        }
        if(actor.role !== 'admin' && courseToDelete.authorId !== actor.id) {
            throw new Error("Anda tidak memiliki izin untuk menghapus kursus ini.");
        }

        await deleteCourseFromDb(id, connection);
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error(`🔴 Gagal menghapus kursus dengan ID ${id}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

// --- Course Status Management ---

export async function submitCourseForReview(courseId: string, authorId: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    
    if (actor.role !== 'admin' && actor.id !== authorId) {
        throw new Error("Anda tidak memiliki izin untuk mengajukan kursus ini.");
    }
    
    const [result] = await pool.query('UPDATE courses SET status = "pending_review" WHERE id = ? AND authorId = ? AND tenant_id = ? AND status IN ("draft", "rejected")',
        [courseId, authorId, actor.tenant_id]
    );
    if (result.affectedRows === 0) {
        throw new Error("Kursus tidak dapat diajukan untuk review. Pastikan Anda adalah pemilik dan statusnya adalah draft atau ditolak.");
    }
}

export async function publishCourse(courseId: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang dapat mempublikasikan kursus.");
    
    const [result] = await pool.query("UPDATE courses SET status = 'published' WHERE id = ? AND status = 'pending_review' AND tenant_id = ?",
        [courseId, actor.tenant_id]
    );
    if (result.affectedRows === 0) {
        throw new Error("Hanya kursus yang sedang direview di tenant ini yang dapat dipublikasikan.");
    }
}

export async function rejectCourse(courseId: string, reviewNotes: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang dapat menolak kursus.");

    const [result] = await pool.query("UPDATE courses SET status = 'rejected', reviewNotes = ? WHERE id = ? AND status = 'pending_review' AND tenant_id = ?",
        [reviewNotes, courseId, actor.tenant_id]
    );

     if (result.affectedRows === 0) {
        throw new Error("Gagal menolak kursus. Kursus mungkin tidak dalam status 'pending_review' atau tidak ditemukan.");
    }
}
