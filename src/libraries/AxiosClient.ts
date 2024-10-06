import axios, { AxiosInstance } from 'axios'

class AxiosClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  getAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export default AxiosClient
