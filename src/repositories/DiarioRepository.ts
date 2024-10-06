import {
  FiltroNotaAtividadeProps,
  NovaNotaAtividadeAlunosProps,
} from '../interfaces/DiarioTurmaInterface'
import { prisma } from '../libraries/PrismaClient'

export async function inserirNotaAtividadeTurma({
  notasAtividade,
}: NovaNotaAtividadeAlunosProps) {
  return await prisma.notasProvas.createMany({
    data: notasAtividade,
  })
}

export async function buscarLancamentosNotasAtividadeTurma({
  idEscola,
  idTurma,
  ano,
  periodo,
  tipoPeriodo,
  idDisciplina,
}: FiltroNotaAtividadeProps) {
  return await prisma.notasProvas.findMany({
    select: {
      id: true,
      aluno: {
        select: {
          nome: true,
        },
      },
      disciplina: {
        select: {
          nome: true,
        },
      },
      ano: true,
      periodo: true,
      tipoPeriodo: true,
      descricao: true,
      nota: true,
      lancamento: true,
    },
    where: {
      aluno: {
        turma: {
          id: idTurma,
          idEscola,
        },
      },
      ano,
      periodo,
      tipoPeriodo,
      idDisciplina,
    },
  })
}
