
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/actions/api-keys';
import { getAllCourses } from '@/actions/courses';

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Mengambil semua kursus yang telah dipublikasikan.
 *     description: Mengembalikan daftar lengkap kursus yang saat ini berstatus 'published'.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar kursus berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Tidak terotorisasi. API key hilang atau tidak valid.
 *       500:
 *         description: Terjadi kesalahan internal pada server.
 */
export async function GET(request: Request) {
  // 1. Ambil API key dari header Authorization
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key format.' }, { status: 401 });
  }

  const apiKey = authHeader.substring(7); // "Bearer ".length

  // 2. Validasi API key
  const isValid = await validateApiKey(apiKey);

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
  }

  // 3. Jika valid, ambil data kursus dan kembalikan
  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("API Error fetching courses:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unik kursus.
 *         title:
 *           type: string
 *           description: Judul kursus.
 *         description:
 *           type: string
 *           description: Deskripsi singkat kursus.
 *         instructor:
 *           type: string
 *           description: Nama instruktur.
 *         price:
 *           type: number
 *           description: Harga kursus.
 *         imageUrl:
 *           type: string
 *           description: URL gambar thumbnail kursus.
 *         accessLevel:
 *           type: string
 *           enum: [public, pro]
 *           description: Tingkat akses yang diperlukan.
 *         status:
 *           type: string
 *           enum: [published]
 *           description: Status kursus.
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: APIKey
 *       description: "Masukkan API key Anda dengan prefix 'Bearer '"
 */
