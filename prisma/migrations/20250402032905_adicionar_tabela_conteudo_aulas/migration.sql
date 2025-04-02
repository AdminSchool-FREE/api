-- CreateTable
CREATE TABLE `ConteudoAulaTurma` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` LONGTEXT NOT NULL,
    `realizadoEm` DATE NULL,
    `lancamento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idTurma` VARCHAR(191) NOT NULL,
    `idDisciplina` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConteudoAulaTurma` ADD CONSTRAINT `ConteudoAulaTurma_idTurma_fkey` FOREIGN KEY (`idTurma`) REFERENCES `Turma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConteudoAulaTurma` ADD CONSTRAINT `ConteudoAulaTurma_idDisciplina_fkey` FOREIGN KEY (`idDisciplina`) REFERENCES `Disciplina`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
