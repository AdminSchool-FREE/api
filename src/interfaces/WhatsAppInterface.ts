export interface LoginApiWhatsAppProps {
  email: string, 
  password: string,
}

export interface ConfiguracaoApiProps{
  id? : string,
  email: string,
  password: string,
  token_dispositivo_api_whatsapp: string,
  token_api_whatsapp: string
  idEscola?: string 
}

export type ResponseLoginApiWhatsApp = {
  authorization: {
    token: string 
    type: string
  }
}