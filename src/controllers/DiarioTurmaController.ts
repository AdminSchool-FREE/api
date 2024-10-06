import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  buscarLancamentosNotasAtividadeTurma,
  inserirNotaAtividadeTurma,
} from '../repositories/DiarioRepository'

class DiarioTurmaController {
  async lancarNotasTurma(app: FastifyInstance) {
    const bodyNotaAtividade = z.array(
      z.object({
        idAluno: z.string().uuid(),
        idDisciplina: z.string().uuid(),
        nota: z.coerce.number().min(0).max(10),
        ano: z.string().length(4),
        tipoPeriodo: z.enum(['mensal', 'bimestral', 'trimestral', 'semestral']),
        periodo: z.string(),
        descricao: z.string(),
      }),
    )

    app.post('/lancamento', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      const notasTurma = await bodyNotaAtividade.parseAsync(req.body)

      if (idEscola) {
        try {
          await inserirNotaAtividadeTurma({
            notasAtividade: notasTurma.map((aluno) => {
              return {
                idAluno: aluno.idAluno,
                idDisciplina: aluno.idDisciplina,
                nota: Number(aluno.nota.toFixed(2)),
                ano: aluno.ano,
                tipoPeriodo: aluno.tipoPeriodo,
                periodo: aluno.periodo,
                descricao: aluno.descricao,
              }
            }),
          })

          res.status(201).send({
            status: true,
            msg: 'Notas lançadas com sucesso!',
          })
        } catch (error) {
          res.status(500).send({
            status: false,
            msg: 'Falha ao lançar notas da turma: ' + error,
          })
        }
      } else {
        res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })
      }
    })
  }

  async buscarLancamentosTurma(app: FastifyInstance) {
    const query = z.object({
      ano: z.string().length(4),
      disciplina: z.string().uuid().optional(),
      tipoPeriodo: z
        .enum(['mensal', 'bimestral', 'trimestral', 'semestral'])
        .optional(),
      periodo: z.string().optional(),
    })

    const params = z.object({
      idTurma: z.string().uuid(),
    })

    app.get('/lancamentos/:idTurma', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      const {
        ano,
        tipoPeriodo,
        periodo,
        disciplina: idDisciplina,
      } = await query.parseAsync(req.query)

      const { idTurma } = await params.parseAsync(req.params)

      if (idEscola) {
        try {
          const lancamentos = await buscarLancamentosNotasAtividadeTurma({
            ano,
            tipoPeriodo,
            periodo,
            idEscola,
            idTurma,
            idDisciplina,
          })

          res.status(200).send({
            status: true,
            dados: lancamentos.map((lancamento) => {
              return {
                id: lancamento.id,
                aluno: lancamento.aluno.nome,
                disciplina: lancamento.disciplina.nome,
                ano: lancamento.ano,
                tipoPeriodo: lancamento.tipoPeriodo,
                periodo: lancamento.periodo,
                descricao: lancamento.descricao,
                nota: lancamento.nota,
                lancamento: lancamento.lancamento,
              }
            }),
            msg: 'Lançamentos consultados com sucesso!',
          })
        } catch (error) {
          res.status(500).send({
            status: false,
            msg: 'Falha ao consultar os lançamentos: ' + error,
          })
        }
      } else {
        res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })
      }
    })
  }
}

export default DiarioTurmaController