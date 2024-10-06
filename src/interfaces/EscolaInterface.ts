export interface InserirEscolaProps {
  nomeEscola: string
  nomeUsuario: string
  emailUsuario: string
  senhaUsuario: string
}

export interface InserirUsuarioEscolaProps {
  nome: string
  email: string
  senha: string
  status: boolean
  idEscola: string
}

export interface InserirModeloMensagemProps {
  assunto: string
  modelo: string
  idEscola: string
}

export interface InserirDisciplinaEscolaProps {
  idEscola: string
  nome: string
}

export interface RemoverDisciplinaEscolaProps {
  idEscola: string
  idDisciplina: string
}
