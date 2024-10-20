import {
  AtualizaAtividadeAlunoProps,
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
          id: true,
          nome: true,
          idTurma: true,
        },
      },
      disciplina: {
        select: {
          id: true,
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

export async function atualizarNotaAtividadeAluno({
  nota,
}: AtualizaAtividadeAlunoProps) {
  return await prisma.notasProvas.update({
    data: {
      nota: nota.nota,
      realizadoEm: nota.realizadoEm,
      idDisciplina: nota.idDisciplina,
      periodo: nota.periodo,
      tipoPeriodo: nota.tipoPeriodo,
      ano: nota.ano,
      descricao: nota.descricao,
    },
    where: {
      id: nota.id,
      idAluno: nota.idAluno,
    },
  })
}
