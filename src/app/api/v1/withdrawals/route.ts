
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/actions/api-keys';
import { getWithdrawalRequests } from '@/actions/affiliate';

/**
 * @swagger
 * /api/v1/withdrawals:
 *   get:
 *     summary: Mengambil semua permintaan penarikan dana.
 *     description: Mengembalikan daftar lengkap permintaan penarikan dana dari semua pengguna. Diperlukan hak akses admin.
 *     tags:
 *       - Affiliate
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar permintaan berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WithdrawalRequest'
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
    const withdrawalRequests = await getWithdrawalRequests();
    return NextResponse.json(withdrawalRequests);
  } catch (error) {
    console.error("API Error fetching withdrawal requests:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     WithdrawalRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unik permintaan.
 *         userId:
 *           type: string
 *           description: ID pengguna yang meminta.
 *         userName:
 *           type: string
 *           description: Nama pengguna yang meminta.
 *         userAvatar:
 *           type: string
 *           description: URL avatar pengguna.
 *         amount:
 *           type: number
 *           description: Jumlah yang diminta untuk ditarik.
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status permintaan.
 *         bankDetails:
 *           type: object
 *           properties:
 *             bankName:
 *               type: string
 *             accountNumber:
 *               type: string
 *             accountHolder:
 *               type: string
 *         requestDate:
 *           type: string
 *           format: date-time
 *           description: Tanggal permintaan dibuat.
 *         processedDate:
 *           type: string
 *           format: date-time
 *           description: Tanggal permintaan diproses.
 *           nullable: true
 */
