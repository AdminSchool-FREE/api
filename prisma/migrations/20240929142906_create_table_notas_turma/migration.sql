-- CreateTable
CREATE TABLE `NotasProvas` (
    `id` VARCHAR(191) NOT NULL,
    `nota` DECIMAL(2, 2) NOT NULL DEFAULT 0,
    `ano` VARCHAR(191) NOT NULL,
    `tipoPeriodo` ENUM('mensal', 'bimestral', 'trimestral', 'semestral') NOT NULL DEFAULT 'bimestral',
    `periodo` VARCHAR(191) NOT NULL,
    `idAluno` VARCHAR(191) NOT NULL,
    `idDisciplina` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotasProvas` ADD CONSTRAINT `NotasProvas_idAluno_fkey` FOREIGN KEY (`idAluno`) REFERENCES `Aluno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotasProvas` ADD CONSTRAINT `NotasProvas_idDisciplina_fkey` FOREIGN KEY (`idDisciplina`) REFERENCES `Disciplina`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
