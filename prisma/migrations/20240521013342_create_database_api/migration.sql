-- CreateTable
CREATE TABLE `Escola` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turma` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `idEscola` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `idEscola` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModeloMensagem` (
    `id` VARCHAR(191) NOT NULL,
    `assunto` VARCHAR(191) NOT NULL,
    `modelo` LONGTEXT NOT NULL,
    `idEscola` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportSistema` (
    `id` VARCHAR(191) NOT NULL,
    `problema` LONGTEXT NOT NULL,
    `imagem` LONGTEXT NULL,
    `idEscola` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracoes` (
    `id` VARCHAR(191) NOT NULL,
    `login_api_whatsapp` VARCHAR(191) NULL,
    `senha_api_whatsapp` VARCHAR(191) NULL,
    `token_dispositivo_api_whatsapp` VARCHAR(191) NULL,
    `token_api_whatsapp` LONGTEXT NULL,
    `idEscola` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Configuracoes_login_api_whatsapp_key`(`login_api_whatsapp`),
    UNIQUE INDEX `Configuracoes_token_dispositivo_api_whatsapp_key`(`token_dispositivo_api_whatsapp`),
    UNIQUE INDEX `Configuracoes_idEscola_key`(`idEscola`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aluno` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `ra` VARCHAR(191) NOT NULL,
    `rg` VARCHAR(191) NOT NULL,
    `dataNascimento` DATE NOT NULL,
    `idTurma` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Aluno_cpf_key`(`cpf`),
    UNIQUE INDEX `Aluno_ra_key`(`ra`),
    UNIQUE INDEX `Aluno_rg_key`(`rg`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Responsavel` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Responsavel_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TelefoneResponsavel` (
    `id` VARCHAR(191) NOT NULL,
    `ddd` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `whatsapp` BOOLEAN NOT NULL DEFAULT true,
    `idResponsavel` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TelefoneResponsavel_telefone_key`(`telefone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResponsavelAluno` (
    `idResponsavel` VARCHAR(191) NOT NULL,
    `idAluno` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idAluno`, `idResponsavel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacaoResponsavelAluno` (
    `id` VARCHAR(191) NOT NULL,
    `mensagem` LONGTEXT NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enviadoEm` DATETIME(3) NULL,
    `idResponsavel` VARCHAR(191) NOT NULL,
    `idAluno` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChamadaTurma` (
    `id` VARCHAR(191) NOT NULL,
    `dataChamada` DATETIME(3) NOT NULL,
    `presenca` BOOLEAN NOT NULL DEFAULT true,
    `idAluno` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Turma` ADD CONSTRAINT `Turma_idEscola_fkey` FOREIGN KEY (`idEscola`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_idEscola_fkey` FOREIGN KEY (`idEscola`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModeloMensagem` ADD CONSTRAINT `ModeloMensagem_idEscola_fkey` FOREIGN KEY (`idEscola`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportSistema` ADD CONSTRAINT `ReportSistema_idEscola_fkey` FOREIGN KEY (`idEscola`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Configuracoes` ADD CONSTRAINT `Configuracoes_idEscola_fkey` FOREIGN KEY (`idEscola`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aluno` ADD CONSTRAINT `Aluno_idTurma_fkey` FOREIGN KEY (`idTurma`) REFERENCES `Turma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TelefoneResponsavel` ADD CONSTRAINT `TelefoneResponsavel_idResponsavel_fkey` FOREIGN KEY (`idResponsavel`) REFERENCES `Responsavel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponsavelAluno` ADD CONSTRAINT `ResponsavelAluno_idResponsavel_fkey` FOREIGN KEY (`idResponsavel`) REFERENCES `Responsavel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponsavelAluno` ADD CONSTRAINT `ResponsavelAluno_idAluno_fkey` FOREIGN KEY (`idAluno`) REFERENCES `Aluno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoResponsavelAluno` ADD CONSTRAINT `NotificacaoResponsavelAluno_idResponsavel_fkey` FOREIGN KEY (`idResponsavel`) REFERENCES `Responsavel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacaoResponsavelAluno` ADD CONSTRAINT `NotificacaoResponsavelAluno_idAluno_fkey` FOREIGN KEY (`idAluno`) REFERENCES `Aluno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChamadaTurma` ADD CONSTRAINT `ChamadaTurma_idAluno_fkey` FOREIGN KEY (`idAluno`) REFERENCES `Aluno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
