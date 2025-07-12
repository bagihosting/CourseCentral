
-- =================================================================
-- SKEMA DATABASE UNTUK COURSE CENTRAL
-- Versi: 2.0.0
-- Terakhir Diperbarui: 25 Agustus 2024
-- =================================================================

-- Hapus tabel jika sudah ada untuk instalasi ulang yang bersih
DROP TABLE IF EXISTS `lesson_progress`, `enrollments`, `commissions`, `withdrawal_requests`, `instructor_applications`, `reseller_applications`, `certificate_requests`, `upgrade_requests`, `api_keys`, `settings`, `testimonials`, `payment_accounts`, `confirmation_contacts`, `courses`, `users`, `tenants`;

-- --------------------------------------------------------
-- STRUKTUR TABEL `tenants`
-- Menyimpan data untuk setiap instansi/reseller (SaaS).
-- --------------------------------------------------------
CREATE TABLE `tenants` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `subdomain` varchar(100) NOT NULL UNIQUE,
  `ownerId` varchar(50) NOT NULL,
  `brandName` varchar(255) DEFAULT NULL,
  `brandLogoUrl` varchar(255) DEFAULT NULL,
  `brandPrimaryColor` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- STRUKTUR TABEL `users`
-- Menyimpan data pengguna, termasuk peran dan afiliasi.
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `tenant_id` varchar(50) NOT NULL DEFAULT 'platform_main',
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member','pro','instructor','reseller') NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(25) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) DEFAULT 0,
  `referralCode` varchar(10) NOT NULL UNIQUE,
  `referredBy` varchar(10) DEFAULT NULL,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `resellerStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) DEFAULT 0,
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  `affiliateBalance` decimal(10,2) DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) DEFAULT 0.00,
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- STRUKTUR TABEL `courses`
-- Menyimpan data kursus.
-- --------------------------------------------------------
CREATE TABLE `courses` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `tenant_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `modules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`modules`)),
  `access_level` enum('public','pro') NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` varchar(255) DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') NOT NULL DEFAULT 'draft',
  `authorId` varchar(50) NOT NULL,
  `reviewNotes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `authorId` (`authorId`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- STRUKTUR TABEL `enrollments`, `lesson_progress`, dll.
-- --------------------------------------------------------
CREATE TABLE `enrollments` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `courseId` varchar(50) NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT current_timestamp(),
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  UNIQUE KEY `user_course_unique` (`userId`,`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  UNIQUE KEY `user_lesson_unique` (`userId`,`lessonId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commissions` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('referral','instructor_milestone') NOT NULL,
  `sourceUserId` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  KEY `userId` (`userId`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `withdrawal_requests` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bankDetails` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `processedDate` timestamp NULL DEFAULT NULL,
  KEY `userId` (`userId`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `instructor_applications` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `instructor_applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reseller_applications` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `reseller_applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `certificate_requests` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `courseId` varchar(50) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` longtext DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  UNIQUE KEY `user_course_unique` (`userId`, `courseId`),
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `upgrade_requests` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `userId` varchar(50) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `custom_app_requests` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `userId` VARCHAR(50) NOT NULL,
    `appName` VARCHAR(255) NOT NULL,
    `appKeywords` TEXT NOT NULL,
    `topology` JSON NOT NULL,
    `paymentDetails` JSON NOT NULL,
    `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('pending_approval', 'in_progress', 'completed', 'rejected') NOT NULL DEFAULT 'pending_approval',
    `adminNotes` TEXT,
    `resultLink` VARCHAR(255),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `api_keys` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `hashed_key` varchar(255) NOT NULL,
  `prefix` varchar(15) NOT NULL,
  `created_by` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL,
  KEY `created_by` (`created_by`),
  CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` varchar(50) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  UNIQUE KEY `tenant_key_unique` (`tenant_id`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `testimonials` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `tenant_id` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `quote` text NOT NULL,
  `rating` tinyint(1) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_accounts` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `tenant_id` varchar(50) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `accountNumber` varchar(50) NOT NULL,
  `accountHolder` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `confirmation_contacts` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `tenant_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `whatsapp` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =================================================================
-- DATA AWAL (DEFAULT DATA)
-- =================================================================

-- Data tenant utama dan tenant sampel
INSERT INTO `tenants` (`id`, `name`, `subdomain`, `ownerId`) VALUES
('platform_main', 'CourseCentral Main', 'www', 'user_superadmin'),
('tnt_1', 'Akademi Koding', 'demo', 'user_tenantadmin');

-- Data pengguna default untuk berbagai peran
-- Password untuk semua akun default adalah 'password' (hash: $2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6)
INSERT INTO `users` (`id`, `tenant_id`, `name`, `username`, `password`, `role`, `referralCode`, `instructorStatus`, `resellerStatus`) VALUES
('user_admin', 'platform_main', 'Admin', 'admin', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'admin', 'ADMIN', 'none', 'none'),
('user_superadmin', 'platform_main', 'Super Admin', 'superadmin', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'admin', 'SUPERADMIN', 'none', 'none'),
('user_tenantadmin', 'tnt_1', 'Tenant Admin', 'tenantadmin', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'admin', 'TENANTADMIN', 'none', 'none'),
('user_reseller', 'platform_main', 'Reseller User', 'reseller', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'reseller', 'RESELLER', 'none', 'approved'),
('user_instructor', 'tnt_1', 'Pengajar Cerdas', 'pengajar', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'instructor', 'PENGAJAR', 'approved', 'none'),
('user_pro', 'tnt_1', 'Member Pro', 'memberpro', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'pro', 'MEMBERPRO', 'none', 'none'),
('user_member', 'tnt_1', 'Member Biasa', 'memberbiasa', '$2a$10$Y.u5n4i9bQ7L/cAVDQM1.uLBEJ2e.32A.uYV1jRqP/8IdT52uL0J6', 'member', 'MEMBER', 'none', 'none');


-- Mengatur foreign key constraint setelah semua data dimasukkan
ALTER TABLE `tenants`
  ADD CONSTRAINT `tenants_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

-- Menambahkan data payment default untuk tenant demo
INSERT INTO `payment_accounts` (`id`, `tenant_id`, `bankName`, `accountNumber`, `accountHolder`) VALUES
('pa_1', 'tnt_1', 'Bank BCA', '8881234567', 'PT Akademi Koding Indonesia'),
('pa_2', 'tnt_1', 'Bank Mandiri', '1230009876543', 'PT Akademi Koding Indonesia');

-- Menambahkan data kontak konfirmasi default untuk tenant demo
INSERT INTO `confirmation_contacts` (`id`, `tenant_id`, `name`, `whatsapp`) VALUES
('cc_1', 'tnt_1', 'Admin Support 1', '6281234567890');


-- Menambahkan contoh kursus untuk tenant demo
INSERT INTO `courses` (`id`, `tenant_id`, `title`, `description`, `instructor`, `price`, `image_url`, `modules`, `access_level`, `status`, `authorId`) VALUES
('course_1', 'tnt_1', 'Dasar-Dasar HTML & CSS', 'Pelajari fondasi pengembangan web dengan menguasai HTML untuk struktur dan CSS untuk styling. Cocok untuk pemula.', 'Pengajar Cerdas', 0, 'https://placehold.co/600x400.png', '{"modules": []}', 'public', 'published', 'user_instructor'),
('course_2', 'tnt_1', 'JavaScript untuk Pemula', 'Masuki dunia pemrograman interaktif dengan JavaScript. Pelajari variabel, fungsi, dan manipulasi DOM.', 'Pengajar Cerdas', 50000, 'https://placehold.co/600x400.png', '{"modules": []}', 'pro', 'published', 'user_instructor');

COMMIT;
