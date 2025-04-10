import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  atualizarNotaAtividadeAluno,
  buscarConteudosAulaTurma,
  buscarLancamentosNotasAtividadeTurma,
  inserirConteudoAulaTurma,
  inserirNotaAtividadeTurma,
  removeAvaliacaoAluno,
  removeConteudoAulaTurma,
} from '../repositories/DiarioRepository'
import { buscarNomeDisciplina } from '../repositories/EscolaRepository'
import MensageriaService from '../services/MensageriaService'

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
        realizadoEm: z.coerce.date(),
      })
    )

    app.post('/lancamento', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      const notasTurma = await bodyNotaAtividade.parseAsync(req.body)

      if (idEscola) {
        try {
          await inserirNotaAtividadeTurma({
            notasAtividade: notasTurma.map(aluno => {
              return {
                idAluno: aluno.idAluno,
                idDisciplina: aluno.idDisciplina,
                nota: Number(aluno.nota.toFixed(2)),
                ano: aluno.ano,
                tipoPeriodo: aluno.tipoPeriodo,
                periodo: aluno.periodo,
                descricao: aluno.descricao,
                realizadoEm: aluno.realizadoEm,
              }
            }),
          })

          if (notasTurma.length > 0) {
            const notificarResponsaveis = new MensageriaService(
              notasTurma.map(aluno => aluno.idAluno),
              idEscola
            )

            const nomeDisciplina = await buscarNomeDisciplina({
              idDisciplina: notasTurma[0].idDisciplina,
              idEscola,
            })

            const notificacaoResponsaveis =
              await notificarResponsaveis.dispararNotificacaoAtividade({
                modeloMensagem: 'Prezado(a) responsável, o aluno(a) $nomeAluno recebeu nota $notaAtividade de $nomeDisciplina na $descricaoAtividade realizado em $realizadoEm',
                variaveis: {
                  notaAtividade: Number(notasTurma[0].nota.toFixed(2)),
                  descricaoAtividade: notasTurma[0].descricao,
                  nomeDisciplina: nomeDisciplina.nome,
                  realizadoEm: format(
                    new Date(notasTurma[0].realizadoEm),
                    'PPP',
                    {
                      locale: ptBR,
                    }
                  ),
                },
              })

            if (notificacaoResponsaveis.status) {
              res.status(201).send({
                status: true,
                msg: 'Notas lançadas com sucesso!',
              })
            } else {
              res.status(200).send({
                status: false,
                msg: 'Não foi possível notificar os responsáveis.',
              })
            }
          } else {
            res.status(200).send({
              status: false,
              msg: 'Nenhuma nota lançada.',
            })
          }
        } catch (error) {
          res.status(500).send({
            status: false,
            msg: `Falha ao lançar notas da turma: ${error}`,
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
            dados: lancamentos.map(lancamento => {
              return {
                id: lancamento.id,
                turmaId: lancamento.aluno.idTurma,
                alunoId: lancamento.aluno.id,
                aluno: lancamento.aluno.nome,
                disciplinaId: lancamento.disciplina.id,
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
            msg: `Falha ao consultar os lançamentos: ${error}`,
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

  async alterarNotaAtividade(app: FastifyInstance) {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    const schemaBody = z.object({
      idAluno: z.string().uuid(),
      idDisciplina: z.string().uuid(),
      nota: z.coerce.number().min(0).max(10),
      ano: z.string().length(4),
      tipoPeriodo: z.enum(['mensal', 'bimestral', 'trimestral', 'semestral']),
      periodo: z.string(),
      descricao: z.string(),
      realizadoEm: z.coerce.date(),
    })

    app.put('/lancamento/:id', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const { id } = await schemaParam.parseAsync(req.params)

        const {
          idAluno,
          idDisciplina,
          nota,
          ano,
          tipoPeriodo,
          periodo,
          descricao,
          realizadoEm,
        } = await schemaBody.parseAsync(req.body)
        try {
          const atualizaDados = await atualizarNotaAtividadeAluno({
            nota: {
              id,
              idAluno,
              idDisciplina,
              nota,
              ano,
              tipoPeriodo,
              periodo,
              descricao,
              realizadoEm,
            },
          })

          res.status(200).send({
            status: true,
            msg: 'Nota atualizado com sucesso!',
            dados: atualizaDados,
          })
        } catch (error) {
          res.status(500).send({
            status: false,
            msg: 'Falha ao atualizar a nota',
            data: null,
            error,
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

  async cadastrarConteudo(app: FastifyInstance) {
    const bodyConteudo = z.object({
      idDisciplina: z.string().uuid(),
      idTurma: z.string().uuid(),
      descricao: z.string(),
      realizadoEm: z.coerce.date(),
    })

    app.post('/conteudo', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      const conteudoDisciplina = await bodyConteudo.parseAsync(req.body)

      if (!idEscola) {
        res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })

        return
      }

      try {
        await inserirConteudoAulaTurma(conteudoDisciplina)

        res.status(201).send({
          status: true,
          msg: 'Conteudo aula lançadas com sucesso!',
        })
      }
      catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Falha ao inserir o conteudo',
          data: null,
          error,
        })
      }
    })
  }

  async removerConteudoAula(app: FastifyInstance) {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    app.delete('/conteudo/:id', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (!idEscola) {
        res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })

        return
      }

      const { id } = await schemaParam.parseAsync(req.params)

      try {
        await removeConteudoAulaTurma({ id, escola : idEscola ?? '' })

        res.status(200).send({
          status: true,
          msg: 'Conteudo removido com sucesso!'
        })
      }
      catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Falha ao remover o conteudo',
        })
      }
    })
  }

  async listarConteudosAulaTurma(app: FastifyInstance) {
    const schemaParam = z.object({
      turma: z.string().uuid(),
    })

    const schemaQueryParam = z.object({
      inicio: z.coerce.date(),
      fim: z.coerce.date()
    })
    
    app.get('/conteudo/:turma', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (!idEscola) {
        res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })

        return
      }

      const { turma } = await schemaParam.parseAsync(req.params)
      const {inicio, fim} = await schemaQueryParam.parseAsync(req.query)

      const listaConteudosAula = await buscarConteudosAulaTurma({
        idEscola,
        idTurma: turma,
        periodo: {
          inicio,
          fim
        }
      })

      res.status(200).send(listaConteudosAula.map((conteudo) => ({
        id: conteudo.id,
        descricao: conteudo.descricao,
        realizadoEm: conteudo.realizadoEm,
        disciplina: conteudo.disciplina.nome,
        idDisciplina: conteudo.idDisciplina,
        idTurma: conteudo.idTurma
      })))
    })
  }

  async removerAvaliacaoTurma(app: FastifyInstance) {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    app.delete('/lancamento/:id', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (!idEscola) {
        res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })

        return
      }

      const { id } = await schemaParam.parseAsync(req.params)

      try {
        await removeAvaliacaoAluno({ id, escola : idEscola ?? '' })

        res.status(200).send({
          status: true,
          msg: 'Avaliação removida com sucesso!'
        })
      }
      catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Falha ao remover o avaliação',
        })
      }
    })
  }
}

export default DiarioTurmaController
