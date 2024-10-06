/* eslint-disable camelcase */
import {
  ConfiguracaoServicoWhatsApp,
  ConfiguracaoServicoWhatsAppProps,
  EnvioMensagemAnexoProps,
  EnvioMensagemProps,
  LoginApiBrasilWhatsAppProps,
  ResponseEnvioMensagem,
  ResponseLoginApiWhatsApp,
  WhatsAppServiceInterface,
} from '../../interfaces/WhatsAppInterface'
import AxiosClient from '../../libraries/AxiosClient'
import {
  atualizarConfiguracoesApiWhatsapp,
  inserirConfiguracoesApiWhatsapp,
} from '../../repositories/EscolaRepository'

import WhatsappService from './WhatsappService'

class WhatsAppApiBrasil
  extends WhatsappService
  implements WhatsAppServiceInterface
{
  constructor(tokenDevice: string, tokenApi?: string) {
    const URL_SERVICO = process.env.BASE_URL_API_BRASIL_WHATSAPP

    if (!URL_SERVICO) throw new Error('Url do serviço não foi configurado')

    super(URL_SERVICO, tokenApi ?? '', tokenDevice)
  }

  private async loginApiWhatsApp({
    email,
    password,
  }: LoginApiBrasilWhatsAppProps) {
    const axiosClient = new AxiosClient(this.getUrlApi())

    const response = await axiosClient
      .getAxiosInstance()
      .post<ResponseLoginApiWhatsApp>('login', {
        email,
        password,
      })

    return response.data
  }

  async configurarServico({
    id,
    password,
    email,
    idEscola,
  }: ConfiguracaoServicoWhatsAppProps): Promise<ConfiguracaoServicoWhatsApp | null> {
    if (email && password) {
      const autenticaPlataformaWebService = await this.loginApiWhatsApp({
        email,
        password,
      })

      if (id) {
        return await atualizarConfiguracoesApiWhatsapp({
          id,
          email,
          password,
          token_dispositivo_api_whatsapp: this.getTokenDevice(),
          token_api_whatsapp: autenticaPlataformaWebService.authorization.token,
        })
      }
      return await inserirConfiguracoesApiWhatsapp({
        email,
        idEscola,
        password,
        token_dispositivo_api_whatsapp: this.getTokenDevice(),
        token_api_whatsapp: autenticaPlataformaWebService.authorization.token,
      })
    }

    return null
  }

  async enviarMensagem({
    numeroDestinatario,
    mensagem,
  }: EnvioMensagemProps): Promise<ResponseEnvioMensagem> {
    const response = await this.axiosClient
      .getAxiosInstance()
      .post(
        'whatsapp/sendText',
        {
          number: '55' + numeroDestinatario,
          text: mensagem,
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.getTokenApi(),
            DeviceToken: this.getTokenDevice(),
          },
        },
      )
      .then((response) => {
        return {
          status: true,
          msg: response.data.message,
          id: response.data.id,
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
  }: EnvioMensagemAnexoProps) {
    const response = await this.axiosClient
      .getAxiosInstance()
      .post(
        '/whatsapp/sendFile',
        {
          number: '55' + numeroDestinatario,
          path: arquivo,
          options: {
            caption: mensagem,
          },
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.getTokenApi(),
            DeviceToken: this.getTokenDevice(),
          },
        },
      )
      .then((response) => {
        return {
          status: true,
          msg: response.data.message,
          id: response.data.id,
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
}

export default WhatsAppApiBrasil
