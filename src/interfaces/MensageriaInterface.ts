export interface NotificacaoAtividadesAlunoProps {
  modeloMensagem: string
  variaveis: {
    notaAtividade: number
    nomeDisciplina: string
    descricaoAtividade: string
    realizadoEm: string
  }
}

export interface NotificacaoAusenciaAlunoProps {
  modeloMensagem: string
}

export interface AdequarMensagemProps {
  variaveis: Array<{
    nome: string
    novoValor: string
  }>
  mensagem: string
}

export interface DispararNotificacaoResponsavelProps {
  numeroDestinatario: string
  mensagem: string
  idResponsavel: string
  idAluno: string
}
