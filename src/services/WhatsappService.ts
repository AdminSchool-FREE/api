
import { ResponseLoginApiWhatsApp } from "../interfaces/WhatsAppInterface"
import AxiosClient from "../libraries/AxiosClient"

class WhatsappService {
  private tokenApi?: string
  private numeroWhatsapp?: string
  private urlApi?: string
  private tokenDevice?: string

  setTokenApi(tokenApi: string){
    this.tokenApi = tokenApi
  }

  setNumeroWhatsapp(numeroWhatsapp: string){
    this.numeroWhatsapp = numeroWhatsapp
  }

  setTokenDevice(tokenDevice: string){
    this.tokenDevice = tokenDevice
  }

  constructor(){
    this.urlApi = process.env.BASE_URL_API_WHATSAPP
  }

  async loginApiWhatsApp(email: string, password: string){
    
    if(!this.urlApi) return null

    const axiosClient = new AxiosClient(this.urlApi)

    const response = await axiosClient.getAxiosInstance().post<ResponseLoginApiWhatsApp>('login', {
      email,
      password
    })

    return response.data
  }

  async enviarMensagem(mensagem: string, numeroWhatsapp: string){
    if(!this.urlApi) return null

    const axiosClient = new AxiosClient(this.urlApi)

    const response = await axiosClient.getAxiosInstance().post(
      'whatsapp/sendText', 
      {
        number: numeroWhatsapp,
        text: mensagem,
        time_typing: 20000
      }, 
      {
        headers: {
          'Authorization': 'Bearer ' + this.tokenApi,
          'DeviceToken': this.tokenDevice
        }
      }
    )

    return response.data
  }

  async enviarMensagemComArquivo(mensagem: string, arquivoBase64: string){
    if(!this.urlApi) return null

    const axiosClient = new AxiosClient(this.urlApi)

    const response = await axiosClient.getAxiosInstance().post(
      '/whatsapp/sendFile64', 
      {
        number: this.numeroWhatsapp,
        caption: mensagem,
        path: arquivoBase64,
        time_typing: 20000 
      }, 
      {
        headers: {
          'Authorization': 'Bearer ' + this.tokenApi,
          'DeviceToken': this.tokenDevice
        }
      }
    )

    return response.data
  }
}

export default WhatsappService