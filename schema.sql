-- Adminer 4.8.1 MySQL 5.5.5-10.6.16-MariaDB-0ubuntu0.22.04.1 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `api_keys`;
CREATE TABLE `api_keys` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `hashed_key` varchar(255) NOT NULL,
  `prefix` varchar(12) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prefix` (`prefix`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `certificate_requests`;
CREATE TABLE `certificate_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` longtext DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_courseId` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `commissions`;
CREATE TABLE `commissions` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `type` enum('referral','instructor_milestone') NOT NULL,
  `sourceUserId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `sourceUserId` (`sourceUserId`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`sourceUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `confirmation_contacts`;
CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) NOT NULL,
  `modules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]',
  `access_level` enum('public','pro') NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) NOT NULL,
  `reviewNotes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `authorId` (`authorId`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `custom_app_requests`;
CREATE TABLE `custom_app_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `appName` varchar(255) NOT NULL,
  `appKeywords` text NOT NULL,
  `topology` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending_approval','in_progress','completed','rejected') NOT NULL DEFAULT 'pending_approval',
  `paymentDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `adminNotes` text DEFAULT NULL,
  `resultLink` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `instructor_applications`;
CREATE TABLE `instructor_applications` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `instructor_applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `instructor_branding`;
CREATE TABLE `instructor_branding` (
  `userId` varchar(255) NOT NULL,
  `customDomain` varchar(255) DEFAULT NULL,
  `brandName` varchar(255) DEFAULT NULL,
  `brandLogoUrl` varchar(255) DEFAULT NULL,
  `brandPrimaryColor` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `customDomain` (`customDomain`),
  CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `lesson_progress`;
CREATE TABLE `lesson_progress` (
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`userId`,`lessonId`),
  KEY `lessonId` (`lessonId`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payment_accounts`;
CREATE TABLE `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(50) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upgrade_requests`;
CREATE TABLE `upgrade_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `upgrade_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member','pro','instructor') NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(20) NOT NULL,
  `referredBy` varchar(255) DEFAULT NULL,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) NOT NULL DEFAULT 0,
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  `affiliateBalance` decimal(10,0) NOT NULL DEFAULT 0,
  `affiliatePaid` decimal(10,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `referralCode` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `avatarUrl`, `whatsapp`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `instructorStatus`, `lessons_created_today`, `last_lesson_created_at`, `affiliateBalance`, `affiliatePaid`) VALUES
('user_admin',	'Admin',	'admin',	'$2b$10$E.p8aYyqS5E4A7D9g9X8h.L4z5f6g7h8i9j0k1l2m3n4o5p6q7r8',	'admin',	'https://placehold.co/256x256.png',	'081234567890',	'2024-01-01 00:00:00',	NULL,	'active',	0,	'ADMINREF',	NULL,	'none',	0,	NULL,	0,	0);

DROP TABLE IF EXISTS `withdrawal_requests`;
CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `bankDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `processedDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2024-08-28 07:18:22
