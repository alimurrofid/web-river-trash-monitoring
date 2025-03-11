/*
  Warnings:

  - You are about to drop the column `truck_down` on the `billboard_traffic` table. All the data in the column will be lost.
  - You are about to drop the column `truck_up` on the `billboard_traffic` table. All the data in the column will be lost.
  - Added the required column `van_down` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `van_up` to the `billboard_traffic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `billboard_traffic` DROP COLUMN `truck_down`,
    DROP COLUMN `truck_up`,
    ADD COLUMN `van_down` INTEGER NOT NULL,
    ADD COLUMN `van_up` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `streaming_links` ADD CONSTRAINT `streaming_links_billboard_id_fkey` FOREIGN KEY (`billboard_id`) REFERENCES `billboard_traffic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
