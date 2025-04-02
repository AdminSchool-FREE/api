import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  buscarConfiguracoesApiWhatsapp,
  buscarDadosEscola,
} from '../repositories/EscolaRepository'
import {
  EstatisticasAvaliativasAlunos,
  EstatisticasEscolar,
  EstatisticasFrequenciaAlunos,
} from '../repositories/RelatorioRepository'
import { inserirBug } from '../repositories/ReportSistemaRepository'
import WhatsAppChatPro from '../services/whatsapp/WhatsAppChatPro'

class ReportBugController {
  async reportarBug(app: FastifyInstance) {
    const schemaBodyReport = z.object({
      problema: z.string(),
    })

    app.post('/', async (req, res) => {
      const { problema } = await schemaBodyReport.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const configuracoesEscola =
          await buscarConfiguracoesApiWhatsapp(idEscola)
        const telefoneWhatsapp = process.env.WHATSAPP_REPORT ?? null

        if (telefoneWhatsapp && configuracoesEscola) {
          if (
            configuracoesEscola?.token_api_whatsapp &&
            configuracoesEscola?.token_dispositivo_api_whatsapp
          ) {
            const servicoWhatsapp = new WhatsAppChatPro(
              configuracoesEscola?.token_api_whatsapp,
              configuracoesEscola?.token_dispositivo_api_whatsapp
            )

            const dadosEscola = await buscarDadosEscola(idEscola)

            if (dadosEscola) {
              const mensagemProblema = `${dadosEscola.nome}\n${problema}`
              const reportBug = await inserirBug({
                problema: mensagemProblema,
                idEscola,
              })

              if (reportBug.imagem) {
                try {
                  await servicoWhatsapp.enviarAnexoMensagem({
                    mensagem: reportBug.problema,
                    arquivo: reportBug.imagem,
                    numeroDestinatario: telefoneWhatsapp,
                  })

                  res.status(201).send({
                    message: 'Bug reportado com sucesso',
                  })
                } catch (error) {
                  res.status(500).send({
                    message: 'Houve um problema ao reportar o bug',
                    error,
                  })
                }
              } else {
                try {
                  await servicoWhatsapp.enviarMensagem({
                    mensagem: reportBug.problema,
                    numeroDestinatario: telefoneWhatsapp,
                  })

                  res.status(201).send({
                    message: 'Bug reportado com sucesso',
                  })
                } catch (error) {
                  res.status(500).send({
                    message: 'Houve um problema ao reportar o bug',
                    error,
                  })
                }
              }
            } else {
              res.status(401).send({
                mensagem: 'Escola não encontrado',
              })
            }
          } else {
            res.status(400).send({
              message: 'Houve um problema ao reportar o bug',
            })
          }
        } else {
          res.status(400).send({
            message: 'Houve um problema ao reportar o bug',
          })
        }
      } else {
        res.status(401).send({
          mensagem: 'Usuário não logado',
        })
      }
    })
  }

  async relatorioEstatisticasEscola(app: FastifyInstance) {
    app.get('/estatisticas', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const relatorioEstatisticasEscola = await EstatisticasEscolar({
          idEscola,
        })

        res.status(200).send(relatorioEstatisticasEscola)
      } else {
        res.status(401).send({
          message: 'Usuário não logado',
        })
      }
    })
  }

  async relatorioFrequenciaEscolar(app: FastifyInstance) {
    const schemaParamsFilters = z.object({
      inicio: z.coerce.date(),
      fim: z.coerce.date(),
      turma: z.string(),
    })

    app.get('/frequencia', async (req, res) => {
      const { inicio, fim, turma } = await schemaParamsFilters.parseAsync(
        req.query
      )

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const relatorioFrequenciaAlunos = await EstatisticasFrequenciaAlunos({
          filtroData: {
            inicio,
            fim,
          },
          idTurma: turma,
          idEscola,
        })

        res.status(200).send(relatorioFrequenciaAlunos)
      } else {
        res.status(401).send({
          message: 'Usuário não logado',
        })
      }
    })
  }

  async relatorioAvaliacoesAlunos(app: FastifyInstance) {
    const schemaParamsFilters = z.object({
      disciplina: z.string().uuid(),
      turma: z.string().uuid(),
      inicio: z.coerce.date(),
      fim: z.coerce.date(),
      periodo: z.coerce.number(),
      tipoPeriodo: z.string(),
    })

    app.get('/avaliacoes', async (req, res) => {
      const { disciplina, turma, inicio, fim, periodo, tipoPeriodo } =
        await schemaParamsFilters.parseAsync(req.query)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const relatorioAvaliacoesAlunos = await EstatisticasAvaliativasAlunos({
          idDisciplina: disciplina,
          idTurma: turma,
          filtroData: {
            inicio,
            fim,
          },
          idEscola,
          periodo,
          tipoPeriodo,
        })

        res.status(200).send(relatorioAvaliacoesAlunos)
      } else {
        res.status(401).send({
          message: 'Usuário não logado',
        })
      }
    })
  }
}

export default ReportBugController
