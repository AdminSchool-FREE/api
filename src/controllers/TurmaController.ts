import { FastifyInstance } from "fastify";
import { z } from "zod";
import { alterarNomeTurma, inserirTurma, listarTurmasEscola, salvarChamadaTurma } from "../repositories/TurmaRepository";
import {
  buscarResponsaveisAlunos,
  excluirMatricula, 
  inserirNotificacoes, 
  listarAlunosTurmaEscola, 
  matricularNovoAluno, 
  NovaNotificacaoProps, 
  salvarTransferenciaAlunoTurma, 
  salvarTransferenciasAlunosTurma
} from "../repositories/AlunoRepository";
import WhatsappService from "../services/WhatsappService";
import { buscarConfiguracoesApiWhatsapp } from "../repositories/EscolaRepository";

class TurmaController {

  async criarTurma(app: FastifyInstance) {
    const bodyTurma = z.object({
      nome: z.string()
    })

    app.post('/', async (req, res) => {
      const {
        nome
      } = await bodyTurma.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const turma = await inserirTurma({ nome, idEscola })

        res.status(201).send(turma)
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async listarTurmas(app: FastifyInstance) {
    app.get('/', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const turmas = await listarTurmasEscola(idEscola)

        res.status(200).send(turmas)
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async renomearTurma(app: FastifyInstance) {
    const paramTurma = z.object({
      id: z.string().uuid()
    })

    const bodyTurma = z.object({
      nome: z.string()
    })

    app.patch('/:id', async (req, res) => {
      const {
        id
      } = await paramTurma.parseAsync(req.params)

      const {
        nome
      } = await bodyTurma.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {

        const alteraTurma = await alterarNomeTurma(nome, idEscola, id)

        res.status(200).send(alteraTurma)

      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async listarAlunosTurma(app: FastifyInstance) {
    const paramTurma = z.object({
      id: z.string().uuid()
    })

    app.get('/:id/alunos', async (req, res) => {
      const {
        id
      } = await paramTurma.parseAsync(req.params)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const alunos = await listarAlunosTurmaEscola(idEscola, id)

        res.status(200).send(alunos)
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async matricularAlunoTurma(app: FastifyInstance) {
    const schemaBodyAluno = z.object({
      nome: z.string({
        required_error: 'O nome do aluno é obrigatório',
      }),
      cpf: z
        .string({
          required_error: 'O CPF do aluno é obrigatório',
        }),
      rg: z.string({
        required_error: 'O RG do aluno é obrigatório',
      }),
      ra: z.string({
        required_error: 'O RA do aluno é obrigatório',
      }),
      dataNascimento: z.string({
        required_error: 'A data de nascimento do aluno é obrigatória',
      }),
      nomeResponsavel: z.string({
        required_error: 'O nome do responsável é obrigatório',
      }),
      cpfResponsavel: z
        .string({
          required_error: 'O CPF do responsável é obrigatório',
        }),
      telefones: z.array(
        z.object({
          ddd: z.string({
            required_error: 'O DDD do telefone é obrigatório',
          }),
          telefone: z
            .string({
              required_error: 'O número do telefone é obrigatório',
            })
            .min(9, {
              message: 'Telefone inválido',
            }),
          whatsapp: z.boolean().default(false),
        }),
        {
          required_error: 'O telefone é obrigatório',
        },
      ),
    })

    const paramTurma = z.object({
      id: z.string()
    })

    app.post('/:id/aluno/matricula', async (req, res) => {
      const {
        id
      } = await paramTurma.parseAsync(req.params)

      const {
        nome,
        cpf,
        rg,
        ra,
        dataNascimento,
        nomeResponsavel,
        cpfResponsavel,
        telefones,
      } = await schemaBodyAluno.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const aluno = await matricularNovoAluno({
          nome,
          cpf,
          rg,
          ra,
          dataNascimento: new Date(dataNascimento),
          nomeResponsavel,
          cpfResponsavel,
          telefones,
          idTurma: id
        })

        res.status(201).send(aluno)
      }
    })
  }

  async transferirAlunoTurma(app: FastifyInstance) {
    const bodyTurma = z.object({
      idTurma: z.string().uuid()
    })

    const paramAluno = z.object({
      id: z.string().uuid()
    })

    app.patch('/aluno/:id/transferir', async (req, res) => {
      const cookieSession = req.cookies

      if (cookieSession['session-company']) {
        const {
          id
        } = await paramAluno.parseAsync(req.params)

        const {
          idTurma
        } = await bodyTurma.parseAsync(req.body)

        const transferencia = await salvarTransferenciaAlunoTurma(
          id,
          idTurma
        )

        res.status(201).send(transferencia)
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async transferirAlunosTurma(app: FastifyInstance) {

    const bodyTransferencias = z.object({
      alunos: z.array(
        z.object({
          id: z.string().uuid()
        }
        )),
      idTurma: z.string().uuid()
    })

    app.patch('/alunos/transferencias', async (req, res) => {
      const cookieSession = req.cookies

      if (cookieSession['session-company']) {
        const { alunos, idTurma } = await bodyTransferencias.parseAsync(req.body)

        try {
          await salvarTransferenciasAlunosTurma(
            alunos.map((aluno) => aluno.id),
            idTurma
          )

          res.status(200).send({
            message: 'Transferências realizadas com sucesso'
          })
        }
        catch (error) {
          res.status(400).send({
            message: 'Houve um problema ao fazer transferencias dos alunos'
          })
        }
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async excluirMatriculaAluno(app: FastifyInstance) {
    const paramAluno = z.object({
      id: z.string().uuid()
    })

    app.delete('/aluno/:id', async (req, res) => {
      const {
        id
      } = await paramAluno.parseAsync(req.params)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const aluno = await excluirMatricula(id, idEscola)

        res.status(200).send(aluno)
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }

  async realizarChamadaTurma(app: FastifyInstance) {
    const bodyChamada = z.object({
      chamada: z.array(
        z.object({
          idAluno: z.string().uuid(),
          presente: z.boolean().default(false),
        }),
      ),
    })

    app.post('/chamada', async (req, res) => {
      const { chamada } = await bodyChamada.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        try {
          const dadosChamada = chamada.map((aluno) => {
            return {
              idAluno: aluno.idAluno,
              presenca: aluno.presente,
              dataChamada: new Date()
            }
          })

          await salvarChamadaTurma(dadosChamada)

        }
        catch (error) {
          res.status(500).send({
            message: 'Houve um problema ao salvar a chamada do dia'
          })
        }

        const listaAlunosAusentes = chamada.filter((aluno) => !aluno.presente)

        if (listaAlunosAusentes.length > 0) {
          const listaResponsaveis = await buscarResponsaveisAlunos(listaAlunosAusentes.map((aluno) => aluno.idAluno))

          const mensagens: Array<NovaNotificacaoProps> = []
          const disparos: Array<any> = []

          if (listaResponsaveis) {

            const configuracoesEscola = await buscarConfiguracoesApiWhatsapp(idEscola)

            if (configuracoesEscola?.token_api_whatsapp && configuracoesEscola?.token_dispositivo_api_whatsapp) {

              const servicoWhatsapp = new WhatsappService()

              servicoWhatsapp.setTokenApi(configuracoesEscola?.token_api_whatsapp)
              servicoWhatsapp.setTokenDevice(configuracoesEscola?.token_dispositivo_api_whatsapp)

              listaResponsaveis.forEach((responsaveisAluno) => {

                responsaveisAluno.responsavel.TelefoneResponsavel.forEach((contato) => {

                  const contatoResponsavel = contato.ddd + contato.telefone

                  const mensagem = `Prezado(a) responsável, o aluno(a) ${responsaveisAluno.aluno.nome} não compareceu à aula hoje.`

                  disparos.push(servicoWhatsapp.enviarMensagem(mensagem, contatoResponsavel))

                  mensagens.push({
                    enviadoEm: new Date(),
                    idAluno: responsaveisAluno.aluno.id,
                    idResponsavel: responsaveisAluno.responsavel.id,
                    mensagem
                  })
                })
              })

              try {
                await Promise.all(disparos)
                await inserirNotificacoes(mensagens)

                res.status(200).send({
                  message: 'Chamada salvo com sucesso'
                })
              }
              catch (err) {
                res.status(500).send({
                  message: 'Erro ao enviar mensagem',
                  error: err
                })
              }
            }
          }
        }
      }
      else {
        res.status(401).send({
          message: 'Sessão encerrada!'
        })
      }
    })
  }
}

export default TurmaController