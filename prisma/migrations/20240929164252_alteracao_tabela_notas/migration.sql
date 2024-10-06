/*
  Warnings:

  - Added the required column `descricao` to the `NotasProvas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `NotasProvas` ADD COLUMN `descricao` VARCHAR(191) NOT NULL,
    ADD COLUMN `lancamento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
