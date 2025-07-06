-- CourseCentral Database Schema
-- Version 1.1
-- This schema includes all tables required for the full application functionality.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

--
-- Table structure for table `users`
-- Contains all user data, including roles, status, and affiliate information.
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member','pro') NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(255) NOT NULL,
  `referredBy` varchar(255) DEFAULT NULL,
  `affiliateBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `affiliatePaid` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `referralCode` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
-- Default admin user. Password is 'password' and will be hashed on first login.
--
INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `avatarUrl`, `whatsapp`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `affiliateBalance`, `affiliatePaid`) VALUES
('user_admin_default', 'Admin', 'admin', 'password', 'admin', 'https://placehold.co/256x256.png', '081234567890', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'active', 1, 'ADMINCODE', NULL, 0.00, 0.00);


--
-- Table structure for table `courses`
-- Stores course data, including curriculum (modules/lessons as JSON) and SEO fields.
--
CREATE TABLE IF NOT EXISTS `courses` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `image_url` varchar(255) NOT NULL,
  `modules` json NOT NULL,
  `access_level` enum('public','pro') NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `enrollments`
-- Tracks which users are enrolled in which courses.
--
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_course_unique` (`userId`,`courseId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `lesson_progress`
-- Tracks lesson completion for each user.
--
CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_lesson_unique` (`userId`,`lessonId`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `upgrade_requests`
-- Stores requests from members to upgrade to Pro.
--
CREATE TABLE IF NOT EXISTS `upgrade_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  `requestDate` datetime NOT NULL,
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `upgrade_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `certificate_requests`
-- Stores certificate requests from users who have completed a course.
--
CREATE TABLE IF NOT EXISTS `certificate_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `requestDate` datetime NOT NULL,
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` mediumtext DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `custom_app_requests`
-- Stores requests for custom application development.
--
CREATE TABLE IF NOT EXISTS `custom_app_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `appName` varchar(255) NOT NULL,
  `appKeywords` text NOT NULL,
  `topology` json NOT NULL,
  `requestDate` datetime NOT NULL,
  `status` enum('pending_approval','in_progress','completed','rejected') NOT NULL DEFAULT 'pending_approval',
  `paymentDetails` json NOT NULL,
  `adminNotes` text DEFAULT NULL,
  `resultLink` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for table `settings`
-- A key-value store for all global settings, like SEO and Landing Page content.
--
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping default data for table `settings`
-- Using ON DUPLICATE KEY UPDATE to prevent errors on re-running the script.
--
INSERT INTO `settings` (`key`, `value`) VALUES
('seo', '{\"platformName\": \"CourseCentral\", \"titleSuffix\": \"| Belajar Apapun, Kapanpun\", \"metaDescription\": \"Platform kursus online terlengkap dengan sertifikasi untuk meningkatkan karir Anda. Mulai belajar dari para ahli di bidangnya hari ini!\", \"metaKeywords\": \"kursus online, belajar online, sertifikasi, e-learning, platform edukasi\", \"enableAiSuggestions\": true}'),
('landingPage', '{\"heroHeadline\": \"Tingkatkan <span class=\\\"text-primary\\\">Skill & Karir</span> Anda ke Level Berikutnya\", \"heroSubheadline\": \"Platform kursus online bersertifikat untuk membantu Anda menguasai keahlian baru, dari pemrograman hingga desain, langsung dari para ahli di industrinya.\", \"heroImageUrl\": \"https://placehold.co/1280x720.png\", \"features\": [{\"icon\": \"ShieldCheck\", \"title\": \"Sertifikasi Terpercaya\", \"description\": \"Dapatkan sertifikat yang diakui untuk memvalidasi keahlian dan meningkatkan nilai Anda di pasar kerja.\"}, {\"icon\": \"Clock\", \"title\": \"Belajar Fleksibel\", \"description\": \"Akses materi kapan saja dan di mana saja. Sesuaikan jadwal belajar dengan kesibukan Anda.\"}, {\"icon\": \"Users\", \"title\": \"Komunitas & Mentor\", \"description\": \"Bergabunglah dengan komunitas pembelajar aktif dan dapatkan bimbingan dari para instruktur ahli.\"}], \"logoUrl\": \"\", \"footerText\": \"Hak Cipta Dilindungi.\", \"featuredTestimonialIds\": [], \"contactEmail\": \"support@example.com\", \"contactPhone\": \"0812-3456-7890\", \"contactAddress\": \"Jl. Jenderal Sudirman No.Kav. 52-53, Senayan, Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190\", \"faqs\": [{\"id\": \"faq_1\", \"question\": \"Apakah saya akan mendapatkan sertifikat?\", \"answer\": \"Ya, semua kursus kami menyediakan sertifikat penyelesaian yang dapat Anda unduh setelah menyelesaikan semua materi.\"}, {\"id\": \"faq_2\", \"question\": \"Bagaimana cara menjadi anggota Pro?\", \"answer\": \"Anda dapat meng-upgrade keanggotaan Anda melalui halaman \\\"Upgrade ke Pro\\\" di dasbor Anda setelah masuk.\"}], \"aiApps\": [{\"id\": \"blogger\", \"title\": \"AI Template Blogger\", \"description\": \"Buat template Blogger XML yang responsif dan modern.\", \"icon\": \"Bot\", \"enabled\": true}, {\"id\": \"skripsi\", \"title\": \"AI Asisten Skripsi\", \"description\": \"Buat draf untuk bab-bab skripsi Anda secara instan.\", \"icon\": \"FileText\", \"enabled\": true}, {\"id\": \"wordpress\", \"title\": \"AI Generator Plugin WP\", \"description\": \"Buat file boilerplate untuk plugin WordPress baru.\", \"icon\": \"Plug\", \"enabled\": true}, {\"id\": \"google-ads\", \"title\": \"AI Generator Iklan Google\", \"description\": \"Buat teks iklan yang menarik untuk kampanye Google Ads.\", \"icon\": \"Megaphone\", \"enabled\": true}, {\"id\": \"digital-invitation\", \"title\": \"AI Generator Undangan Digital\", \"description\": \"Rangkai kata-kata indah untuk undangan digital Anda.\", \"icon\": \"Mail\", \"enabled\": true}, {\"id\": \"umkm\", \"title\": \"AI Asisten Profil UMKM\", \"description\": \"Buat nama, slogan, dan deskripsi untuk bisnis baru Anda.\", \"icon\": \"Briefcase\", \"enabled\": true}, {\"id\": \"spss\", \"title\": \"AI Asisten SPSS\", \"description\": \"Ubah deskripsi analisis menjadi sintaks SPSS yang valid.\", \"icon\": \"BarChart\", \"enabled\": true}, {\"id\": \"image\", \"title\": \"AI Image Generator\", \"description\": \"Ubah teks menjadi gambar yang menakjubkan.\", \"icon\": \"ImageIcon\", \"enabled\": true}, {\"id\": \"prototype\", \"title\": \"AI App Prototyper\", \"description\": \"Ubah ide aplikasi mentah menjadi rencana MVP.\", \"icon\": \"LayoutTemplate\", \"enabled\": true}, {\"id\": \"soap-formula\", \"title\": \"AI Generator Formula Sabun\", \"description\": \"Hasilkan formula dasar untuk produk pembersih.\", \"icon\": \"FlaskConical\", \"enabled\": true}, {\"id\": \"makalah\", \"title\": \"AI Generator Makalah\", \"description\": \"Buat draf makalah kuliah lengkap dengan berbagai jurusan.\", \"icon\": \"BookCopy\", \"enabled\": true}, {\"id\": \"genkit-app\", \"title\": \"AI Genkit App Factory\", \"description\": \"Buat boilerplate aplikasi AI portabel dengan Next.js & Genkit.\", \"icon\": \"Server\", \"enabled\": true}]}')
ON DUPLICATE KEY UPDATE `key`=`key`;

--
-- Table structure for table `payment_accounts`
-- Stores bank accounts for receiving payments.
--
CREATE TABLE IF NOT EXISTS `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `confirmation_contacts`
-- Stores WhatsApp numbers for payment confirmations.
--
CREATE TABLE IF NOT EXISTS `confirmation_contacts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `testimonials`
-- Stores user testimonials for the landing page.
--
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
