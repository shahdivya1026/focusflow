-- AlterTable
ALTER TABLE `task` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `totalHours` DOUBLE NULL;
