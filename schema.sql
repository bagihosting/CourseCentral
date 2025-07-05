-- =====================================================================
-- Skema Database CourseCentral untuk MariaDB/MySQL
-- =====================================================================
-- Panduan:
-- 1. Jalankan skrip ini di dalam database MariaDB Anda untuk membuat
--    semua tabel yang diperlukan.
-- 2. Setelah tabel dibuat, langkah selanjutnya adalah memodifikasi kode
--    di `src/lib/data.ts` untuk berinteraksi dengan tabel-tabel ini
--    menggunakan query SQL, bukan localStorage.
-- =====================================================================


-- -----------------------------------------------------
-- Tabel: users
-- Menyimpan semua data pengguna, termasuk admin dan member.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'member', 'pro') NOT NULL DEFAULT 'member',
  `avatarUrl` TEXT,
  `whatsapp` VARCHAR(20),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `loginCount` INT NOT NULL DEFAULT 0,
  `referralCode` VARCHAR(255) NOT NULL UNIQUE,
  `referredBy` VARCHAR(255),
  `affiliateBalance` INT NOT NULL DEFAULT 0,
  `affiliatePaid` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: courses
-- Menyimpan katalog semua kursus yang tersedia.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `instructor` VARCHAR(255) NOT NULL,
  `price` INT NOT NULL DEFAULT 0,
  `imageUrl` TEXT NOT NULL,
  `accessLevel` ENUM('public', 'pro') NOT NULL DEFAULT 'public',
  `seoTitle` VARCHAR(255),
  `seoDescription` TEXT,
  `seoKeywords` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: modules
-- Modul-modul pembelajaran di dalam setiap kursus.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `modules` (
  `id` VARCHAR(255) NOT NULL,
  `course_id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: lessons
-- Pelajaran-pelajaran di dalam setiap modul.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` VARCHAR(255) NOT NULL,
  `module_id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('video', 'youtube', 'text', 'zip') NOT NULL,
  `contentUrl` TEXT,
  `content` MEDIUMTEXT,
  `downloadable` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: enrollments
-- Mencatat pengguna mana yang terdaftar di kursus mana.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `enrollments` (
  `user_id` VARCHAR(255) NOT NULL,
  `course_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: upgrade_requests
-- Menyimpan riwayat permintaan upgrade ke Pro.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `upgrade_requests` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `bankName` VARCHAR(255) NOT NULL,
  `accountHolder` VARCHAR(255) NOT NULL,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: certificate_requests
-- Menyimpan riwayat permintaan dan sertifikat yang sudah jadi.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `certificate_requests` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `course_id` VARCHAR(255) NOT NULL,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` MEDIUMTEXT,
  `approvedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: custom_app_requests
-- Menyimpan riwayat permintaan aplikasi kustom.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `custom_app_requests` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `appName` VARCHAR(255) NOT NULL,
  `appKeywords` TEXT NOT NULL,
  `topology` JSON,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending_approval', 'in_progress', 'completed', 'rejected') NOT NULL,
  `paymentDetails` JSON,
  `adminNotes` TEXT,
  `resultLink` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: testimonials
-- Menyimpan testimoni dari pengguna.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `quote` TEXT NOT NULL,
  `rating` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_unique` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: payment_accounts
-- Pengaturan rekening bank untuk pembayaran.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_accounts` (
  `id` VARCHAR(255) NOT NULL,
  `bankName` VARCHAR(100) NOT NULL,
  `accountNumber` VARCHAR(100) NOT NULL,
  `accountHolder` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: confirmation_contacts
-- Pengaturan kontak admin untuk konfirmasi.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `confirmation_contacts` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: settings
-- Tabel tunggal untuk menyimpan berbagai pengaturan aplikasi.
-- Menggunakan pendekatan key-value.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(255) NOT NULL,
  `setting_value` JSON,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- Tabel: ai_apps
-- Mengelola aplikasi AI yang tersedia.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_apps` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(100),
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Catatan: Data untuk 'seo_settings' dan 'landing_page_settings' dapat disimpan di
-- tabel `settings` dengan `setting_key` seperti 'seo' dan 'landingPage'.
-- 'setting_value' akan berisi data JSON lengkap untuk setiap pengaturan.
-- Ini memberikan fleksibilitas tanpa harus mengubah skema jika ada penambahan field baru.
