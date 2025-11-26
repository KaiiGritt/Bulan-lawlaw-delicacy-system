-- AlterTable
ALTER TABLE `otps` ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `otps_email_idx` ON `otps`(`email`);
