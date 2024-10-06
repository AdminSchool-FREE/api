export interface LoginApiWhatsAppProps {
  email: string
  password: string
}

export interface ConfiguracaoApiProps {
  id?: string
  email: string
  password: string
  token_dispositivo_api_whatsapp: string
  token_api_whatsapp?: string
  idEscola?: string
}

export interface ConfiguracaoServicoWhatsAppProps {
  id?: string
  email?: string
  password?: string
  idEscola?: string
}

export interface EnvioMensagemProps {
  numeroDestinatario: string
  mensagem: string
}

export interface EnvioMensagemAnexoProps {
  numeroDestinatario: string
  mensagem: string
  arquivo: string
}

export type ResponseLoginApiWhatsApp = {
  authorization: {
    token: string
    type: string
  }
}

export type ResponseEnvioMensagem = {
  status: boolean
  msg: string
  id?: string
}

export type ConfiguracaoServicoWhatsApp = {
  id?: string
  login_api_whatsapp: string | null
  senha_api_whatsapp: string | null
  token_dispositivo_api_whatsapp: string | null
  token_api_whatsapp: string | null
  idEscola: string
}

export interface WhatsAppServiceInterface {
  configurarServico({
    id,
    password,
    email,
    idEscola,
  }: ConfiguracaoServicoWhatsAppProps): Promise<ConfiguracaoServicoWhatsApp | null>

  enviarMensagem({
    numeroDestinatario,
    mensagem,
  }: EnvioMensagemProps): Promise<ResponseEnvioMensagem>

  enviarAnexoMensagem({
    numeroDestinatario,
    mensagem,
    arquivo,
  }: EnvioMensagemAnexoProps): Promise<ResponseEnvioMensagem>
}

export interface LoginApiBrasilWhatsAppProps {
  email: string
  password: string
}
