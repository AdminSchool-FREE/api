-- AlterTable
ALTER TABLE `Aluno` ADD COLUMN `notificacaoBloqueado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `NotasProvas` ADD COLUMN `realizadoEm` DATE NULL;
