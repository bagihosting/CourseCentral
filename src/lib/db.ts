import mysql from 'mysql2/promise';

// Konfigurasi ini akan membaca variabel lingkungan yang disediakan oleh Docker
// atau dari file .env.local Anda.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Koneksi database MariaDB berhasil.");
        connection.release();
    } catch (error) {
        console.error("❌ GAGAL TERHUBUNG KE DATABASE ❌");
        console.error("==========================================");
        console.error("Ini biasanya terjadi karena salah satu dari alasan berikut:");
        console.error("1. Kontainer Docker untuk MariaDB belum berjalan. Coba jalankan `docker-compose up -d`.");
        console.error("2. Detail koneksi di file .env Anda salah (host, user, password, atau nama database).");
        console.error("3. Firewall memblokir koneksi ke port 3306.");
        console.error("\nDetail Error Asli:");
        console.error(error);
        console.error("==========================================");
    }
}

// Jalankan tes koneksi saat aplikasi dimulai
testConnection();
