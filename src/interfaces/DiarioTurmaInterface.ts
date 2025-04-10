export type NotaAtividadesAlunoType = {
  id?: string
  idAluno: string
  idDisciplina: string
  nota: number
  ano: string
  tipoPeriodo: 'mensal' | 'bimestral' | 'trimestral' | 'semestral'
  periodo: string
  descricao: string
  realizadoEm: Date
}

export interface AtualizaAtividadeAlunoProps {
  nota: {
    id: string
    idAluno: string
    idDisciplina: string
    nota: number
    ano: string
    tipoPeriodo: 'mensal' | 'bimestral' | 'trimestral' | 'semestral'
    periodo: string
    descricao: string
    realizadoEm: Date
  }
}

export interface NovaNotaAtividadeAlunosProps {
  notasAtividade: Array<NotaAtividadesAlunoType>
}

export interface FiltroNotaAtividadeProps {
  idEscola: string
  idTurma: string
  ano: string
  idDisciplina?: string
  periodo?: string
  tipoPeriodo?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral'
}

export interface NovoConteudoAulaTurmaProps {
  descricao: string
  realizadoEm: Date
  idTurma: string
  idDisciplina: string
}

export interface RemoverConteudoAulaTurmaProps {
  id: string
  escola: string
}

export interface FiltroConteudoAulaTurmaProps {
  idEscola: string
  idTurma: string
  periodo: {
    inicio: Date,
    fim: Date
  }
}