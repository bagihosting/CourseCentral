-- Adminer 4.8.1 MySQL 5.5.5-10.6.16-MariaDB-0ubuntu0.22.04.1 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `certificate_requests`;
CREATE TABLE `certificate_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` text DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
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
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `modules` json NOT NULL,
  `access_level` enum('public','pro') NOT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') NOT NULL,
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
  `topology` json NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending_approval','in_progress','completed','rejected') NOT NULL DEFAULT 'pending_approval',
  `paymentDetails` json NOT NULL,
  `adminNotes` text DEFAULT NULL,
  `resultLink` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_course_enrollment` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `instructor_applications`;
CREATE TABLE `instructor_applications` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL,
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
  `brandPrimaryColor` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `lesson_progress`;
CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_lesson_progress` (`userId`,`lessonId`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payment_accounts`;
CREATE TABLE `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` json NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
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
  `avatarUrl` varchar(255) DEFAULT 'https://placehold.co/256x256.png',
  `whatsapp` varchar(25) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(255) NOT NULL,
  `referredBy` varchar(255) DEFAULT NULL,
  `affiliateBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessonsCreatedToday` int(11) NOT NULL DEFAULT 0,
  `lastLessonCreatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `referralCode` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `referralCode`, `status`) VALUES
('user_admin_001',	'Admin',	'admin',	'password',	'admin',	'ADMINREF',	'active');

DROP TABLE IF EXISTS `withdrawal_requests`;
CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  `accountNumber` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `processedAt` timestamp NULL DEFAULT NULL,
  `adminNotes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `courses` ADD `instructor_branding_fk` FOREIGN KEY (`authorId`) REFERENCES `instructor_branding` (`userId`) ON DELETE CASCADE;

-- 2024-07-06 14:12:12
