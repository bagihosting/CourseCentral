--
-- Database: `coursecentral_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `role` enum('admin','member','pro','instructor') NOT NULL DEFAULT 'member',
  `avatarUrl` varchar(1024) DEFAULT 'https://placehold.co/256x256.png',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `loginCount` int(11) NOT NULL DEFAULT 0,
  `referralCode` varchar(255) NOT NULL,
  `referredBy` varchar(255) DEFAULT NULL,
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `whatsapp`, `role`, `avatarUrl`, `createdAt`, `lastLoginAt`, `status`, `loginCount`, `referralCode`, `referredBy`, `affiliateBalance`, `affiliatePaid`, `instructorStatus`, `lessons_created_today`, `last_lesson_created_at`) VALUES
('user_admin_default', 'Admin', 'admin', '$2b$10$E.p/t8n5Zz.Jb8l8m0yZ2u.66s7o4w4g/l6u.4g.s/t8j.k8m0yZ', '081234567890', 'admin', 'https://placehold.co/256x256.png', '2024-08-25 00:00:00', NULL, 'active', 0, 'ADMINREF', NULL, 0.00, 0.00, 'approved', 0, NULL);
