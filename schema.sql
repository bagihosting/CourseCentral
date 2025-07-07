-- Definitive Schema for CourseCentral Application
-- This schema supports all features as of the latest audit.
--
-- Features covered:
-- - User management (member, pro, instructor, admin)
-- - Course, Module, and Lesson management (including different lesson types)
-- - User enrollments and lesson progress tracking
-- - Affiliate system with referrals and balances
-- - Withdrawal requests for commissions
-- - Upgrade to Pro requests
-- - Certificate generation and requests
-- - Instructor applications and branding (custom domain)
-- - Custom app requests
-- - Global platform settings (SEO, landing page, etc.)
-- - Payment accounts and confirmation contacts
-- - Testimonials

-- Use utf8mb4 for full Unicode support
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `role` enum('member','pro','instructor','admin') NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(1024) DEFAULT 'https://placehold.co/256x256.png',
  `referralCode` varchar(255) NOT NULL,
  `referredBy` varchar(255) DEFAULT NULL,
  `affiliateBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessonsCreatedToday` int(11) NOT NULL DEFAULT 0,
  `lastLessonCreatedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `referralCode` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `referralCode`) VALUES
('admin_user_01', 'Admin', 'admin', 'password', 'admin', 'ADMINREF');


--
-- Table structure for table `courses`
--
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(1024) NOT NULL,
  `modules` json NOT NULL,
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


--
-- Table structure for table `enrollments`
--
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


--
-- Table structure for table `lesson_progress`
--
DROP TABLE IF EXISTS `lesson_progress`;
CREATE TABLE `lesson_progress` (
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`userId`,`lessonId`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `upgrade_requests`
--
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


--
-- Table structure for table `certificate_requests`
--
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
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `instructor_applications`
--
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


--
-- Table structure for table `instructor_branding`
--
DROP TABLE IF EXISTS `instructor_branding`;
CREATE TABLE `instructor_branding` (
  `userId` varchar(255) NOT NULL,
  `customDomain` varchar(255) DEFAULT NULL,
  `brandName` varchar(255) DEFAULT NULL,
  `brandLogoUrl` varchar(1024) DEFAULT NULL,
  `brandPrimaryColor` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `customDomain` (`customDomain`),
  CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `payment_accounts`
--
DROP TABLE IF EXISTS `payment_accounts`;
CREATE TABLE `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `confirmation_contacts`
--
DROP TABLE IF EXISTS `confirmation_contacts`;
CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `testimonials`
--
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `settings`
--
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` json NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `custom_app_requests`
--
DROP TABLE IF EXISTS `custom_app_requests`;
CREATE TABLE `custom_app_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `appName` varchar(255) NOT NULL,
  `appKeywords` text NOT NULL,
  `topology` json NOT NULL,
  `paymentDetails` json NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending_approval','in_progress','completed','rejected') NOT NULL DEFAULT 'pending_approval',
  `adminNotes` text DEFAULT NULL,
  `resultLink` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `withdrawal_requests`
--
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
