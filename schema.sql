
-- Versi Skema: 7
-- Peningkatan: Fondasi Multi-Tenancy

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Tabel `tenants` (BARU)
-- Menyimpan informasi untuk setiap entitas tenant/situs.
--
CREATE TABLE `tenants` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subdomain` varchar(255) NOT NULL,
  `ownerId` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `brandLogoUrl` varchar(255) DEFAULT NULL,
  `brandPrimaryColor` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subdomain` (`subdomain`),
  ADD KEY `ownerId` (`ownerId`);

--
-- Tabel `users`
-- Modifikasi: Ditambahkan kolom `tenant_id`.
--
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member','pro','instructor') NOT NULL,
  `avatarUrl` varchar(255) NOT NULL DEFAULT 'https://placehold.co/256x256.png',
  `whatsapp` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(20) NOT NULL,
  `referredBy` varchar(20) DEFAULT NULL,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) DEFAULT 0,
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  `affiliateBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`tenant_id`, `username`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Tabel `courses`
-- Modifikasi: Ditambahkan kolom `tenant_id`.
--
CREATE TABLE `courses` (
  `id` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) NOT NULL,
  `modules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]',
  `access_level` enum('public','pro') NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` varchar(255) DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) NOT NULL,
  `reviewNotes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `authorId` (`authorId`),
  ADD KEY `status` (`status`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Tabel `enrollments`
-- Modifikasi: Ditambahkan kolom `tenant_id`.
--
CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_course_enrollment` (`userId`,`courseId`),
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  KEY `tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Sisanya adalah tabel yang bersifat global (tidak spesifik tenant) atau sudah benar.
-- Tabel yang tidak memerlukan `tenant_id`: api_keys, settings, payment_accounts, confirmation_contacts.
-- Tabel `instructor_branding` secara implisit terikat ke tenant melalui `userId`.

CREATE TABLE `api_keys` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `hashed_key` varchar(255) NOT NULL,
  `prefix` varchar(10) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prefix` (`prefix`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `created_by` (`created_by`);

CREATE TABLE `certificate_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` text DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `certificate_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_course_cert` (`userId`,`courseId`);

CREATE TABLE `commissions` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('referral','instructor_milestone') NOT NULL,
  `sourceUserId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `confirmation_contacts`
  ADD PRIMARY KEY (`id`);

CREATE TABLE `custom_app_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `appName` varchar(255) NOT NULL,
  `appKeywords` text NOT NULL,
  `topology` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending_approval','in_progress','completed','rejected') NOT NULL DEFAULT 'pending_approval',
  `paymentDetails` text NOT NULL,
  `adminNotes` text DEFAULT NULL,
  `resultLink` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `custom_app_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

CREATE TABLE `instructor_applications` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `instructor_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

CREATE TABLE `instructor_branding` (
  `userId` varchar(255) NOT NULL,
  `customDomain` varchar(255) DEFAULT NULL,
  `brandName` varchar(255) DEFAULT NULL,
  `brandLogoUrl` varchar(255) DEFAULT NULL,
  `brandPrimaryColor` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `instructor_branding`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `customDomain` (`customDomain`);

CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_lesson_progress` (`userId`,`lessonId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `payment_accounts`
  ADD PRIMARY KEY (`id`);

CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

CREATE TABLE `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

CREATE TABLE `upgrade_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `upgrade_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL,
  `bankDetails` text NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `processedDate` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Menambahkan Foreign Keys
--
ALTER TABLE `tenants`
  ADD CONSTRAINT `tenants_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

-- Data Awal: Platform Utama sebagai Tenant Pertama
-- Tenant ini tidak bisa dihapus dan menjadi "Super Admin" tenant.
INSERT INTO `tenants` (`id`, `name`, `subdomain`, `ownerId`) VALUES
('platform_main', 'Platform Utama', 'www', 'user_admin');

-- Pengguna Admin Default untuk Platform Utama
INSERT INTO `users` (`id`, `tenant_id`, `name`, `username`, `password`, `role`, `referralCode`) VALUES
('user_admin', 'platform_main', 'Super Admin', 'admin', '$2b$10$D9yL4c4n9g.V3k3Z0m2v5eG8g7H7Y9o/4N.O1J/j/E3x8Q6R0l4A.', 'admin', 'ADMINREF');


COMMIT;
