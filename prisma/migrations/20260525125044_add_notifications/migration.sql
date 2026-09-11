/*
  Warnings:

  - The primary key for the `seller_contract_acceptances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `acceptedAt` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `contractPdfUrl` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `contractVersion` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `deviceInfo` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `isAccepted` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `listingId` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `seller_contract_acceptances` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `seller_contract_acceptances` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - Added the required column `commission_rate` to the `seller_contract_acceptances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_version` to the `seller_contract_acceptances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `seller_contract_acceptances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `seller_contract_acceptances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `seller_contract_acceptances` DROP PRIMARY KEY,
    DROP COLUMN `acceptedAt`,
    DROP COLUMN `commissionRate`,
    DROP COLUMN `contractPdfUrl`,
    DROP COLUMN `contractVersion`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `deviceInfo`,
    DROP COLUMN `ipAddress`,
    DROP COLUMN `isAccepted`,
    DROP COLUMN `listingId`,
    DROP COLUMN `sellerId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `accepted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `commission_rate` DECIMAL(5, 2) NOT NULL,
    ADD COLUMN `contract_pdf_url` VARCHAR(500) NULL,
    ADD COLUMN `contract_version` VARCHAR(50) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `device_info` TEXT NULL,
    ADD COLUMN `ip_address` VARCHAR(100) NULL,
    ADD COLUMN `is_accepted` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `listing_id` BIGINT UNSIGNED NULL,
    ADD COLUMN `seller_id` BIGINT UNSIGNED NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `watch_listings` MODIFY `status` ENUM('draft', 'pending_review', 'approved', 'auction_requested', 'rejected', 'sold') NOT NULL DEFAULT 'draft';

-- CreateTable
CREATE TABLE `device_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token` TEXT NOT NULL,
    `platform` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `device_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `seller_contract_acceptances_seller_id_idx` ON `seller_contract_acceptances`(`seller_id`);

-- CreateIndex
CREATE INDEX `seller_contract_acceptances_listing_id_idx` ON `seller_contract_acceptances`(`listing_id`);

-- AddForeignKey
ALTER TABLE `seller_contract_acceptances` ADD CONSTRAINT `seller_contract_acceptances_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_contract_acceptances` ADD CONSTRAINT `seller_contract_acceptances_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `watch_listings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_tokens` ADD CONSTRAINT `device_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
