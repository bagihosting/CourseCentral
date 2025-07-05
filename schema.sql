-- This script provides the basic SQL schema for the 'users' and 'courses' tables.
-- For a full production migration, you would also need tables for:
-- - modules
-- - lessons
-- - enrollments
-- - upgradeRequests
-- - certificateRequests
-- - customAppRequests
-- - testimonials
-- ...and others, with appropriate foreign key relationships.

CREATE TABLE `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` TEXT NOT NULL,
  `role` ENUM('admin', 'member', 'pro') NOT NULL DEFAULT 'member',
  `avatarUrl` TEXT,
  `whatsapp` VARCHAR(25),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `loginCount` INT NOT NULL DEFAULT 0,
  `referralCode` VARCHAR(255) NOT NULL,
  `referredBy` VARCHAR(255) NULL,
  `affiliateBalance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`),
  UNIQUE KEY `referralCode_unique` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `courses` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `instructor` VARCHAR(255) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `imageUrl` TEXT NOT NULL,
  `accessLevel` ENUM('public', 'pro') NOT NULL DEFAULT 'public',
  `seoTitle` VARCHAR(255),
  `seoDescription` TEXT,
  `seoKeywords` TEXT,
  -- The 'modules' field (JSON in localStorage) would be handled by separate 'modules' and 'lessons' tables
  -- with a foreign key relationship to this table (e.g., `courseId`).
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
