-- Adminer 4.8.1 MySQL 8.0.32 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `certificate_requests`;
CREATE TABLE `certificate_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `certificateHtml` text COLLATE utf8mb4_unicode_ci,
  `approvedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `confirmation_contacts`;
CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `confirmation_contacts` (`id`, `name`, `whatsapp`) VALUES
('cc_1724578508933',	'Admin Course Central',	'6281234567890');

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int NOT NULL DEFAULT '0',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modules` json NOT NULL,
  `access_level` enum('public','pro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `authorId` (`authorId`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `custom_app_requests`;
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
  KEY `userId` (`userId`),
  CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_course_unique` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `instructor_applications`;
CREATE TABLE `instructor_applications` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `instructor_applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `instructor_branding`;
CREATE TABLE `instructor_branding` (
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customDomain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandLogoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandPrimaryColor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `customDomain` (`customDomain`),
  CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `lesson_progress`;
CREATE TABLE `lesson_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lessonId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_lesson_unique` (`userId`,`lessonId`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payment_accounts`;
CREATE TABLE `payment_accounts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountNumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payment_accounts` (`id`, `bankName`, `accountNumber`, `accountHolder`) VALUES
('pa_1724578496495',	'Bank BCA',	'1234567890',	'PT Kursus Sentral'),
('pa_1724578500645',	'Bank Mandiri',	'0987654321',	'PT Kursus Sentral');

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`key`, `value`) VALUES
('landingPage',	'{\"faqs\": [{\"id\": \"faq_1\", \"answer\": \"Ya, semua kursus kami menyediakan sertifikat penyelesaian yang dapat Anda unduh setelah menyelesaikan semua materi.\", \"question\": \"Apakah saya akan mendapatkan sertifikat?\"}, {\"id\": \"faq_2\", \"answer\": \"Anda dapat meng-upgrade keanggotaan Anda melalui halaman \\\"Upgrade ke Pro\\\" di dasbor Anda setelah masuk.\", \"question\": \"Bagaimana cara menjadi anggota Pro?\"}], \"aiApps\": [{\"id\": \"blogger\", \"icon\": \"Bot\", \"title\": \"AI Template Blogger\", \"enabled\": true, \"description\": \"Buat template Blogger XML yang responsif dan modern.\"}, {\"id\": \"skripsi\", \"icon\": \"FileText\", \"title\": \"AI Asisten Skripsi\", \"enabled\": true, \"description\": \"Buat draf untuk bab-bab skripsi Anda secara instan.\"}, {\"id\": \"wordpress\", \"icon\": \"Plug\", \"title\": \"AI Generator Plugin WP\", \"enabled\": true, \"description\": \"Buat file boilerplate untuk plugin WordPress baru.\"}, {\"id\": \"google-ads\", \"icon\": \"Megaphone\", \"title\": \"AI Generator Iklan Google\", \"enabled\": true, \"description\": \"Buat teks iklan yang menarik untuk kampanye Google Ads.\"}, {\"id\": \"digital-invitation\", \"icon\": \"Mail\", \"title\": \"AI Generator Undangan Digital\", \"enabled\": true, \"description\": \"Rangkai kata-kata indah untuk undangan digital Anda.\"}, {\"id\": \"umkm\", \"icon\": \"Briefcase\", \"title\": \"AI Asisten Profil UMKM\", \"enabled\": true, \"description\": \"Buat nama, slogan, dan deskripsi untuk bisnis baru Anda.\"}, {\"id\": \"spss\", \"icon\": \"BarChart\", \"title\": \"AI Asisten SPSS\", \"enabled\": true, \"description\": \"Ubah deskripsi analisis menjadi sintaks SPSS yang valid.\"}, {\"id\": \"image\", \"icon\": \"ImageIcon\", \"title\": \"AI Image Generator\", \"enabled\": true, \"description\": \"Ubah teks menjadi gambar yang menakjubkan.\"}, {\"id\": \"prototype\", \"icon\": \"LayoutTemplate\", \"title\": \"AI App Prototyper\", \"enabled\": true, \"description\": \"Ubah ide aplikasi mentah menjadi rencana MVP.\"}, {\"id\": \"soap-formula\", \"icon\": \"FlaskConical\", \"title\": \"AI Generator Formula Sabun\", \"enabled\": true, \"description\": \"Hasilkan formula dasar untuk produk pembersih.\"}, {\"id\": \"makalah\", \"icon\": \"BookCopy\", \"title\": \"AI Generator Makalah\", \"enabled\": true, \"description\": \"Buat draf makalah kuliah lengkap dengan berbagai jurusan.\"}, {\"id\": \"genkit-app\", \"icon\": \"Server\", \"title\": \"AI Genkit App Factory\", \"enabled\": true, \"description\": \"Buat boilerplate aplikasi AI portabel dengan Next.js & Genkit.\"}], \"logoUrl\": \"\", \"features\": [{\"icon\": \"ShieldCheck\", \"title\": \"Sertifikasi Terpercaya\", \"description\": \"Dapatkan sertifikat yang diakui untuk memvalidasi keahlian dan meningkatkan nilai Anda di pasar kerja.\"}, {\"icon\": \"Clock\", \"title\": \"Belajar Fleksibel\", \"description\": \"Akses materi kapan saja dan di mana saja. Sesuaikan jadwal belajar dengan kesibukan Anda.\"}, {\"icon\": \"Users\", \"title\": \"Komunitas & Mentor\", \"description\": \"Bergabunglah dengan komunitas pembelajar aktif dan dapatkan bimbingan dari para instruktur ahli.\"}], \"footerText\": \"Hak Cipta Dilindungi.\", \"heroHeadline\": \"Tingkatkan <span class=\\\"text-primary\\\">Skill & Karir</span> Anda ke Level Berikutnya\", \"heroImageUrl\": \"https://placehold.co/1280x720.png\", \"contactEmail\": \"support@example.com\", \"contactPhone\": \"0812-3456-7890\", \"heroSubheadline\": \"Platform kursus online bersertifikat untuk membantu Anda menguasai keahlian baru, dari pemrograman hingga desain, langsung dari para ahli di industrinya.\", \"contactAddress\": \"Jl. Jenderal Sudirman No.Kav. 52-53, Senayan, Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190\", \"featuredTestimonialIds\": []}'),
('seo',	'{\"platformName\": \"CourseCentral\", \"titleSuffix\": \"| Belajar Apapun, Kapanpun\", \"metaDescription\": \"Platform kursus online terlengkap dengan sertifikasi untuk meningkatkan karir Anda. Mulai belajar dari para ahli di bidangnya hari ini!\", \"metaKeywords\": \"kursus online, belajar online, sertifikasi, e-learning, platform edukasi\", \"enableAiSuggestions\": true}');

DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quote` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `upgrade_requests`;
CREATE TABLE `upgrade_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `upgrade_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','member','pro','instructor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `loginCount` int NOT NULL DEFAULT '0',
  `referralCode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referredBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructorStatus` enum('none','pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `lessons_created_today` int NOT NULL DEFAULT '0',
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `avatarUrl`, `whatsapp`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `instructorStatus`, `lessons_created_today`, `last_lesson_created_at`) VALUES
('admin_user',	'Admin',	'admin',	'$2b$10$E.p/c6sbB4z5aF7sAmXdG.yLw2mFfGctYyG32iC5Hk.5lJ9d5rL5S',	'admin',	'https://placehold.co/256x256.png',	'08123456789',	'2024-08-25 09:35:10',	'2024-08-25 09:35:10',	'active',	1,	'ADMINCODE',	NULL,	'approved',	0,	NULL);

-- 2024-08-25 09:35:13
