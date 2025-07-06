import mysql from 'mysql2/promise';

// Konfigurasi ini akan membaca variabel lingkungan yang disediakan oleh Docker
// atau dari file .env.local Anda.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
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
    } catch (error: any) { // Type as any to access error.code
        console.error("❌ GAGAL TERHUBUNG KE DATABASE ❌");
        console.error("==================================================================");
        
        if (error.code === 'ECONNREFUSED') {
            console.error("KESALAHAN: ECONNREFUSED - Koneksi ditolak.");
            console.error("Ini berarti aplikasi Anda tidak dapat menemukan server database di alamat yang ditentukan.");
            console.error("\nSOLUSI YANG MUNGKIN:");
            console.error("1. PASTIKAN server MariaDB Anda (misalnya dari XAMPP, Laragon, atau Docker) sedang berjalan.");
            console.error(`2. PERIKSA file .env.local atau .env Anda. Pastikan DB_HOST dan DB_PORT sudah benar. Saat ini: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
            console.error("3. JIKA MENGGUNAKAN DOCKER: Pastikan container database berjalan dengan perintah `docker-compose ps`.");
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("KESALAHAN: ER_ACCESS_DENIED_ERROR - Akses ditolak.");
            console.error("Ini berarti username atau password database Anda salah.");
             console.error("\nSOLUSI YANG MUNGKIN:");
            console.error("1. PERIKSA file .env.local atau .env Anda. Pastikan DB_USER dan DB_PASSWORD sudah benar.");
        } else if (error.code === 'ER_BAD_DB_ERROR') {
             console.error(`KESALAHAN: ER_BAD_DB_ERROR - Database tidak ditemukan.`);
             console.error(`Database dengan nama "${process.env.DB_NAME}" tidak ada.`);
             console.error("\nSOLUSI YANG MUNGKIN:");
             console.error("1. BUAT database dengan nama tersebut di MariaDB Anda.");
             console.error("2. ATAU, perbaiki nilai DB_NAME di file .env.local atau .env Anda.");
        }

        console.error("\nDETAIL ERROR ASLI:");
        console.error(error);
        console.error("==================================================================");
    }
}

// Jalankan tes koneksi saat aplikasi dimulai
if (process.env.NODE_ENV !== 'production') {
    testConnection();
}
