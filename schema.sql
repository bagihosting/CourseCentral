-- ====================================================================
-- SKEMA DATABASE SCRIPTIFY (MariaDB/MySQL)
-- ====================================================================
-- Versi: 1.1
-- Deskripsi: Skema ini mencakup semua tabel yang diperlukan untuk
-- menjalankan aplikasi Scriptify dengan database MariaDB, menggantikan
-- ketergantungan pada localStorage.
-- ====================================================================

-- --------------------------------------------------------------------
-- Tabel Inti Pengguna & Otentikasi
-- Fitur yang Dicakup: Pendaftaran, Login, Pengaturan Akun, Total Pengguna
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Harus di-hash dalam produksi nyata
  `role` ENUM('admin', 'member', 'pro') NOT NULL DEFAULT 'member',
  `avatarUrl` TEXT,
  `whatsapp` VARCHAR(20),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `loginCount` INT NOT NULL DEFAULT 0,
  `referralCode` VARCHAR(255) NOT NULL UNIQUE,
  `referredBy` VARCHAR(255),
  `affiliateBalance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------
-- Tabel Manajemen Kursus
-- Fitur yang Dicakup: Katalog Kursus, Kursus Saya, Kursus Diikuti, Total Kursus, Total Pelajaran
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `instructor` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `imageUrl` TEXT,
  `accessLevel` ENUM('public', 'pro') NOT NULL DEFAULT 'public',
  `seoTitle` VARCHAR(255),
  `seoDescription` TEXT,
  `seoKeywords` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `modules` (
  `id` VARCHAR(255) NOT NULL,
  `courseId` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `orderIndex` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lessons` (
  `id` VARCHAR(255) NOT NULL,
  `moduleId` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('video', 'youtube', 'text', 'zip') NOT NULL,
  `contentUrl` TEXT,
  `content` LONGTEXT,
  `downloadable` BOOLEAN NOT NULL DEFAULT FALSE,
  `orderIndex` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `enrollments` (
  `userId` VARCHAR(255) NOT NULL,
  `courseId` VARCHAR(255) NOT NULL,
  `enrolledAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`, `courseId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `userId` VARCHAR(255) NOT NULL,
  `lessonId` VARCHAR(255) NOT NULL,
  `completedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`, `lessonId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------
-- Tabel Permintaan & Transaksi
-- Fitur yang Dicakup: Permintaan Pro, Permintaan Sertifikat, Request Aplikasi
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `upgrade_requests` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `bankName` VARCHAR(255) NOT NULL,
  `accountHolder` VARCHAR(255) NOT NULL,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'approved') NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certificate_requests` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `courseId` VARCHAR(255) NOT NULL,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'approved') NOT NULL,
  `certificateHtml` LONGTEXT,
  `approvedAt` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `custom_app_requests` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `appName` VARCHAR(255) NOT NULL,
  `appKeywords` TEXT,
  `topology` JSON,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending_approval', 'in_progress', 'completed', 'rejected') NOT NULL,
  `paymentDetails` JSON,
  `adminNotes` TEXT,
  `resultLink` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------
-- Tabel Afiliasi & Testimoni
-- Fitur yang Dicakup: Afiliasi, Testimoni dan Ulasan Anda
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `affiliate_payouts` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payoutDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL UNIQUE, -- Satu testimoni per pengguna
  `quote` TEXT NOT NULL,
  `rating` TINYINT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------
-- Tabel Pengaturan Global & Lainnya
-- Fitur yang Dicakup: Pengaturan Global, Pengaturan Aplikasi, Halaman Depan
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `payment_accounts` (
  `id` VARCHAR(255) NOT NULL,
  `bankName` VARCHAR(255) NOT NULL,
  `accountNumber` VARCHAR(100) NOT NULL,
  `accountHolder` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `confirmation_contacts` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(255) NOT NULL,
  `value` JSON,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catatan: Pengaturan seperti SEO dan Landing Page dapat disimpan di tabel `settings`
-- dengan `key` = 'seoSettings' atau 'landingPageSettings' dan `value` berisi objek JSON.
-- Ini memberikan fleksibilitas untuk menambahkan pengaturan baru tanpa mengubah skema.

CREATE TABLE IF NOT EXISTS `ai_apps` (
    `id` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `icon` VARCHAR(100),
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anda perlu mengisi tabel `ai_apps` dan `settings` dengan data awal
-- menggunakan pernyataan INSERT setelah tabel dibuat.
