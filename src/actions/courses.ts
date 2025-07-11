
'use server';

import { getPool } from '@/lib/db';
import type { Course } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getAuthUser, getActiveTenantId } from './utils';

function mapRowToCourse(row: any): Course {
    if (!row) return row;
    return {
        id: row.id,
        tenant_id: row.tenant_id,
        title: row.title,
        description: row.description,
        instructor: row.instructor,
        price: Number(row.price),
        imageUrl: row.image_url,
        accessLevel: row.access_level,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        seoKeywords: row.seo_keywords,
        modules: JSON.parse(row.modules || '[]'),
        status: row.status,
        authorId: row.authorId,
        reviewNotes: row.reviewNotes,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

// For public catalog, only show published courses for the active tenant
export async function getAllCourses(): Promise<Course[]> {
  const pool = getPool();
  const tenantId = await getActiveTenantId();
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM courses WHERE status = 'published' AND tenant_id = ? ORDER BY created_at DESC", [tenantId]);
    return rows.map(mapRowToCourse);
  } catch (error) {
    console.error("🔴 Peringatan di getAllCourses: Tidak dapat terhubung ke database. Mengembalikan array kosong.", error);
    return [];
  }
}

// For admin, show all courses for their tenant. Super admin sees all.
export async function getAllCoursesForAdmin(): Promise<Course[]> {
  const pool = getPool();
  const actor = await getAuthUser();
  const tenantId = actor.tenant_id === 'platform_main' ? await getActiveTenantId() : actor.tenant_id;
  try {
    const query = actor.tenant_id === 'platform_main' 
      ? 'SELECT * FROM courses ORDER BY created_at DESC'
      : 'SELECT * FROM courses WHERE tenant_id = ? ORDER BY created_at DESC';
    const params = actor.tenant_id === 'platform_main' ? [] : [tenantId];
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows.map(mapRowToCourse);
  } catch (error) {
    console.error("🔴 Gagal mengambil semua kursus untuk admin:", error);
    throw error;
  }
}

// For instructors, get their own courses
export async function getCoursesByAuthor(authorId: string): Promise<Course[]> {
  const pool = getPool();
  const tenantId = await getActiveTenantId();
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE authorId = ? AND tenant_id = ? ORDER BY created_at DESC', [authorId, tenantId]);
    return rows.map(mapRowToCourse);
  } catch (error) {
    console.error(`🔴 Gagal mengambil kursus untuk author ${authorId}:`, error);
    throw error;
  }
}

// Get courses pending review for the current tenant admin
export type CourseForReview = Course & { instructorName: string };
export async function getCoursesForAdminReview(): Promise<CourseForReview[]> {
    const pool = getPool();
    const tenantId = await getActiveTenantId();
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT c.*, u.name as instructorName 
            FROM courses c 
            JOIN users u ON c.authorId = u.id 
            WHERE c.status = 'pending_review' AND c.tenant_id = ?
            ORDER BY c.updated_at ASC
        `, [tenantId]);
        return rows.map(row => ({
            ...mapRowToCourse(row),
            instructorName: row.instructorName
        })) as CourseForReview;
    } catch (error) {
        console.error("🔴 Gagal mengambil kursus untuk direview:", error);
        throw error;
    }
}


export async function getCourseById(id: string): Promise<Course | null> {
    const pool = getPool();
    const tenantId = await getActiveTenantId();
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ? AND tenant_id = ?', [id, tenantId]);
        if (rows.length === 0) {
            // A super-admin might be trying to access a course from another tenant's subdomain.
            // Allow this, but it's a rare case. The primary check is on tenantId.
            // For simplicity, we'll keep the tenant check strict here.
            return null;
        }
        return mapRowToCourse(rows[0]);
    } catch (error) {
        console.error(`🔴 Peringatan di getCourseById: Tidak dapat terhubung ke database untuk ID ${id}. Mengembalikan null.`, error);
        return null;
    }
}

export async function createCourse(data: Omit<Course, 'id' | 'modules' | 'status' | 'reviewNotes' | 'created_at' | 'updated_at' | 'authorId' | 'tenant_id'>): Promise<Course> {
    const pool = getPool();
    const author = await getAuthUser();
    if (author.role !== 'admin' && author.role !== 'instructor') {
        throw new Error("Hanya admin atau pengajar yang dapat membuat kursus.");
    }
    const tenantId = author.tenant_id;
    
    const newId = `course_${Date.now()}`;
    const query = `INSERT INTO courses (id, tenant_id, title, description, instructor, price, image_url, access_level, seo_title, seo_description, seo_keywords, modules, authorId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`;
    
    try {
        await pool.query(query, [
            newId,
            tenantId,
            data.title,
            data.description,
            data.instructor,
            data.price,
            data.imageUrl,
            data.accessLevel,
            data.seoTitle || '',
            data.seoDescription || '',
            data.seoKeywords || '',
            '[]', // Start with empty modules
            author.id
        ]);
        
        // Temporarily override tenant context to fetch the newly created course for verification
        const [createdRows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [newId]);
        if (createdRows.length === 0) throw new Error('Gagal memverifikasi kursus yang baru dibuat.');
        
        return mapRowToCourse(createdRows[0]);
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
        
        const [existingRows] = await connection.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ? FOR UPDATE', [id]);
        if (existingRows.length === 0) throw new Error("Kursus tidak ditemukan untuk diperbarui.");

        let courseToUpdate = mapRowToCourse(existingRows[0]);

        // Check ownership and tenancy
        if (actor.role !== 'admin' && courseToUpdate.authorId !== actor.id) {
            throw new Error("Anda tidak memiliki izin untuk mengubah kursus ini.");
        }
        if (actor.tenant_id !== 'platform_main' && courseToUpdate.tenant_id !== actor.tenant_id) {
            throw new Error("Akses ditolak. Kursus ini milik tenant lain.");
        }
        
        const updatedData = { ...courseToUpdate, ...data };
        
        const query = `
            UPDATE courses SET 
            title = ?, description = ?, instructor = ?, price = ?, image_url = ?, 
            access_level = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, modules = ?,
            status = ?, reviewNotes = ?
            WHERE id = ?
        `;

        await connection.query(query, [
            updatedData.title,
            updatedData.description,
            updatedData.instructor,
            updatedData.price,
            updatedData.imageUrl,
            updatedData.accessLevel,
            updatedData.seoTitle,
            updatedData.seoDescription,
            updatedData.seoKeywords,
            JSON.stringify(updatedData.modules || []),
            updatedData.status,
            updatedData.reviewNotes,
            id
        ]);
        
        await connection.commit();

        const [updatedRows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
        if (updatedRows.length === 0) throw new Error('Gagal mengambil kursus setelah pembaruan.');

        return mapRowToCourse(updatedRows[0]);
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

        const [courseRows] = await connection.query<RowDataPacket[]>('SELECT authorId, tenant_id FROM courses WHERE id = ? FOR UPDATE', [id]);
        if (courseRows.length === 0) {
            await connection.commit();
            return;
        }

        const courseToDelete = courseRows[0];
        if(actor.role !== 'admin' && courseToDelete.authorId !== actor.id) {
            throw new Error("Anda tidak memiliki izin untuk menghapus kursus ini.");
        }
        if(actor.tenant_id !== 'platform_main' && courseToDelete.tenant_id !== actor.tenant_id) {
             throw new Error("Akses ditolak. Kursus ini milik tenant lain.");
        }

        await connection.query<ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);
        
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
    
    // An admin can submit on behalf of an instructor, but an instructor can only submit their own.
    if (actor.role !== 'admin' && actor.id !== authorId) {
        throw new Error("Anda tidak memiliki izin untuk mengajukan kursus ini.");
    }
    
    const [result] = await pool.query<ResultSetHeader>(
        "UPDATE courses SET status = 'pending_review' WHERE id = ? AND authorId = ? AND tenant_id = ? AND status IN ('draft', 'rejected')",
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
    const tenantId = await getActiveTenantId();
    
    const [result] = await pool.query<ResultSetHeader>(
        "UPDATE courses SET status = 'published' WHERE id = ? AND status = 'pending_review' AND tenant_id = ?",
        [courseId, tenantId]
    );
    if (result.affectedRows === 0) {
        throw new Error("Hanya kursus yang sedang direview di tenant ini yang dapat dipublikasikan.");
    }
}

export async function rejectCourse(courseId: string, reviewNotes: string): Promise<void> {
    const pool = getPool();
    const actor = await getAuthUser();
    if(actor.role !== 'admin') throw new Error("Hanya admin yang dapat menolak kursus.");
    const tenantId = await getActiveTenantId();

    const [result] = await pool.query<ResultSetHeader>(
        "UPDATE courses SET status = 'rejected', reviewNotes = ? WHERE id = ? AND status = 'pending_review' AND tenant_id = ?",
        [reviewNotes, courseId, tenantId]
    );

     if (result.affectedRows === 0) {
        throw new Error("Gagal menolak kursus. Kursus mungkin tidak dalam status 'pending_review' atau tidak ditemukan.");
    }
}
