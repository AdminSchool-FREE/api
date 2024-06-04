import { prisma } from "../libraries/PrismaClient"

export interface NovoAlunoProps{
  nome: string
  cpf: string,
  ra: string,
  rg: string,
  dataNascimento: Date,
  idTurma: string,
  nomeResponsavel: string,
  cpfResponsavel: string,
  telefones: Array<{
    ddd: string,
    telefone: string,
    whatsapp: boolean
  }>
}

export interface NovaNotificacaoProps{
  mensagem: string,
  idResponsavel: string,
  idAluno: string,
  enviadoEm: Date
}

export async function listarAlunosTurmaEscola(idEscola: string, idTurma: string){
  const alunos = await prisma.aluno.findMany({
    where: {
      turma: {
        id: idTurma,
        idEscola
      }
    }
  })

  return alunos
}


export async function matricularNovoAluno({nome, cpf, ra, rg, dataNascimento, idTurma, nomeResponsavel, cpfResponsavel, telefones}: NovoAlunoProps){
  const verificaExisteResponsavel = await prisma.responsavel.findUnique({
    where: {
      cpf: cpfResponsavel
    }
  })

  if(verificaExisteResponsavel){
    const aluno =await prisma.responsavelAluno.create({
      select: {
        aluno: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            ra: true,
            rg: true,
            dataNascimento: true,
            idTurma: true
          }
        }
      },
      data: {
        aluno: {
          create: {
            nome,
            cpf,
            ra,
            rg,
            dataNascimento,
            idTurma,
          },
        },
        responsavel: {
          connect: {
            id: verificaExisteResponsavel.id
          }
        }
      }
    })

    return aluno.aluno
  }
  else{
    const aluno = await prisma.responsavelAluno.create({
      select: {
        aluno: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            ra: true,
            rg: true,
            dataNascimento: true,
            idTurma: true
          }
        }
      },
      data: {
        aluno: {
          create: {
            nome,
            cpf,
            ra,
            rg,
            dataNascimento,
            idTurma,
          },
        },
        responsavel: {
          create: {
            nome: nomeResponsavel,
            cpf: cpfResponsavel,
            TelefoneResponsavel: {
              createMany: {
                data: telefones
              }
            }
          }
        }
      },
    })
  
    return aluno.aluno
  }
}

export async function salvarTransferenciaAlunoTurma(idAluno: string, idTurma: string){
  const aluno = await prisma.aluno.update({
    select: {
      id: true,
      nome: true,
      cpf: true,
      ra: true,
      rg: true,
      idTurma: true,
      dataNascimento: true,
    },
    where: {
      id: idAluno,
    },
    data: {
      idTurma
    }
  })

  return aluno
}

export async function salvarTransferenciasAlunosTurma(idsAlunos: Array<string>, idTurma: string){
  const alunos = await prisma.aluno.updateMany({
    where: {
      id: {
        in: idsAlunos
      },
    },
    data: {
      idTurma
    }
  })

  return alunos
}

export async function excluirMatricula(idAluno: string, idEscola: string){

  const deletaRegistrosChamadaAluno = prisma.chamadaTurma.deleteMany({
    where: {
      idAluno
    }
  })

  const deletaNotificacoesResponsavelAluno = prisma.notificacaoResponsavelAluno.deleteMany({
    where: {
      idAluno,
    }
  })

  const deletaResponsavelAluno = prisma.responsavelAluno.deleteMany({
    where: {
      idAluno,
    }
  })

  const deletaAluno = prisma.aluno.delete({
    where: {
      id: idAluno,
      turma: {
        idEscola
      }
    }
  })

  return await prisma.$transaction([
    deletaRegistrosChamadaAluno,
    deletaNotificacoesResponsavelAluno,
    deletaResponsavelAluno,
    deletaAluno,
  ])
}

export async function buscarDadosResponsavelAluno(idAluno: string){
  const responsaveisAluno = await prisma.responsavelAluno.findMany({
    select: {
      aluno: {
        select: {
          id: true
        }
      },
      responsavel: {
        select: {
          id: true,
          nome: true,
          TelefoneResponsavel: {
            select: {
              ddd: true,
              telefone: true,
            }
          }
        }
      }
    },
    where: {
      idAluno,
      responsavel: {
        TelefoneResponsavel: {
          every: {
            whatsapp: true
          }
        }
      }
    }
  })

  return responsaveisAluno
}

export async function buscarResponsaveisAlunos(alunos: Array<string>){
  const responsaveisAlunos = await prisma.responsavelAluno.findMany({
    select: {
      aluno: {
        select: {
          id: true,
          nome: true,
        }
      },
      responsavel: {
        select: {
          id: true,
          nome: true,
          TelefoneResponsavel: {
            select: {
              ddd: true,
              telefone: true,
            }
          }
        }
      }
    },
    where: {
      idAluno: {
        in: alunos
      },
      responsavel: {
        TelefoneResponsavel: {
          every: {
            whatsapp: true
          }
        }
      }
    }
  })

  return responsaveisAlunos
}

export async function inserirNotificacoes(notificacoes: Array<NovaNotificacaoProps>){
  const notificacao = await prisma.notificacaoResponsavelAluno.createMany({
    data: notificacoes
  })

  return notificacao
}

export async function buscarNotificacoesReponsaveisAluno(idAluno: string){
  const listaNotificacoes = await prisma.notificacaoResponsavelAluno.findMany({
    select: {
      id: true,
      mensagem: true,
      enviadoEm: true
    },
    where: {
      idAluno
    },
    orderBy: {
      enviadoEm: 'asc'
    }
  })

  return listaNotificacoes
}