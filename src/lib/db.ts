
import mysql, { type Pool } from 'mysql2/promise';

let poolInstance: Pool | null = null;

/**
 * Initializes and returns a singleton instance of the MariaDB connection pool.
 * This lazy initialization prevents connection issues with Next.js middleware.
 */
export const getPool = (): Pool => {
  if (poolInstance) {
    return poolInstance;
  }
  
  poolInstance = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return poolInstance;
};
