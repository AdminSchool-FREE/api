import { buscarNotificacoesReponsaveisAluno, inserirNotificacoes, NovaNotificacaoProps } from './../repositories/AlunoRepository';
import { FastifyInstance } from "fastify";
import { z } from "zod";
import WhatsappService from "../services/WhatsappService";
import { buscarConfiguracoesApiWhatsapp } from "../repositories/EscolaRepository";
import { buscarDadosResponsavelAluno, buscarResponsaveisAlunos } from "../repositories/AlunoRepository";

class MensagemController {

  async enviarMensagemResponsavelAluno(app: FastifyInstance) {
    const bodyMensagem = z.object({
      idAluno: z.string().uuid().optional(),
      mensagem: z.string(),
      alunos: z.array(z.object({
        id: z.string().uuid()
      })).optional()
    })

    app.post('/notificar/responsaveis', async (req, res) => {
      const {
        mensagem,
        idAluno,
        alunos
      } = await bodyMensagem.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {

        const configuracoesEscola = await buscarConfiguracoesApiWhatsapp(idEscola)

        if (configuracoesEscola?.token_api_whatsapp && configuracoesEscola?.token_dispositivo_api_whatsapp) {

          const servicoWhatsapp = new WhatsappService()

          servicoWhatsapp.setTokenApi(configuracoesEscola?.token_api_whatsapp)
          servicoWhatsapp.setTokenDevice(configuracoesEscola?.token_dispositivo_api_whatsapp)

          if (idAluno && !alunos) {
            const responsaveisAluno = await buscarDadosResponsavelAluno(idAluno)

            if (responsaveisAluno) {
              const disparos: Array<any> = []
              const mensagens: Array<NovaNotificacaoProps> = []

              responsaveisAluno.forEach((responsaveisAluno) => {

                responsaveisAluno.responsavel.TelefoneResponsavel.forEach((contato) => {

                  const contatoResponsavel = contato.ddd.trim() + contato.telefone.trim()

                  disparos.push(servicoWhatsapp.enviarMensagem(mensagem, contatoResponsavel))
                })

                mensagens.push({
                  enviadoEm: new Date(),
                  idAluno: responsaveisAluno.aluno.id,
                  idResponsavel: responsaveisAluno.responsavel.id,
                  mensagem
                })
              })

              try {
                await Promise.all(disparos)
                await inserirNotificacoes(mensagens)

                res.status(202).send({
                  message: 'Mensagem enviada com sucesso',
                })
              }
              catch (err) {
                res.status(500).send({
                  message: 'Erro ao enviar mensagem',
                  erro: err
                })
              }
            }
            else {
              res.status(400).send({
                message: 'Responsável não possui telefone para envio de whatsapp'
              })
            }
          }
          else {
            const mensagens: Array<NovaNotificacaoProps> = []
            const disparos: Array<any> = []

            const listaResponsaveis = await buscarResponsaveisAlunos(alunos?.map((alunoSelecionado) => alunoSelecionado.id) ?? [])

            if (listaResponsaveis) {
              listaResponsaveis.forEach((responsaveisAluno) => {

                responsaveisAluno.responsavel.TelefoneResponsavel.forEach((contato) => {

                  const contatoResponsavel = contato.ddd + contato.telefone

                  disparos.push(servicoWhatsapp.enviarMensagem(mensagem, contatoResponsavel))
                })

                mensagens.push({
                  enviadoEm: new Date(),
                  idAluno: responsaveisAluno.aluno.id,
                  idResponsavel: responsaveisAluno.responsavel.id,
                  mensagem
                })

              })
              try {
                await Promise.all(disparos)
                await inserirNotificacoes(mensagens)

                res.status(202).send({
                  message: 'Mensagem enviada com sucesso',
                })
              }
              catch (err) {
                res.status(500).send({
                  message: 'Erro ao enviar mensagem',
                  error: err
                })
              }
            }
            else {
              res.status(400).send({
                message: 'Responsável não possui telefone para envio de whatsapp'
              })
            }


          }
        }
        else {
          res.status(404).send({
            message: 'Configurações da escola não encontrada'
          })
        }
      }
      else {
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async buscarMensagensAluno(app: FastifyInstance) {
    const paramsMensagens = z.object({
      id: z.string().uuid()
    })

    app.get('/aluno/:id', async (req, res) => {
      const { id } = await paramsMensagens.parseAsync(req.params)

      const listaMensagens = await buscarNotificacoesReponsaveisAluno(id)

      res.status(200).send(listaMensagens)
    })
  }
}

export default MensagemController