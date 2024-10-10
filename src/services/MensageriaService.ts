import {
  AdequarMensagemProps,
  DispararNotificacaoResponsavelProps,
  NotificacaoAtividadesAlunoProps,
  NotificacaoAusenciaAlunoProps,
} from '../interfaces/MensageriaInterface'
import {
  buscarResponsaveisAlunos,
  inserirNotificacoes,
  NovaNotificacaoProps,
} from '../repositories/AlunoRepository'
import { buscarConfiguracoesApiWhatsapp } from '../repositories/EscolaRepository'

import WhatsAppChatPro from './whatsapp/WhatsAppChatPro'

class MensageriaService {
  private alunos: Array<string>
  private escola: string
  private filaDisparosMensagens: Array<Promise<void>> = []
  private listaNotificacaoesDisparadas: Array<NovaNotificacaoProps> = []

  constructor(alunos: Array<string>, escola: string) {
    this.alunos = alunos
    this.escola = escola
  }

  private async getReponsaveisAlunos() {
    return await buscarResponsaveisAlunos(this.alunos)
  }

  private setNotificacaoDisparado({
    mensagem,
    idResponsavel,
    idAluno,
    enviadoEm,
  }: NovaNotificacaoProps) {
    this.listaNotificacaoesDisparadas.push({
      mensagem,
      idResponsavel,
      idAluno,
      enviadoEm,
    })
  }

  private async salvarNotificacoes() {
    await inserirNotificacoes(this.listaNotificacaoesDisparadas)
  }

  private async getServicoWhatsapp() {
    const configuracoesWhatsapp = await buscarConfiguracoesApiWhatsapp(
      this.escola,
    )
    if (
      configuracoesWhatsapp?.token_api_whatsapp &&
      configuracoesWhatsapp?.token_dispositivo_api_whatsapp
    ) {
      return new WhatsAppChatPro(
        configuracoesWhatsapp.token_api_whatsapp,
        configuracoesWhatsapp.token_dispositivo_api_whatsapp,
      )
    }
    throw new Error('Configurações de Whatsapp não encontradas.')
  }

  private getMensagemNotifciacaoResponsavel({
    variaveis,
    mensagem,
  }: AdequarMensagemProps) {
    const regexReplace = new RegExp(
      variaveis.map((variavel) => `\\${variavel.nome}`).join('|'),
      'gi',
    )

    return mensagem.replace(regexReplace, (variavel) => {
      const nomeVariavel = variavel.toLowerCase()
      const novaVariavel = variaveis.find(
        (v) => v.nome.toLowerCase() === nomeVariavel,
      )
      return novaVariavel?.novoValor ?? ''
    })
  }

  private async dispararNotificacao({
    numeroDestinatario,
    mensagem,
    idAluno,
    idResponsavel,
  }: DispararNotificacaoResponsavelProps) {
    const whatsapp = await this.getServicoWhatsapp()

    const responseDisparo = await whatsapp.enviarMensagem({
      numeroDestinatario,
      mensagem,
    })

    if (!responseDisparo.status) {
      throw new Error(`Erro ao disparar notificação: ${responseDisparo.msg}`)
    }

    this.setNotificacaoDisparado({
      mensagem,
      idResponsavel,
      idAluno,
      enviadoEm: new Date(),
    })
  }

  private async getDestinatarios() {
    const reponsaveisAlunos = await this.getReponsaveisAlunos()

    return reponsaveisAlunos.map((reponsaveisAluno) => {
      return {
        idResponsavel: reponsaveisAluno.responsavel.id,
        idAluno: reponsaveisAluno.aluno.id,
        nomeAluno: reponsaveisAluno.aluno.nome,
        contatos: reponsaveisAluno.responsavel.TelefoneResponsavel.map(
          (contato) => `${contato.ddd}${contato.telefone}`,
        ),
      }
    })
  }

  async dispararNotificacaoAtividade({
    modeloMensagem,
    variaveis,
  }: NotificacaoAtividadesAlunoProps) {
    try {
      const destinatarios: Array<{
        idResponsavel: string
        idAluno: string
        nomeAluno: string
        contatos: string[]
      }> = await this.getDestinatarios()

      destinatarios.forEach((pessoa) => {
        const mensagem = this.getMensagemNotifciacaoResponsavel({
          variaveis: [
            {
              nome: '$notaAtividade',
              novoValor: String(variaveis.notaAtividade),
            },
            {
              nome: '$nomeDisciplina',
              novoValor: variaveis.nomeDisciplina,
            },
            {
              nome: '$descricaoAtividade',
              novoValor: variaveis.descricaoAtividade,
            },
            {
              nome: '$nomeAluno',
              novoValor: pessoa.nomeAluno,
            },
            {
              nome: '$realizadoEm',
              novoValor: variaveis.realizadoEm,
            },
          ],
          mensagem: modeloMensagem,
        })

        pessoa.contatos.forEach((contato) => {
          this.filaDisparosMensagens.push(
            this.dispararNotificacao({
              numeroDestinatario: contato,
              mensagem,
              idAluno: pessoa.idAluno,
              idResponsavel: pessoa.idResponsavel,
            }),
          )
        })
      })

      await Promise.all(this.filaDisparosMensagens)

      return {
        status: true,
        msg: 'Notificações disparadas com sucesso.',
      }
    } catch (err) {
      return {
        status: false,
        msg: `Erro ao disparar notificações: ${err}`,
      }
    } finally {
      await this.salvarNotificacoes()
    }
  }

  async dispararNotificacaoAusencia({
    modeloMensagem,
  }: NotificacaoAusenciaAlunoProps) {
    try {
      const destinatarios: Array<{
        idResponsavel: string
        idAluno: string
        nomeAluno: string
        contatos: string[]
      }> = await this.getDestinatarios()

      destinatarios.forEach((pessoa) => {
        const mensagem = this.getMensagemNotifciacaoResponsavel({
          variaveis: [
            {
              nome: '$nomeAluno',
              novoValor: pessoa.nomeAluno,
            },
          ],
          mensagem: modeloMensagem,
        })

        pessoa.contatos.forEach((contato) => {
          this.filaDisparosMensagens.push(
            this.dispararNotificacao({
              numeroDestinatario: contato,
              mensagem,
              idAluno: pessoa.idAluno,
              idResponsavel: pessoa.idResponsavel,
            }),
          )
        })
      })

      await Promise.all(this.filaDisparosMensagens)

      return {
        status: true,
        msg: 'Notificações disparadas com sucesso.',
      }
    } catch (err) {
      return {
        status: false,
        msg: `Erro ao disparar notificações: ${err}`,
      }
    } finally {
      await this.salvarNotificacoes()
    }
  }
}

export default MensageriaService
