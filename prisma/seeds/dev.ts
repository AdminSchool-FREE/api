import { prisma } from '../../src/libraries/PrismaClient'
import { criptografarSenha } from '../../src/utils/Bcrypt'

async function seed() {
  const criaEscola = prisma.escola.create({
    data: {
      id: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      nome: 'Escola de Teste',
      Usuario: {
        create: {
          id: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4',
          nome: 'Adriano Silva',
          email: 'adriano@dev.com',
          senha: criptografarSenha('mudar@123'),
        },
      },
    },
  })

  const criaDisciplinas = prisma.disciplina.createMany({
    data: [
      {
        nome: 'Matemática',
        idEscola: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      },
      {
        nome: 'Português',
        idEscola: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      },
    ],
  })

  await prisma.$transaction([criaEscola, criaDisciplinas])
}

seed()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .then(() => {
    console.log('Seed realizado com sucesso!')
  })
