
import { getPool } from '@/lib/db';
import type { Course, CourseForReview } from '@/types';
import type { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';

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

export async function fetchAllCoursesFromDb(tenantId: string): Promise<Course[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM courses WHERE status = 'published' AND tenant_id = ? ORDER BY created_at DESC", [tenantId]);
  return rows.map(mapRowToCourse);
}

export async function fetchAllCoursesForAdminFromDb(tenantId: string): Promise<Course[]> {
  const pool = getPool();
  if (tenantId === 'platform_main') {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses ORDER BY created_at DESC');
      return rows.map(mapRowToCourse);
  }
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
  return rows.map(mapRowToCourse);
}

export async function fetchCoursesByAuthorFromDb(authorId: string, tenantId: string): Promise<Course[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE authorId = ? AND tenant_id = ? ORDER BY created_at DESC', [authorId, tenantId]);
  return rows.map(mapRowToCourse);
}

export async function fetchCoursesForReviewFromDb(tenantId: string): Promise<CourseForReview[]> {
    const pool = getPool();
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
}

export async function fetchCourseByIdFromDb(id: string, connection?: PoolConnection): Promise<Course | null> {
    const db = connection || getPool();
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return mapRowToCourse(rows[0]);
}

export async function createCourseInDb(
  data: Omit<Course, 'id' | 'modules' | 'status' | 'reviewNotes' | 'created_at' | 'updated_at' | 'authorId' | 'tenant_id'>,
  authorId: string,
  tenantId: string
): Promise<Course> {
    const pool = getPool();
    const newId = `course_${Date.now()}`;
    const query = `INSERT INTO courses (id, tenant_id, title, description, instructor, price, image_url, access_level, seo_title, seo_description, seo_keywords, modules, authorId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`;
    
    await pool.query(query, [
        newId, tenantId, data.title, data.description, data.instructor,
        data.price, data.imageUrl, data.accessLevel, data.seoTitle || '',
        data.seoDescription || '', data.seoKeywords || '', '[]', authorId
    ]);
    
    const createdCourse = await fetchCourseByIdFromDb(newId);
    if (!createdCourse) throw new Error('Gagal memverifikasi kursus yang baru dibuat.');
    
    return createdCourse;
}

export async function updateCourseInDb(id: string, data: Partial<Omit<Course, 'id' | 'authorId' | 'tenant_id'>>, connection: PoolConnection): Promise<Course> {
    const existingCourse = await fetchCourseByIdFromDb(id, connection);
    if (!existingCourse) throw new Error('Kursus tidak ditemukan untuk pembaruan.');

    const updatedData = { ...existingCourse, ...data };
    
    const query = `
        UPDATE courses SET 
        title = ?, description = ?, instructor = ?, price = ?, image_url = ?, 
        access_level = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, modules = ?,
        status = ?, reviewNotes = ?
        WHERE id = ?
    `;

    await connection.query(query, [
        updatedData.title, updatedData.description, updatedData.instructor, updatedData.price,
        updatedData.imageUrl, updatedData.accessLevel, updatedData.seoTitle, updatedData.seoDescription,
        updatedData.seoKeywords, JSON.stringify(updatedData.modules || []),
        updatedData.status, updatedData.reviewNotes, id
    ]);
    
    const updatedCourse = await fetchCourseByIdFromDb(id, connection);
    if (!updatedCourse) throw new Error('Gagal mengambil kursus setelah pembaruan.');

    return updatedCourse;
}

export async function deleteCourseFromDb(id: string, connection: PoolConnection): Promise<void> {
    await connection.query<ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);
}
