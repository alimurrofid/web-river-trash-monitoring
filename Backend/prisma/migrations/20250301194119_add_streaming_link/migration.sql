/*
  Warnings:

  - You are about to drop the column `going_down` on the `billboard_traffic` table. All the data in the column will be lost.
  - You are about to drop the column `going_up` on the `billboard_traffic` table. All the data in the column will be lost.
  - Added the required column `bike_down` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bike_up` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `car_down` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `car_up` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `truck_down` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `truck_up` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `billboard_traffic` DROP COLUMN `going_down`,
    DROP COLUMN `going_up`,
    ADD COLUMN `bike_down` INTEGER NOT NULL,
    ADD COLUMN `bike_up` INTEGER NOT NULL,
    ADD COLUMN `car_down` INTEGER NOT NULL,
    ADD COLUMN `car_up` INTEGER NOT NULL,
    ADD COLUMN `truck_down` INTEGER NOT NULL,
    ADD COLUMN `truck_up` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `streaming_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `link` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expired_at` DATETIME(3) NOT NULL,
    `billboard_id` INTEGER NOT NULL,

    UNIQUE INDEX `streaming_links_link_key`(`link`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
