--
-- Struktur dari tabel `users`
--
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member','pro','instructor') NOT NULL DEFAULT 'member',
  `avatarUrl` text DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) DEFAULT 0,
  `referralCode` varchar(20) DEFAULT NULL,
  `referredBy` varchar(20) DEFAULT NULL,
  `instructorStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `lessons_created_today` int(11) DEFAULT 0,
  `last_lesson_created_at` timestamp NULL DEFAULT NULL,
  `affiliateBalance` decimal(10,2) DEFAULT 0.00,
  `affiliatePaid` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--
INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `avatarUrl`, `whatsapp`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `instructorStatus`, `lessons_created_today`, `last_lesson_created_at`) VALUES
('admin_user_01', 'Admin', 'admin', '$2b$10$E.p/tA5WfEa9LzJzK8f9l.FvG1XbJ9qZ5.YgI.1hH8.N7fW.8kC6u', 'admin', 'https://placehold.co/256x256.png', '08123456789', '2024-08-25 00:00:00', NULL, 'active', 0, 'ADMINREF', NULL, 'approved', 0, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `courses`
--
CREATE TABLE `courses` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` text NOT NULL,
  `modules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`modules`)),
  `access_level` enum('public','pro') NOT NULL DEFAULT 'public',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `status` enum('draft','pending_review','published','rejected') NOT NULL DEFAULT 'draft',
  `authorId` varchar(255) NOT NULL,
  `reviewNotes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `enrollments`
--
CREATE TABLE `enrollments` (
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `enrolledAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--
INSERT INTO `settings` (`key`, `value`) VALUES
('landingPage', '{\"heroHeadline\":\"Tingkatkan <span class=\\\"text-primary\\\">Skill & Karir</span> Anda ke Level Berikutnya\",\"heroSubheadline\":\"Platform kursus online bersertifikat untuk membantu Anda menguasai keahlian baru, dari pemrograman hingga desain, langsung dari para ahli di industrinya.\",\"heroImageUrl\":\"https://placehold.co/1280x720.png\",\"features\":[{\"icon\":\"ShieldCheck\",\"title\":\"Sertifikasi Terpercaya\",\"description\":\"Dapatkan sertifikat yang diakui untuk memvalidasi keahlian dan meningkatkan nilai Anda di pasar kerja.\"},{\"icon\":\"Clock\",\"title\":\"Belajar Fleksibel\",\"description\":\"Akses materi kapan saja dan di mana saja. Sesuaikan jadwal belajar dengan kesibukan Anda.\"},{\"icon\":\"Users\",\"title\":\"Komunitas & Mentor\",\"description\":\"Bergabunglah dengan komunitas pembelajar aktif dan dapatkan bimbingan dari para instruktur ahli.\"}],\"logoUrl\":\"\",\"footerText\":\"Hak Cipta Dilindungi.\",\"featuredTestimonialIds\":[],\"contactEmail\":\"support@example.com\",\"contactPhone\":\"0812-3456-7890\",\"contactAddress\":\"Jl. Jenderal Sudirman No.Kav. 52-53, Senayan, Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190\",\"faqs\":[{\"id\":\"faq_1\",\"question\":\"Apakah saya akan mendapatkan sertifikat?\",\"answer\":\"Ya, semua kursus kami menyediakan sertifikat penyelesaian yang dapat Anda unduh setelah menyelesaikan semua materi.\"},{\"id\":\"faq_2\",\"question\":\"Bagaimana cara menjadi anggota Pro?\",\"answer\":\"Anda dapat meng-upgrade keanggotaan Anda melalui halaman \\\"Upgrade ke Pro\\\" di dasbor Anda setelah masuk.\"}],\"aiApps\":[{\"id\":\"blogger\",\"title\":\"AI Template Blogger\",\"description\":\"Buat template Blogger XML yang responsif dan modern.\",\"icon\":\"Bot\",\"enabled\":true},{\"id\":\"skripsi\",\"title\":\"AI Asisten Skripsi\",\"description\":\"Buat draf untuk bab-bab skripsi Anda secara instan.\",\"icon\":\"FileText\",\"enabled\":true},{\"id\":\"wordpress\",\"title\":\"AI Generator Plugin WP\",\"description\":\"Buat file boilerplate untuk plugin WordPress baru.\",\"icon\":\"Plug\",\"enabled\":true},{\"id\":\"google-ads\",\"title\":\"AI Generator Iklan Google\",\"description\":\"Buat teks iklan yang menarik untuk kampanye Google Ads.\",\"icon\":\"Megaphone\",\"enabled\":true},{\"id\":\"digital-invitation\",\"title\":\"AI Generator Undangan Digital\",\"description\":\"Rangkai kata-kata indah untuk undangan digital Anda.\",\"icon\":\"Mail\",\"enabled\":true},{\"id\":\"umkm\",\"title\":\"AI Asisten Profil UMKM\",\"description\":\"Buat nama, slogan, dan deskripsi untuk bisnis baru Anda.\",\"icon\":\"Briefcase\",\"enabled\":true},{\"id\":\"spss\",\"title\":\"AI Asisten SPSS\",\"description\":\"Ubah deskripsi analisis menjadi sintaks SPSS yang valid.\",\"icon\":\"BarChart\",\"enabled\":true},{\"id\":\"image\",\"title\":\"AI Image Generator\",\"description\":\"Ubah teks menjadi gambar yang menakjubkan.\",\"icon\":\"ImageIcon\",\"enabled\":true},{\"id\":\"prototype\",\"title\":\"AI App Prototyper\",\"description\":\"Ubah ide aplikasi mentah menjadi rencana MVP.\",\"icon\":\"LayoutTemplate\",\"enabled\":true},{\"id\":\"soap-formula\",\"title\":\"AI Generator Formula Sabun\",\"description\":\"Hasilkan formula dasar untuk produk pembersih.\",\"icon\":\"FlaskConical\",\"enabled\":true},{\"id\":\"makalah\",\"title\":\"AI Generator Makalah\",\"description\":\"Buat draf makalah kuliah lengkap dengan berbagai jurusan.\",\"icon\":\"BookCopy\",\"enabled\":true},{\"id\":\"genkit-app\",\"title\":\"AI Genkit App Factory\",\"description\":\"Buat boilerplate aplikasi AI portabel dengan Next.js & Genkit.\",\"icon\":\"Server\",\"enabled\":true}]}'),
('seo', '{\"platformName\":\"CourseCentral\",\"titleSuffix\":\"| Belajar Apapun, Kapanpun\",\"metaDescription\":\"Platform kursus online terlengkap dengan sertifikasi untuk meningkatkan karir Anda. Mulai belajar dari para ahli di bidangnya hari ini!\",\"metaKeywords\":\"kursus online, belajar online, sertifikasi, e-learning, platform edukasi\",\"enableAiSuggestions\":true}');

-- --------------------------------------------------------

--
-- Struktur dari tabel `upgrade_requests`
--
CREATE TABLE `upgrade_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountHolder` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `payment_accounts`
--
CREATE TABLE `payment_accounts` (
  `id` varchar(255) NOT NULL,
  `bankName` varchar(255) NOT NULL,
  `accountNumber` varchar(50) NOT NULL,
  `accountHolder` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `payment_accounts`
--
INSERT INTO `payment_accounts` (`id`, `bankName`, `accountNumber`, `accountHolder`) VALUES
('pa_1723558832187', 'Bank BCA', '8812381823', 'PT Scriptify Indonesia');


-- --------------------------------------------------------

--
-- Struktur dari tabel `confirmation_contacts`
--
CREATE TABLE `confirmation_contacts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `confirmation_contacts`
--
INSERT INTO `confirmation_contacts` (`id`, `name`, `whatsapp`) VALUES
('cc_1723558832188', 'Admin', '6281234567890');

-- --------------------------------------------------------

--
-- Struktur dari tabel `testimonials`
--
CREATE TABLE `testimonials` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `quote` text NOT NULL,
  `rating` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `certificate_requests`
--
CREATE TABLE `certificate_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `courseId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved') NOT NULL DEFAULT 'pending',
  `certificateHtml` mediumtext DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `instructor_applications`
--
CREATE TABLE `instructor_applications` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `instructor_branding`
--
CREATE TABLE `instructor_branding` (
  `userId` varchar(255) NOT NULL,
  `customDomain` varchar(255) DEFAULT NULL,
  `brandName` varchar(255) DEFAULT NULL,
  `brandLogoUrl` text DEFAULT NULL,
  `brandPrimaryColor` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `commissions`
--
CREATE TABLE `commissions` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('referral','instructor_milestone') NOT NULL,
  `sourceUserId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `withdrawal_requests`
--
CREATE TABLE `withdrawal_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bankDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`bankDetails`)),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `processedDate` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `custom_app_requests`
--
CREATE TABLE `custom_app_requests` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `appName` varchar(255) NOT NULL,
  `appKeywords` text NOT NULL,
  `topology` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `paymentDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `requestDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending_approval','in_progress','completed','rejected') NOT NULL DEFAULT 'pending_approval',
  `adminNotes` text DEFAULT NULL,
  `resultLink` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `lesson_progress`
--
CREATE TABLE `lesson_progress` (
  `userId` varchar(255) NOT NULL,
  `lessonId` varchar(255) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `referralCode` (`referralCode`);

--
-- Indeks untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `authorId` (`authorId`);

--
-- Indeks untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`userId`,`courseId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);
  
--
-- Indeks untuk tabel `upgrade_requests`
--
ALTER TABLE `upgrade_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);
  
--
-- Indeks untuk tabel `payment_accounts`
--
ALTER TABLE `payment_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `confirmation_contacts`
--
ALTER TABLE `confirmation_contacts`
  ADD PRIMARY KEY (`id`);
  
--
-- Indeks untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeks untuk tabel `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
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
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `customDomain` (`customDomain`);
  
--
-- Indeks untuk tabel `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);
  
--
-- Indeks untuk tabel `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeks untuk tabel `custom_app_requests`
--
ALTER TABLE `custom_app_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indeks untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`userId`, `lessonId`);


--
-- Constraints for dumped tables
--

--
-- Ketidakleluasaan untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `upgrade_requests`
--
ALTER TABLE `upgrade_requests`
  ADD CONSTRAINT `upgrade_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
  
--
-- Ketidakleluasaan untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
  
--
-- Ketidakleluasaan untuk tabel `instructor_applications`
--
ALTER TABLE `instructor_applications`
  ADD CONSTRAINT `instructor_applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
  
--
-- Ketidakleluasaan untuk tabel `instructor_branding`
--
ALTER TABLE `instructor_branding`
  ADD CONSTRAINT `instructor_branding_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `commissions`
--
ALTER TABLE `commissions`
  ADD CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
  
--
-- Ketidakleluasaan untuk tabel `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
  
--
-- Ketidakleluasaan untuk tabel `custom_app_requests`
--
ALTER TABLE `custom_app_requests`
  ADD CONSTRAINT `custom_app_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
