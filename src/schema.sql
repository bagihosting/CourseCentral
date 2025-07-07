-- Adminer 4.8.1 MySQL 5.5.5-10.6.18-MariaDB-0ubuntu0.22.04.1 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

--
-- Database: `coursecentral_db`
--

--
-- Drop tables if they exist to ensure a clean slate
--
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `withdrawal_requests`;
DROP TABLE IF EXISTS `custom_app_requests`;
DROP TABLE IF EXISTS `certificate_requests`;
DROP TABLE IF EXISTS `upgrade_requests`;
DROP TABLE IF EXISTS `instructor_applications`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `confirmation_contacts`;
DROP TABLE IF EXISTS `payment_accounts`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `instructor_branding`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;


--
-- Table structure for `users`
--
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `role` enum('admin','member','pro','instructor') NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(255) DEFAULT 'https://placehold.co/256x256.png',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(10) NOT NULL,
  `referredBy` varchar(10) DEFAULT NULL,
  `affiliateBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) NOT NULL DEFAULT 0,
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `referralCode` (`referralCode`),
  KEY `referredBy` (`referredBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Default admin user
--
INSERT INTO `users` (`id`, `name`, `username`, `password`, `whatsapp`, `role`, `avatarUrl`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `affiliateBalance`, `affiliatePaid`, `instructorStatus`) VALUES
('admin_user', 'Admin', 'admin', '$2a$10$wOK.g52s22bF6a26/gDNt.JkLdABGgBLXmCpeP2fUe/OaRAs06c1.', '081234567890', 'admin', 'https://placehold.co/256x256.png', NOW(), NULL, 'active', 0, 'ADMINREF', NULL, 0.00, 0.00, 'approved');


--
-- Table structure for `courses`
--
CREATE TABLE `courses` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `image_url` varchar(255) NOT NULL,
  `modules` json DEFAULT NULL,
  `access_level` enum('public','pro') NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) DEFAULT NULL,
  `reviewNotes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `authorId` (`authorId`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `instructor_branding`
--
CREATE TABLE `instructor_branding` (
  `userId` varchar(255) NOT NULL,
  `customDomain` varchar(255) DEFAULT NULL,
  `brandName` varchar(255) DEFAULT NULL,
  `brandLogoUrl` varchar(255) DEFAULT NULL,
  `brandPrimaryColor` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `customDomain` (`customDomain`),
  CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `settings`
--
CREATE TABLE `settings` (
  `key` varchar(50) NOT NULL,
  `value` json NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Default settings
--
INSERT INTO `settings` (`key`, `value`) VALUES
('landingPage', JSON_OBJECT(
    'faqs', '[{\"id\":\"faq_1\",\"answer\":\"Ya, semua kursus kami menyediakan sertifikat penyelesaian yang dapat Anda unduh setelah menyelesaikan semua materi.\",\"question\":\"Apakah saya akan mendapatkan sertifikat?\"},{\"id\":\"faq_2\",\"answer\":\"Anda dapat meng-upgrade keanggotaan Anda melalui halaman \\\"Upgrade ke Pro\\\" di dasbor Anda setelah masuk.\",\"question\":\"Bagaimana cara menjadi anggota Pro?\"}]', 
    'aiApps', '[{\"id\":\"blogger\",\"icon\":\"Bot\",\"enabled\":true,\"title\":\"AI Template Blogger\",\"description\":\"Buat template Blogger XML yang responsif dan modern.\"},{\"id\":\"skripsi\",\"icon\":\"FileText\",\"enabled\":true,\"title\":\"AI Asisten Skripsi\",\"description\":\"Buat draf untuk bab-bab skripsi Anda secara instan.\"},{\"id\":\"wordpress\",\"icon\":\"Plug\",\"enabled\":true,\"title\":\"AI Generator Plugin WP\",\"description\":\"Buat file boilerplate untuk plugin WordPress baru.\"},{\"id\":\"google-ads\",\"icon\":\"Megaphone\",\"enabled\":true,\"title\":\"AI Generator Iklan Google\",\"description\":\"Buat teks iklan yang menarik untuk kampanye Google Ads.\"},{\"id\":\"digital-invitation\",\"icon\":\"Mail\",\"enabled\":true,\"title\":\"AI Generator Undangan Digital\",\"description\":\"Rangkai kata-kata indah untuk undangan digital Anda.\"},{\"id\":\"umkm\",\"icon\":\"Briefcase\",\"enabled\":true,\"title\":\"AI Asisten Profil UMKM\",\"description\":\"Buat nama, slogan, dan deskripsi untuk bisnis baru Anda.\"},{\"id\":\"spss\",\"icon\":\"BarChart\",\"enabled\":true,\"title\":\"AI Asisten SPSS\",\"description\":\"Ubah deskripsi analisis menjadi sintaks SPSS yang valid.\"},{\"id\":\"image\",\"icon\":\"ImageIcon\",\"enabled\":true,\"title\":\"AI Image Generator\",\"description\":\"Ubah teks menjadi gambar yang menakjubkan.\"},{\"id\":\"prototype\",\"icon\":\"LayoutTemplate\",\"enabled\":true,\"title\":\"AI App Prototyper\",\"description\":\"Ubah ide aplikasi mentah menjadi rencana MVP.\"},{\"id\":\"soap-formula\",\"icon\":\"FlaskConical\",\"enabled\":true,\"title\":\"AI Generator Formula Sabun\",\"description\":\"Hasilkan formula dasar untuk produk pembersih.\"},{\"id\":\"makalah\",\"icon\":\"BookCopy\",\"enabled\":true,\"title\":\"AI Generator Makalah\",\"description\":\"Buat draf makalah kuliah lengkap dengan berbagai jurusan.\"},{\"id\":\"genkit-app\",\"icon\":\"Server\",\"enabled\":true,\"title\":\"AI Genkit App Factory\",\"description\":\"Buat boilerplate aplikasi AI portabel dengan Next.js & Genkit.\"}]', 
    'logoUrl', '', 
    'features', '[{\"icon\":\"ShieldCheck\",\"title\":\"Sertifikasi Terpercaya\",\"description\":\"Dapatkan sertifikat yang diakui untuk memvalidasi keahlian dan meningkatkan nilai Anda di pasar kerja.\"},{\"icon\":\"Clock\",\"title\":\"Belajar Fleksibel\",\"description\":\"Akses materi kapan saja dan di mana saja. Sesuaikan jadwal belajar dengan kesibukan Anda.\"},{\"icon\":\"Users\",\"title\":\"Komunitas & Mentor\",\"description\":\"Bergabunglah dengan komunitas pembelajar aktif dan dapatkan bimbingan dari para instruktur ahli.\"}]', 
    'footerText', 'Hak Cipta Dilindungi.', 
    'contactEmail', 'support@example.com', 
    'contactPhone', '0812-3456-7890', 
    'heroHeadline', 'Tingkatkan <span class=\"text-primary\">Skill & Karir</span> Anda ke Level Berikutnya', 
    'heroImageUrl', 'https://placehold.co/1280x720.png', 
    'contactAddress', 'Jl. Jenderal Sudirman No.Kav. 52-53, Senayan, Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190', 
    'heroSubheadline', 'Platform kursus online bersertifikat untuk membantu Anda menguasai keahlian baru, dari pemrograman hingga desain, langsung dari para ahli di industrinya.', 
    'featuredTestimonialIds', '[]'
)),
('seo', JSON_OBJECT(
    'titleSuffix', '| Belajar Apapun, Kapanpun', 
    'platformName', 'CourseCentral', 
    'metaKeywords', 'kursus online, belajar online, sertifikasi, e-learning, platform edukasi', 
    'metaDescription', 'Platform kursus online terlengkap dengan sertifikasi untuk meningkatkan karir Anda. Mulai belajar dari para ahli di bidangnya hari ini!', 
    'enableAiSuggestions', true
));


--
-- Table structure for `payment_accounts`
--
CREATE TABLE `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `accountNumber` varchar(50) NOT NULL,
  `accountHolder` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payment_accounts` (`id`, `bankName`, `accountNumber`, `accountHolder`) VALUES
('pa_1724626388484', 'Bank BCA', '1234567890', 'PT Scriptify Indonesia'),
('pa_1724626402454', 'Bank Mandiri', '0987654321', 'PT Scriptify Indonesia');

--
-- Table structure for `confirmation_contacts`
--
CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `whatsapp` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `confirmation_contacts` (`id`, `name`, `whatsapp`) VALUES
('cc_1724626322303', 'Admin CS 1', '6281234567890');


--
-- Table structure for `testimonials`
--
CREATE TABLE `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(1) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `instructor_applications`
--
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
-- Table structure for `upgrade_requests`
--
CREATE TABLE `upgrade_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `accountHolder` varchar(100) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `upgrade_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `certificate_requests`
--
CREATE TABLE `certificate_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` text DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_courseId` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `custom_app_requests`
--
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
  `resultLink` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `withdrawal_requests`
--
CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `accountHolder` varchar(100) NOT NULL,
  `accountNumber` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `processedAt` timestamp NULL DEFAULT NULL,
  `adminNotes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `enrollments`
--
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
-- Table structure for `lesson_progress`
--
CREATE TABLE `lesson_progress` (
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`userId`,`lessonId`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;
