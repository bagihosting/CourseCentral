
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
    };
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses ORDER BY created_at DESC');
    return rows.map(mapRowToCourse);
  } catch (error) {
    console.error("🔴 Gagal mengambil semua kursus:", error);
    throw error;
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        return mapRowToCourse(rows[0]);
    } catch (error) {
        console.error(`🔴 Gagal mengambil kursus dengan ID ${id}:`, error);
        throw error;
    }
}

export async function createCourse(data: Omit<Course, 'id' | 'modules'>): Promise<Course> {
    const newId = `course_${Date.now()}`;
    const query = `INSERT INTO courses (id, title, description, instructor, price, image_url, access_level, seo_title, seo_description, seo_keywords, modules) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
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
            '[]' // Mulai dengan modul kosong
        ]);
        
        const createdCourse = await getCourseById(newId);
        if (!createdCourse) throw new Error('Gagal memverifikasi kursus yang baru dibuat.');
        
        return createdCourse;
    } catch (error) {
        console.error("🔴 Gagal membuat kursus baru:", error);
        throw error;
    }
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id'>>): Promise<Course> {
    try {
        const [existingRows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            throw new Error("Kursus tidak ditemukan untuk diperbarui.");
        }

        const courseToUpdate = { ...mapRowToCourse(existingRows[0]), ...data };
        
        const query = `
            UPDATE courses SET 
            title = ?, description = ?, instructor = ?, price = ?, image_url = ?, 
            access_level = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, modules = ?, updated_at = NOW()
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
        // Asumsikan foreign keys di database diatur ke ON DELETE CASCADE
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            throw new Error("Gagal menghapus kursus, ID tidak ditemukan.");
        }
    } catch (error) {
        console.error(`🔴 Gagal menghapus kursus dengan ID ${id}:`, error);
        throw error;
    }
}
