-- CreateTable
CREATE TABLE `Disciplina` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `idEscola` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Disciplina` ADD CONSTRAINT `Disciplina_idEscola_fkey` FOREIGN KEY (`idEscola`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
