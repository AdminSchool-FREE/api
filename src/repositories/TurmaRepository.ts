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

export async function historicoFrequenciaAlunosTurma({ turmaId, dataLetivo, escolaId }: { escolaId: string, turmaId: string, dataLetivo: Date }) {

  return await prisma.$queryRaw`SELECT ChamadaTurma.id, Aluno.nome, dataChamada, idAluno, presenca
    from ChamadaTurma 
    join Aluno on Aluno.id = ChamadaTurma.idAluno
    join Turma on Aluno.idTurma = Turma.id
    where Turma.idEscola = ${escolaId} 
    AND DATE(ChamadaTurma.dataChamada) = ${format(dataLetivo, 'yyyy-MM-dd')}
    AND Aluno.idTurma = ${turmaId}
    ORDER BY Aluno.nome ASC
  `
}
