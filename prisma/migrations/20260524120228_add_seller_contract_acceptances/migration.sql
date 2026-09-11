CREATE TABLE `seller_contract_acceptances` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sellerId` BIGINT NOT NULL,
  `listingId` BIGINT NULL,
  `contractVersion` VARCHAR(191) NOT NULL,
  `contractPdfUrl` VARCHAR(191) NULL,
  `commissionRate` DECIMAL(5,2) NOT NULL,
  `isAccepted` BOOLEAN NOT NULL DEFAULT true,
  `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ipAddress` VARCHAR(191) NULL,
  `deviceInfo` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
);