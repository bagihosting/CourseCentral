import { NextResponse } from 'next/server';
import { validateApiKey } from '@/actions/api-keys';
import { getLandingPageSettings } from '@/actions/settings';

/**
 * @swagger
 * /api/v1/ai-apps:
 *   get:
 *     summary: Mengambil daftar aplikasi AI yang tersedia.
 *     description: Mengembalikan daftar semua aplikasi AI yang telah diaktifkan di platform.
 *     tags:
 *       - AI Apps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar aplikasi AI berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AiApp'
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
    const settings = await getLandingPageSettings();
    const aiApps = settings.aiApps || [];
    return NextResponse.json(aiApps);
  } catch (error) {
    console.error("API Error fetching AI Apps:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AiApp:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unik aplikasi AI.
 *         title:
 *           type: string
 *           description: Judul aplikasi AI.
 *         description:
 *           type: string
 *           description: Deskripsi singkat aplikasi AI.
 *         icon:
 *           type: string
 *           description: Nama ikon dari Lucide React.
 *         enabled:
 *           type: boolean
 *           description: Status apakah aplikasi AI diaktifkan atau tidak.
 */
