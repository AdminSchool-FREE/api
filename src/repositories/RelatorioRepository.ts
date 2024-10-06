import { format } from 'date-fns'

import { prisma } from '../libraries/PrismaClient'

interface RelatorioEscolaProps {
  idEscola: string
}

interface RelatorioFrequenciaTurma {
  idTurma?: string
  idEscola: string
  filtroData: {
    inicio: Date
    fim: Date
  }
}

interface RelatorioAvaliativaTurmaProps {
  idTurma: string
  idEscola: string
  idDisciplina: string
  tipoPeriodo: string
  periodo: number
  filtroData: {
    inicio: Date
    fim: Date
  }
}

export async function EstatisticasEscolar({ idEscola }: RelatorioEscolaProps) {
  const now = new Date()

  const qtdTurmasEscola = await prisma.turma.count({
    where: {
      idEscola,
    },
  })

  const totalAlunos = await prisma.aluno.count({
    where: {
      turma: {
        idEscola,
      },
    },
  })

  const totalFaltasAnoAtual = await prisma.chamadaTurma.count({
    where: {
      aluno: {
        turma: {
          idEscola,
        },
      },
      presenca: false,
      dataChamada: {
        gte: new Date(now.getFullYear(), 1, 1),
        lte: new Date(now.getFullYear(), 12, 0),
      },
    },
  })

  const totalNotificacoesEnviadaMesAtual =
    await prisma.notificacaoResponsavelAluno.count({
      where: {
        aluno: {
          turma: {
            idEscola,
          },
        },
        enviadoEm: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        },
      },
    })

  const totalNotificacoesEnviadaMesPassado =
    await prisma.notificacaoResponsavelAluno.count({
      where: {
        aluno: {
          turma: {
            idEscola,
          },
        },
        enviadoEm: {
          gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          lte: new Date(now.getFullYear(), now.getMonth() - 1, 0),
        },
      },
    })

  return {
    qtdTurmasEscola,
    totalAlunos,
    totalFaltasAnoAtual,
    frequenciaAtual: (totalAlunos / totalFaltasAnoAtual) * 100,
    totalNotificacoesEnviadaMesAtual,
    totalNotificacoesEnviadaMesPassado,
  }
}

export async function EstatisticasFrequenciaAlunos({
  idTurma,
  idEscola,
  filtroData,
}: RelatorioFrequenciaTurma) {
  const totalFaltaAlunos: {
    Aluno: string
    TotalFaltas: number
  }[] = await prisma.$queryRaw`SELECT 
      Aluno.nome AS Aluno, 
      COUNT(ChamadaTurma.id) AS TotalFaltas
    from ChamadaTurma 
    join Aluno on Aluno.id = ChamadaTurma.idAluno
    join Turma on Aluno.idTurma = Turma.id
    where Turma.idEscola = ${idEscola} 
    AND ChamadaTurma.presenca = 0 
    AND DATE_FORMAT(ChamadaTurma.dataChamada, '%Y-%m-%d') BETWEEN ${format(filtroData.inicio, 'yyyy-MM-dd')} AND ${format(filtroData.fim, 'yyyy-MM-dd')}
    AND Aluno.idTurma = ${idTurma}
    GROUP BY Aluno.id
    ORDER BY COUNT(ChamadaTurma.id) DESC
  `
  return totalFaltaAlunos.map((aluno) => {
    return {
      Aluno: aluno.Aluno,
      TotalFaltas: Number(aluno.TotalFaltas),
    }
  })
}

export async function EstatisticasAvaliativasAlunos({
  idDisciplina,
  idTurma,
  idEscola,
  filtroData,
  periodo,
  tipoPeriodo,
}: RelatorioAvaliativaTurmaProps) {
  const estatisticasAvaliativas: {
    Aluno: string
    Descricao: string
    Disciplina: string
    Media: number
  }[] = await prisma.$queryRaw`select 
      Aluno.nome as Aluno, 
      NotasProvas.descricao as Descricao,
      Disciplina.nome as Disciplina, 
      AVG(NotasProvas.nota) as Media
    from NotasProvas 
    join Disciplina on NotasProvas.idDisciplina = Disciplina.id 
    join Aluno on NotasProvas.idAluno = Aluno.id
    join Turma on Aluno.idTurma = Turma.id
    where Turma.idEscola = ${idEscola}
    AND Disciplina.id = ${idDisciplina}
    AND Aluno.idTurma = ${idTurma}
    AND NotasProvas.tipoPeriodo = ${tipoPeriodo}
    AND NotasProvas.periodo = ${periodo}
    AND DATE_FORMAT(NotasProvas.lancamento, '%Y-%m-%d') BETWEEN ${format(filtroData.inicio, 'yyyy-MM-dd')} AND ${format(filtroData.fim, 'yyyy-MM-dd')}
    GROUP BY Aluno.id
  `

  return estatisticasAvaliativas.map((nota) => {
    return {
      Aluno: nota.Aluno,
      Descricao: nota.Descricao,
      Disciplina: nota.Disciplina,
      Media: Number(nota.Media),
    }
  })
}
