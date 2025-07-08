
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
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT 1 FROM enrollments WHERE userId = ? AND courseId = ? LIMIT 1', 
        [userId, courseId]
    );
    return rows.length > 0;
  } catch (error) {
      console.error(`Gagal memeriksa pendaftaran untuk pengguna ${userId} di kursus ${courseId}:`, error);
      throw error;
  }
}

export async function enrollUserInCourse(userId: string, courseId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required to enroll.");
  
  try {
    const enrolled = await isUserEnrolled(userId, courseId);
    if (enrolled) return;
    await pool.query('INSERT INTO enrollments (userId, courseId) VALUES (?, ?)', [userId, courseId]);
  } catch (error) {
      console.error(`Gagal mendaftarkan pengguna ${userId} ke kursus ${courseId}:`, error);
      throw error;
  }
}

export async function getEnrolledCoursesForUser(userId: string): Promise<Course[]> {
  if (!userId) return [];
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT c.* 
        FROM courses c
        JOIN enrollments e ON c.id = e.courseId
        WHERE e.userId = ?
    `, [userId]);
    return rows.map(mapRowToCourse);
  } catch (error) {
      console.error(`Gagal mengambil kursus terdaftar untuk pengguna ${userId}:`, error);
      throw error;
  }
}

export async function getCompletedCourseCount(userId: string): Promise<number> {
    if (!userId) return 0;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(DISTINCT courseId) as count FROM certificate_requests WHERE userId = ? AND status = ?',
            [userId, 'approved']
        );
        return rows[0].count || 0;
    } catch (error) {
        console.error(`Gagal mengambil jumlah kursus selesai untuk pengguna ${userId}:`, error);
        throw error;
    }
}

export async function trackLessonProgress(userId: string, lessonId: string): Promise<void> {
    if (!userId || !lessonId) return;
    try {
        await pool.query(
            'INSERT INTO lesson_progress (userId, lessonId, completedAt) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE completedAt = NOW()',
            [userId, lessonId]
        );
    } catch (error) {
        console.error("Gagal melacak kemajuan pelajaran:", error);
        throw error;
    }
}

export async function getCompletedLessonIds(userId: string, courseId: string): Promise<Set<string>> {
    try {
        const [course] = await pool.query<RowDataPacket[]>('SELECT modules FROM courses WHERE id = ?', [courseId]);
        if (course.length === 0) return new Set();
        
        const modules = JSON.parse(course[0].modules || '[]');
        const lessonIdsInCourse = modules.flatMap((m: any) => m.lessons.map((l: any) => l.id));

        if (lessonIdsInCourse.length === 0) return new Set();

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT lessonId FROM lesson_progress WHERE userId = ? AND lessonId IN (?)',
            [userId, lessonIdsInCourse]
        );

        return new Set(rows.map(row => row.lessonId));
    } catch (error) {
        console.error(`Gagal mengambil pelajaran selesai untuk pengguna ${userId} di kursus ${courseId}:`, error);
        throw error;
    }
}
