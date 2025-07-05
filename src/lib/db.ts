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

console.log('Koneksi pool database MariaDB telah dibuat.');
