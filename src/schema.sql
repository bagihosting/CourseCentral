
-- Versi Skema: 2.0
-- Pembaruan Terakhir: 25 Agustus 2024
-- Catatan:
-- - Migrasi engine dari MyISAM ke InnoDB untuk mendukung FOREIGN KEY dan transaksi.
-- - Penambahan dan penyempurnaan tabel agar sinkron dengan semua fitur aplikasi.
-- - Penambahan INDEX untuk optimisasi performa query.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `coursecentral_db`
--
CREATE DATABASE IF NOT EXISTS `coursecentral_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `coursecentral_db`;

-- --------------------------------------------------------

--
-- Struktur dari tabel `certificate_requests`
--

CREATE TABLE `certificate_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `certificateHtml` longtext COLLATE utf8mb4_unicode_ci,
  `approvedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `confirmation_contacts`
--

CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `confirmation_contacts`
--

INSERT INTO `confirmation_contacts` (`id`, `name`, `whatsapp`) VALUES
('cc_1724597341901', 'Admin 1', '6281234567890');

-- --------------------------------------------------------

--
-- Struktur dari tabel `courses`
--

CREATE TABLE `courses` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int(11) NOT NULL DEFAULT '0',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_level` enum('public','pro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` text COLLATE utf8mb4_unicode_ci,
  `modules` json NOT NULL,
  `status` enum('draft','pending_review','published','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `custom_app_requests`
--

CREATE TABLE `custom_app_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appKeywords` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `topology` json NOT NULL,
  `requestDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending_approval','in_progress','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_approval',
  `paymentDetails` json NOT NULL,
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `resultLink` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrolledAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `instructor_applications`
--

CREATE TABLE `instructor_applications` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `instructor_branding`
--

CREATE TABLE `instructor_branding` (
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customDomain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandLogoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandPrimaryColor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lessonId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `payment_accounts`
--

CREATE TABLE `payment_accounts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountNumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `payment_accounts`
--

INSERT INTO `payment_accounts` (`id`, `bankName`, `accountNumber`, `accountHolder`) VALUES
('pa_1724597288607', 'Bank BCA', '8880123456', 'PT Kursus Sentral'),
('pa_1724597305942', 'Bank Mandiri', '1230009876543', 'PT Kursus Sentral');

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`key`, `value`) VALUES
('landingPage', '{\"faqs\": [{\"id\": \"faq_1\", \"answer\": \"Ya, semua kursus kami menyediakan sertifikat penyelesaian yang dapat Anda unduh setelah menyelesaikan semua materi.\", \"question\": \"Apakah saya akan mendapatkan sertifikat?\"}, {\"id\": \"faq_2\", \"answer\": \"Anda dapat meng-upgrade keanggotaan Anda melalui halaman \\\"Upgrade ke Pro\\\" di dasbor Anda setelah masuk.\", \"question\": \"Bagaimana cara menjadi anggota Pro?\"}], \"aiApps\": [{\"id\": \"blogger\", \"icon\": \"Bot\", \"title\": \"AI Template Blogger\", \"enabled\": true, \"description\": \"Buat template Blogger XML yang responsif dan modern.\"}, {\"id\": \"skripsi\", \"icon\": \"FileText\", \"title\": \"AI Asisten Skripsi\", \"enabled\": true, \"description\": \"Buat draf untuk bab-bab skripsi Anda secara instan.\"}, {\"id\": \"wordpress\", \"icon\": \"Plug\", \"title\": \"AI Generator Plugin WP\", \"enabled\": true, \"description\": \"Buat file boilerplate untuk plugin WordPress baru.\"}, {\"id\": \"google-ads\", \"icon\": \"Megaphone\", \"title\": \"AI Generator Iklan Google\", \"enabled\": true, \"description\": \"Buat teks iklan yang menarik untuk kampanye Google Ads.\"}, {\"id\": \"digital-invitation\", \"icon\": \"Mail\", \"title\": \"AI Generator Undangan Digital\", \"enabled\": true, \"description\": \"Rangkai kata-kata indah untuk undangan digital Anda.\"}, {\"id\": \"umkm\", \"icon\": \"Briefcase\", \"title\": \"AI Asisten Profil UMKM\", \"enabled\": true, \"description\": \"Buat nama, slogan, dan deskripsi untuk bisnis baru Anda.\"}, {\"id\": \"spss\", \"icon\": \"BarChart\", \"title\": \"AI Asisten SPSS\", \"enabled\": true, \"description\": \"Ubah deskripsi analisis menjadi sintaks SPSS yang valid.\"}, {\"id\": \"image\", \"icon\": \"ImageIcon\", \"title\": \"AI Image Generator\", \"enabled\": true, \"description\": \"Ubah teks menjadi gambar yang menakjubkan.\"}, {\"id\": \"prototype\", \"icon\": \"LayoutTemplate\", \"title\": \"AI App Prototyper\", \"enabled\": true, \"description\": \"Ubah ide aplikasi mentah menjadi rencana MVP.\"}, {\"id\": \"soap-formula\", \"icon\": \"FlaskConical\", \"title\": \"AI Generator Formula Sabun\", \"enabled\": true, \"description\": \"Hasilkan formula dasar untuk produk pembersih.\"}, {\"id\": \"makalah\", \"icon\": \"BookCopy\", \"title\": \"AI Generator Makalah\", \"enabled\": true, \"description\": \"Buat draf makalah kuliah lengkap dengan berbagai jurusan.\"}, {\"id\": \"genkit-app\", \"icon\": \"Server\", \"title\": \"AI Genkit App Factory\", \"enabled\": true, \"description\": \"Buat boilerplate aplikasi AI portabel dengan Next.js & Genkit.\"}], \"logoUrl\": \"\", \"features\": [{\"icon\": \"ShieldCheck\", \"title\": \"Sertifikasi Terpercaya\", \"description\": \"Dapatkan sertifikat yang diakui untuk memvalidasi keahlian dan meningkatkan nilai Anda di pasar kerja.\"}, {\"icon\": \"Clock\", \"title\": \"Belajar Fleksibel\", \"description\": \"Akses materi kapan saja dan di mana saja. Sesuaikan jadwal belajar dengan kesibukan Anda.\"}, {\"icon\": \"Users\", \"title\": \"Komunitas & Mentor\", \"description\": \"Bergabunglah dengan komunitas pembelajar aktif dan dapatkan bimbingan dari para instruktur ahli.\"}], \"footerText\": \"Hak Cipta Dilindungi.\", \"heroHeadline\": \"Tingkatkan <span class=\\\"text-primary\\\">Skill & Karir</span> Anda ke Level Berikutnya\", \"contactEmail\": \"support@example.com\", \"contactPhone\": \"0812-3456-7890\", \"heroImageUrl\": \"https://placehold.co/1280x720.png\", \"heroSubheadline\": \"Platform kursus online bersertifikat untuk membantu Anda menguasai keahlian baru, dari pemrograman hingga desain, langsung dari para ahli di industrinya.\", \"contactAddress\": \"Jl. Jenderal Sudirman No.Kav. 52-53, Senayan, Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190\", \"featuredTestimonialIds\": []}'),
('seo', '{\"platformName\": \"CourseCentral\", \"titleSuffix\": \"| Belajar Apapun, Kapanpun\", \"metaKeywords\": \"kursus online, belajar online, sertifikasi, e-learning, platform edukasi\", \"metaDescription\": \"Platform kursus online terlengkap dengan sertifikasi untuk meningkatkan karir Anda. Mulai belajar dari para ahli di bidangnya hari ini!\", \"enableAiSuggestions\": true}');

-- --------------------------------------------------------

--
-- Struktur dari tabel `testimonials`
--

CREATE TABLE `testimonials` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quote` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `upgrade_requests`
--

CREATE TABLE `upgrade_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','member','pro','instructor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatarUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginAt` datetime DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT '0',
  `referralCode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referredBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `affiliateBalance` decimal(10,0) NOT NULL DEFAULT '0',
  `affiliatePaid` decimal(10,0) NOT NULL DEFAULT '0',
  `instructorStatus` enum('none','pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) NOT NULL DEFAULT '0',
  `last_lesson_created_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `avatarUrl`, `whatsapp`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `affiliateBalance`, `affiliatePaid`, `instructorStatus`, `lessons_created_today`, `last_lesson_created_at`) VALUES
('admin_default', 'Admin', 'admin', '$2b$10$w4B.gG/a.QpXf5.E/CqfFuiZl2VzSf94QvAGSgW1fIXr1/n9/yCGe', 'admin', 'https://placehold.co/256x256.png', '081234567890', '2024-08-25 12:47:49', NULL, 'active', 0, 'ADMINREF', NULL, 0, 0, 'none', 0, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `withdrawal_requests`
--

CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountHolder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountNumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `requestDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processedAt` datetime DEFAULT NULL,
  `adminNotes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indeks untuk tabel `confirmation_contacts`
--
ALTER TABLE `confirmation_contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `authorId` (`authorId`);

--
-- Indeks untuk tabel `custom_app_requests`
--
ALTER TABLE `custom_app_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeks untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_course_unique` (`userId`,`courseId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indeks untuk tabel `instructor_applications`
--
ALTER TABLE `instructor_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeks untuk tabel `instructor_branding`
--
ALTER TABLE `instructor_branding`
  ADD PRIMARY KEY (`userId`);

--
-- Indeks untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_lesson_unique` (`userId`,`lessonId`);

--
-- Indeks untuk tabel `payment_accounts`
--
ALTER TABLE `payment_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indeks untuk tabel `upgrade_requests`
--
ALTER TABLE `upgrade_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `referralCode` (`referralCode`);

--
-- Indeks untuk tabel `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `custom_app_requests`
--
ALTER TABLE `custom_app_requests`
  ADD CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `instructor_applications`
--
ALTER TABLE `instructor_applications`
  ADD CONSTRAINT `instructor_applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `instructor_branding`
--
ALTER TABLE `instructor_branding`
  ADD CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `upgrade_requests`
--
ALTER TABLE `upgrade_requests`
  ADD CONSTRAINT `upgrade_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
