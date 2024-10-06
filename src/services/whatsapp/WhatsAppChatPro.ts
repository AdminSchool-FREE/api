/* eslint-disable camelcase */
import {
  ConfiguracaoServicoWhatsApp,
  ConfiguracaoServicoWhatsAppProps,
  EnvioMensagemAnexoProps,
  EnvioMensagemProps,
  ResponseEnvioMensagem,
  WhatsAppServiceInterface,
} from '../../interfaces/WhatsAppInterface'
import {
  atualizarConfiguracoesApiWhatsapp,
  inserirConfiguracoesApiWhatsapp,
} from '../../repositories/EscolaRepository'

import WhatsappService from './WhatsappService'

class WhatsAppChatPro
  extends WhatsappService
  implements WhatsAppServiceInterface
{
  constructor(tokenApi: string, tokenDevice: string) {
    const URL_SERVICO = process.env.BASE_URL_API_CHATPRO_WHATSAPP

    if (!URL_SERVICO) throw new Error('Url do serviço não foi configurado')

    super(URL_SERVICO, tokenApi, tokenDevice)
  }

  async enviarMensagem({
    numeroDestinatario,
    mensagem,
  }: EnvioMensagemProps): Promise<ResponseEnvioMensagem> {
    const response = await this.axiosClient
      .getAxiosInstance()
      .post(
        `${this.getTokenDevice()}/api/v1/send_message`,
        {
          number: numeroDestinatario,
          message: mensagem,
        },
        {
          headers: {
            accept: 'application/json',
            Authorization: `${this.getTokenApi()}`,
          },
        },
      )
      .then((response) => {
        return {
          status: response.data.status,
          msg: response.data.message,
          id: response.data.resposeMessage.id,
        }
      })
      .catch((error) => {
        console.error(error)

        return {
          status: false,
          msg: error?.response.data.message,
        }
      })

    return response
  }

  async enviarAnexoMensagem({
    numeroDestinatario,
    mensagem,
    arquivo,
  }: EnvioMensagemAnexoProps): Promise<ResponseEnvioMensagem> {
    const response = await this.axiosClient
      .getAxiosInstance()
      .post(
        `${this.getTokenDevice()}/api/v1/send_message_file_from_url`,
        {
          number: numeroDestinatario,
          url: arquivo,
          caption: mensagem,
        },
        {
          headers: {
            accept: 'application/json',
            Authorization: `${this.getTokenApi()}`,
          },
        },
      )
      .then((response) => {
        return {
          status: response.data.status,
          msg: response.data.message,
          id: response.data.resposeMessage.id,
        }
      })
      .catch((error) => {
        console.error(error)

        return {
          status: false,
          msg: error?.response.data.message,
        }
      })

    return response
  }

  async configurarServico({
    id,
    password,
    email,
    idEscola,
  }: ConfiguracaoServicoWhatsAppProps): Promise<ConfiguracaoServicoWhatsApp | null> {
    if (email && password) {
      if (id) {
        return await atualizarConfiguracoesApiWhatsapp({
          id,
          email,
          password: this.getTokenApi(),
          token_dispositivo_api_whatsapp: this.getTokenDevice(),
          token_api_whatsapp: this.getTokenApi(),
          idEscola,
        })
      }
      return await inserirConfiguracoesApiWhatsapp({
        email,
        idEscola,
        password: this.getTokenApi(),
        token_dispositivo_api_whatsapp: this.getTokenDevice(),
        token_api_whatsapp: this.getTokenApi(),
      })
    }

    return null
  }
}

export default WhatsAppChatPro
