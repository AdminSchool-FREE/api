export interface NovaNotaAtividadeAlunosProps {
  notasAtividade: Array<{
    idAluno: string
    idDisciplina: string
    nota: number
    ano: string
    tipoPeriodo: 'mensal' | 'bimestral' | 'trimestral' | 'semestral'
    periodo: string
    descricao: string
  }>
}

export interface FiltroNotaAtividadeProps {
  idEscola: string
  idTurma: string
  ano: string
  idDisciplina?: string
  periodo?: string
  tipoPeriodo?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral'
}
