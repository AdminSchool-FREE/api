import { format } from 'date-fns'
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

export async function buscaChamadaTurmaRealizada(
  idTurma: string,
  escolaId: string,
  dataChamada: Date,
) {
  return await prisma.chamadaTurma.findFirst({
    where: {
      dataChamada: {
        equals: new Date(format(dataChamada, 'yyyy-MM-dd')),
      },
      aluno: {
        idTurma,
        turma: {
          idEscola: escolaId,
        }
      },
    },
    select: {
      id: true,
    },
  });
}

export async function historicoFrequenciaAlunosTurma(
  {
    turmaId,
    dataLetivoInicio,
    dataLetivoFim,
    escolaId
  }: { escolaId: string, turmaId: string, dataLetivoInicio: Date, dataLetivoFim: Date }
) {

  return await prisma.chamadaTurma.findMany({
    where: {
      dataChamada: {
        gte: new Date(`${format(dataLetivoInicio, 'yyyy-MM-dd')}T00:00:00.000Z`),
        lt: new Date(`${format(dataLetivoFim, 'yyyy-MM-dd')}T23:59:59.999Z`),
      },
      aluno: {
        idTurma: turmaId,
        turma: {
          idEscola: escolaId,
        },
      },
    },
    select: {
      id: true,
      dataChamada: true,
      idAluno: true,
      presenca: true,
      aluno: {
        select: {
          nome: true,
        },
      },
    },
    orderBy: {
      aluno: {
        nome: 'asc',
      },
    },
  });
}

export async function getHistoricoChamadasTurma({ turmaId, escolaId }: { turmaId: string, escolaId: string }) {
  return await prisma.chamadaTurma.findMany({
    where: {
      aluno: {
        idTurma: turmaId,
        turma: {
          idEscola: escolaId
        }
      },
    },
    select: {
      dataChamada: true,
    },
    orderBy: {
      dataChamada: 'asc',
    },
    distinct: ['dataChamada'],
  });
}