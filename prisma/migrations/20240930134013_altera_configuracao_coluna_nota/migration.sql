/*
  Warnings:

  - You are about to alter the column `nota` on the `NotasProvas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(2,2)` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `NotasProvas` MODIFY `nota` DECIMAL(65, 30) NOT NULL DEFAULT 0;
