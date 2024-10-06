import AxiosClient from '../../libraries/AxiosClient'

class WhatsappService {
  private tokenApi: string
  private urlApi: string
  private tokenDevice: string
  protected axiosClient: AxiosClient

  constructor(urlApi: string, tokenApi: string, tokenDevice: string) {
    this.urlApi = urlApi
    this.tokenApi = tokenApi
    this.tokenDevice = tokenDevice

    this.axiosClient = new AxiosClient(this.urlApi)
  }

  setTokenApi(tokenApi: string) {
    this.tokenApi = tokenApi
  }

  setTokenDevice(tokenDevice: string) {
    this.tokenDevice = tokenDevice
  }

  getTokenApi() {
    return this.tokenApi
  }

  getUrlApi() {
    return this.urlApi
  }

  getTokenDevice() {
    return this.tokenDevice
  }
}

export default WhatsappService
