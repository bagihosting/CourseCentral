
CREATE DATABASE IF NOT EXISTS `coursecentral_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `coursecentral_db`;

--
-- Table structure for table `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','member','pro','instructor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referredBy` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructorStatus` enum('none','pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) DEFAULT 0,
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  `affiliateBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `referralCode_UNIQUE` (`referralCode`),
  KEY `idx_referredBy` (`referredBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--
INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `avatarUrl`, `whatsapp`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `instructorStatus`) VALUES
('user_admin', 'Admin', 'admin', '$2b$10$E9pZ.OMpS7j8D5E5E9j3h.sL8t3pZ5f6bA7c8d9e0f1g2h3j4k5', 'admin', 'https://placehold.co/256x256.png', '081234567890', NOW(), NULL, 'active', 0, 'ADMINREF', NULL, 'approved');

--
-- Table structure for table `courses`
--
CREATE TABLE IF NOT EXISTS `courses` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modules` json DEFAULT NULL,
  `access_level` enum('public','pro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_authorId` (`authorId`),
  CONSTRAINT `fk_courses_author` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `enrollments`
--
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_course` (`userId`,`courseId`),
  KEY `idx_enrollment_userId` (`userId`),
  KEY `idx_enrollment_courseId` (`courseId`),
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `lesson_progress`
--
CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lessonId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`lessonId`),
  KEY `idx_lesson_progress_userId` (`userId`),
  CONSTRAINT `fk_lesson_progress_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `upgrade_requests`
--
CREATE TABLE IF NOT EXISTS `upgrade_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_upgrade_requests_userId` (`userId`),
  CONSTRAINT `fk_upgrade_requests_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `certificate_requests`
--
CREATE TABLE IF NOT EXISTS `certificate_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `certificateHtml` longtext COLLATE utf8mb4_unicode_ci,
  `approvedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cert_user_course` (`userId`, `courseId`),
  KEY `idx_certificate_requests_userId` (`userId`),
  KEY `idx_certificate_requests_courseId` (`courseId`),
  CONSTRAINT `fk_certificate_requests_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_certificate_requests_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `instructor_applications`
--
CREATE TABLE IF NOT EXISTS `instructor_applications` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_instructor_applications_userId` (`userId`),
  CONSTRAINT `fk_instructor_applications_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `instructor_branding`
--
CREATE TABLE `instructor_branding` (
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customDomain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandLogoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandPrimaryColor` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `customDomain_UNIQUE` (`customDomain`),
  CONSTRAINT `fk_instructor_branding_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `commissions`
--
CREATE TABLE `commissions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('referral','instructor_milestone') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceUserId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_commissions_userId` (`userId`),
  KEY `idx_commissions_sourceUserId` (`sourceUserId`),
  CONSTRAINT `fk_commissions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commissions_sourceUser` FOREIGN KEY (`sourceUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `withdrawal_requests`
--
CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `bankDetails` json NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processedDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_withdrawal_requests_userId` (`userId`),
  CONSTRAINT `fk_withdrawal_requests_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `settings`
--
CREATE TABLE `settings` (
  `key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `payment_accounts`
--
CREATE TABLE `payment_accounts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `confirmation_contacts`
--
CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `testimonials`
--
CREATE TABLE `testimonials` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quote` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint(1) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_UNIQUE` (`userId`),
  CONSTRAINT `fk_testimonials_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `custom_app_requests`
--
CREATE TABLE `custom_app_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appKeywords` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `topology` json NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending_approval','in_progress','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_approval',
  `paymentDetails` json NOT NULL,
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `resultLink` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_custom_app_requests_user_idx` (`userId`),
  CONSTRAINT `fk_custom_app_requests_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `api_keys`
--
CREATE TABLE `api_keys` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prefix` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prefix_UNIQUE` (`prefix`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  KEY `fk_api_keys_user_idx` (`created_by`),
  CONSTRAINT `fk_api_keys_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
