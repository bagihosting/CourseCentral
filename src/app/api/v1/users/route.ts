import { NextResponse } from 'next/server';
import { validateApiKey } from '@/actions/api-keys';
import { getAllUsers } from '@/actions/users';

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Mengambil semua pengguna.
 *     description: Mengembalikan daftar lengkap semua pengguna yang terdaftar di platform. Memerlukan hak akses admin.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserApiResponse'
 *       401:
 *         description: Tidak terotorisasi. API key hilang atau tidak valid.
 *       500:
 *         description: Terjadi kesalahan internal pada server.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key format.' }, { status: 401 });
  }

  const apiKey = authHeader.substring(7);
  const isValid = await validateApiKey(apiKey);

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
  }

  try {
    const users = await getAllUsers();
    // The getAllUsers action already returns a safe user object without the password hash.
    return NextResponse.json(users);
  } catch (error) {
    console.error("API Error fetching users:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserApiResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, member, pro, instructor]
 *         avatarUrl:
 *           type: string
 *         whatsapp:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         loginCount:
 *           type: integer
 *         referralCode:
 *           type: string
 *         referredBy:
 *           type: string
 *           nullable: true
 *         instructorStatus:
 *           type: string
 *           enum: [none, pending, approved, rejected]
 *         affiliateBalance:
 *           type: number
 *         affiliatePaid:
 *           type: number
 */
