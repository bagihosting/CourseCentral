
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
  } catch (error) {
    console.error("🔴 Gagal mengambil semua kursus untuk admin:", error);
    return [];
  }
}

// For instructors, get their own courses
export async function getCoursesByAuthor(authorId: string): Promise<Course[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE authorId = ? ORDER BY created_at DESC', [authorId]);
    return rows.map(mapRowToCourse);
  } catch (error) {
     console.error(`🔴 Gagal mengambil kursus untuk author ${authorId}:`, error);
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
        console.error("🔴 Gagal mengambil kursus untuk direview:", error);
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

export async function createCourse(data: Omit<Course, 'id' | 'modules' | 'status' | 'authorId' | 'reviewNotes' | 'updated_at'>, authorId: string): Promise<Course> {
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

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'authorId'>>): Promise<Course> {
    try {
        const [existingRows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            throw new Error("Kursus tidak ditemukan untuk diperbarui.");
        }

        const courseToUpdate = { ...mapRowToCourse(existingRows[0]), ...data };
        
        const query = `
            UPDATE courses SET 
            title = ?, description = ?, instructor = ?, price = ?, image_url = ?, 
            access_level = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, modules = ?, updated_at = NOW(),
            status = ?, reviewNotes = ?
            WHERE id = ?
        `;

        await pool.query(query, [
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
        
        const updatedCourse = await getCourseById(id);
        if (!updatedCourse) throw new Error('Gagal mengambil kursus setelah pembaruan.');

        return updatedCourse;
    } catch (error) {
        console.error(`🔴 Gagal memperbarui kursus dengan ID ${id}:`, error);
        throw error;
    }
}

export async function deleteCourse(id: string): Promise<void> {
    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            throw new Error("Gagal menghapus kursus, ID tidak ditemukan.");
        }
    } catch (error) {
        console.error(`🔴 Gagal menghapus kursus dengan ID ${id}:`, error);
        throw error;
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
