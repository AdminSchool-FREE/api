import { prisma } from '../libraries/PrismaClient'

interface NovaTurmaProps {
  nome: string
  idEscola: string
}

interface ChamadaTurmaProps {
  idAluno: string
  presenca: boolean
  dataChamada: Date
}

export async function listarTurmasEscola(idEscola: string) {
  const turmas = await prisma.turma.findMany({
    select: {
      id: true,
      nome: true,
    },
    where: {
      idEscola,
    },
    orderBy: {
      nome: 'asc',
    },
  })

  return turmas
}

export async function inserirTurma({ nome, idEscola }: NovaTurmaProps) {
  const turma = await prisma.turma.create({
    select: {
      id: true,
      nome: true,
    },
    data: {
      nome,
      idEscola,
    },
  })

  return turma
}

export async function alterarNomeTurma(
  nome: string,
  idEscola: string,
  idTurma: string,
) {
  return await prisma.turma.update({
    select: {
      id: true,
      nome: true,
    },
    where: {
      id: idTurma,
      idEscola,
    },
    data: {
      nome,
    },
  })
}

export async function salvarChamadaTurma(
  dadosChamada: Array<ChamadaTurmaProps>,
) {
  return await prisma.chamadaTurma.createMany({
    data: dadosChamada,
  })
}
