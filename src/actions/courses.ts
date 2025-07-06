
'use server';

import { pool } from '@/lib/db';
import type { Course } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

function mapRowToCourse(row: any): Course {
    if (!row) return row;
    return {
        id: row.id,
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
        updated_at: row.updated_at,
    };
}

// For public catalog, only show published courses
export async function getAllCourses(): Promise<Course[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM courses WHERE status = 'published' ORDER BY created_at DESC");
    return rows.map(mapRowToCourse);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
    } else {
        console.error("🔴 Gagal mengambil semua kursus:", error);
    }
    return [];
  }
}

// For admin, show all courses with any status
export async function getAllCoursesForAdmin(): Promise<Course[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses ORDER BY created_at DESC');
    return rows.map(mapRowToCourse);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
    } else {
        console.error("🔴 Gagal mengambil semua kursus untuk admin:", error);
    }
    return [];
  }
}

// For instructors, get their own courses
export async function getCoursesByAuthor(authorId: string): Promise<Course[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE authorId = ? ORDER BY created_at DESC', [authorId]);
    return rows.map(mapRowToCourse);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
    } else {
        console.error(`🔴 Gagal mengambil kursus untuk author ${authorId}:`, error);
    }
     return [];
  }
}

// Get courses pending review for admin dashboard
export type CourseForReview = Course & { instructorName: string };
export async function getCoursesForAdminReview(): Promise<CourseForReview[]> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT c.*, u.name as instructorName 
            FROM courses c 
            JOIN users u ON c.authorId = u.id 
            WHERE c.status = 'pending_review' 
            ORDER BY c.updated_at ASC
        `);
        return rows.map(row => ({
            ...mapRowToCourse(row),
            instructorName: row.instructorName
        })) as CourseForReview[];
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || 3306;
            console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
        } else {
            console.error("🔴 Gagal mengambil kursus untuk direview:", error);
        }
        return [];
    }
}


export async function getCourseById(id: string): Promise<Course | null> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        return mapRowToCourse(rows[0]);
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            const dbHost = process.env.DB_HOST || 'localhost';
            const dbPort = process.env.DB_PORT || 3306;
            console.error(`🔴 Kesalahan Koneksi Database: Tidak dapat terhubung ke ${dbHost}:${dbPort}. Pastikan server database Anda berjalan dan file .env.local sudah benar.`);
        } else {
            console.error(`🔴 Gagal mengambil kursus dengan ID ${id}:`, error);
        }
        return null;
    }
}

export async function createCourse(data: Omit<Course, 'id' | 'modules' | 'status' | 'authorId' | 'reviewNotes' | 'created_at' | 'updated_at'>, authorId: string): Promise<Course> {
    const newId = `course_${Date.now()}`;
    const query = `INSERT INTO courses (id, title, description, instructor, price, image_url, access_level, seo_title, seo_description, seo_keywords, modules, authorId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`;
    
    try {
        await pool.query(query, [
            newId,
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
            authorId
        ]);
        
        const createdCourse = await getCourseById(newId);
        if (!createdCourse) throw new Error('Gagal memverifikasi kursus yang baru dibuat.');
        
        return createdCourse;
    } catch (error) {
        console.error("🔴 Gagal membuat kursus baru:", error);
        throw error;
    }
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'authorId'>>, actorId: string): Promise<Course> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [actorRows] = await connection.query<RowDataPacket[]>('SELECT role FROM users WHERE id = ?', [actorId]);
        if (actorRows.length === 0) throw new Error("Aktor tidak ditemukan.");
        const actorRole = actorRows[0].role;
        
        const [existingRows] = await connection.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ? FOR UPDATE', [id]);
        if (existingRows.length === 0) throw new Error("Kursus tidak ditemukan untuk diperbarui.");

        let courseToUpdate = mapRowToCourse(existingRows[0]);
        
        if (actorRole !== 'admin' && courseToUpdate.authorId !== actorId) {
            throw new Error("Anda tidak memiliki izin untuk mengubah kursus ini.");
        }
        
        courseToUpdate = { ...courseToUpdate, ...data };
        
        const query = `
            UPDATE courses SET 
            title = ?, description = ?, instructor = ?, price = ?, image_url = ?, 
            access_level = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, modules = ?,
            status = ?, reviewNotes = ?
            WHERE id = ?
        `;

        await connection.query(query, [
            courseToUpdate.title,
            courseToUpdate.description,
            courseToUpdate.instructor,
            courseToUpdate.price,
            courseToUpdate.imageUrl,
            courseToUpdate.accessLevel,
            courseToUpdate.seoTitle,
            courseToUpdate.seoDescription,
            courseToUpdate.seoKeywords,
            JSON.stringify(courseToUpdate.modules || []),
            courseToUpdate.status,
            courseToUpdate.reviewNotes,
            id
        ]);
        
        await connection.commit();

        const updatedCourse = await getCourseById(id);
        if (!updatedCourse) throw new Error('Gagal mengambil kursus setelah pembaruan.');

        return updatedCourse;
    } catch (error) {
        await connection.rollback();
        console.error(`🔴 Gagal memperbarui kursus dengan ID ${id}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function deleteCourse(id: string, actorId: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [actorRows] = await connection.query<RowDataPacket[]>('SELECT role FROM users WHERE id = ?', [actorId]);
        if (actorRows.length === 0) throw new Error("Aktor tidak ditemukan.");
        const actorRole = actorRows[0].role;

        const [courseRows] = await connection.query<RowDataPacket[]>('SELECT authorId FROM courses WHERE id = ? FOR UPDATE', [id]);
        if (courseRows.length === 0) throw new Error("Kursus tidak ditemukan untuk dihapus.");

        if(actorRole !== 'admin' && courseRows[0].authorId !== actorId) {
            throw new Error("Anda tidak memiliki izin untuk menghapus kursus ini.");
        }

        const [result] = await connection.query<ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            throw new Error("Gagal menghapus kursus, ID tidak ditemukan.");
        }
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
    const [result] = await pool.query<ResultSetHeader>(
        "UPDATE courses SET status = 'pending_review' WHERE id = ? AND authorId = ? AND status IN ('draft', 'rejected')",
        [courseId, authorId]
    );
    if (result.affectedRows === 0) {
        throw new Error("Kursus tidak dapat diajukan untuk review. Pastikan Anda adalah pemilik dan statusnya adalah draft.");
    }
}

export async function publishCourse(courseId: string): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
        "UPDATE courses SET status = 'published' WHERE id = ? AND status = 'pending_review'",
        [courseId]
    );
    if (result.affectedRows === 0) {
        throw new Error("Hanya kursus yang sedang direview yang dapat dipublikasikan.");
    }
}

export async function rejectCourse(courseId: string, reviewNotes: string): Promise<void> {
    await pool.query(
        "UPDATE courses SET status = 'rejected', reviewNotes = ? WHERE id = ? AND status = 'pending_review'",
        [reviewNotes, courseId]
    );
}

