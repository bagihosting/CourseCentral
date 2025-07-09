
import mysql from 'mysql2/promise';

// Konfigurasi ini akan membaca variabel lingkungan yang disediakan oleh Docker
// atau dari file .env.local Anda.
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Koneksi database MariaDB berhasil.");
        connection.release();
    } catch (error: any) {
        console.error("❌ GAGAL TERHUBUNG KE DATABASE ❌");
        console.error("==================================================================");
        
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;

        if (error.code === 'ECONNREFUSED') {
            console.error("KESALAHAN: ECONNREFUSED - Koneksi ditolak.");
            console.error(`Ini berarti aplikasi Anda tidak dapat menemukan server database di alamat: ${dbHost}:${dbPort}`);
            console.error("\nSOLUSI YANG MUNGKIN:");
            console.error("1. PASTIKAN server MariaDB Anda (misalnya dari XAMPP, Laragon, atau Docker) sedang berjalan.");
            console.error("2. PERIKSA file .env atau .env.local Anda. Pastikan DB_HOST dan DB_PORT sudah benar.");
            console.error("3. JIKA MENGGUNAKAN DOCKER: Pastikan container database berjalan dengan perintah `docker-compose ps` dan statusnya 'Up'.");
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("KESALAHAN: ER_ACCESS_DENIED_ERROR - Akses ditolak.");
            console.error("Ini berarti username atau password database Anda salah.");
             console.error("\nSOLUSI YANG MUNGKIN:");
            console.error("1. PERIKSA file .env atau .env.local Anda. Pastikan DB_USER dan DB_PASSWORD sudah benar.");
        } else if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`KESALAHAN: ER_BAD_DB_ERROR - Database tidak ditemukan.`);
             console.error(`Database dengan nama "${process.env.DB_NAME}" tidak ada.`);
             console.error("\nSOLUSI YANG MUNGKIN:");
             console.error("1. BUAT database dengan nama tersebut di MariaDB Anda.");
             console.error("2. ATAU, perbaiki nilai DB_NAME di file .env atau .env.local Anda.");
        } else {
            console.error("Terjadi kesalahan koneksi yang tidak terduga.");
        }

        console.error("\nDETAIL ERROR ASLI:");
        console.error(error.message);
        console.error("==================================================================");
        // Jangan throw error di sini agar aplikasi tidak crash saat startup,
        // ini memungkinkan debugging yang lebih mudah.
    }
}
