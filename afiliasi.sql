-- =================================================================
-- Skema Database untuk Fitur Afiliasi
-- =================================================================
-- File ini berisi semua perubahan database yang diperlukan untuk mengaktifkan
-- fitur afiliasi. Perintah-perintah ini sudah termasuk dalam file `schema.sql` utama.
-- Gunakan file ini jika Anda ingin menerapkan atau memahami skema afiliasi secara terpisah.

-- Langkah 1: Menambahkan kolom terkait afiliasi ke tabel `users`
-- Pastikan tabel `users` sudah ada sebelum menjalankan perintah ini.
ALTER TABLE `users`
ADD COLUMN `affiliateBalance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Saldo komisi afiliasi yang belum dibayar.',
ADD COLUMN `affiliatePaid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total komisi afiliasi yang sudah pernah dibayarkan.';


-- Langkah 2: Membuat tabel untuk mencatat riwayat komisi
-- Tabel ini akan menyimpan setiap transaksi komisi yang masuk.
CREATE TABLE IF NOT EXISTS `commissions` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `type` ENUM('referral', 'instructor_milestone') NOT NULL,
  `sourceUserId` VARCHAR(255) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_commissions_user_idx` (`userId` ASC),
  CONSTRAINT `fk_commissions_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- Langkah 3: Membuat tabel untuk mengelola permintaan penarikan dana
-- Tabel ini mencatat semua permintaan penarikan dari pengguna.
CREATE TABLE IF NOT EXISTS `withdrawal_requests` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `bankDetails` JSON NOT NULL,
  `requestDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processedDate` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_withdrawals_user_idx` (`userId` ASC),
  CONSTRAINT `fk_withdrawals_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;
