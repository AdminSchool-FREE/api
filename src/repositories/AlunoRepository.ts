import { prisma } from '../libraries/PrismaClient'

export interface NovoAlunoProps {
  nome: string
  cpf: string
  ra: string
  rg: string
  dataNascimento: Date
  idTurma: string
  nomeResponsavel: string
  cpfResponsavel: string
  telefones: Array<{
    ddd: string
    telefone: string
    whatsapp: boolean
  }>
}

export interface NovaNotificacaoProps {
  mensagem: string
  idResponsavel: string
  idAluno: string
  enviadoEm: Date
}

export interface EdicaoMatriculaAlunoProps {
  id: string
  nome: string
  cpf: string
  ra: string
  rg: string
  dataNascimento: Date
  idEscola: string
}

export interface ResponsavelAlunoProps {
  id?: string
  idAluno?: string
  idEscola: string
  nome: string
  cpf: string
  telefones: Array<{
    ddd: string
    telefone: string
    whatsapp: boolean
  }>
}

interface AdicionarNovosTelefonesProps {
  idResponsavel: string
  telefones: Array<{
    ddd: string
    telefone: string
    whatsapp: boolean
  }>
}

export async function listarAlunosTurmaEscola(
  idEscola: string,
  idTurma: string,
) {
  const alunos = await prisma.aluno.findMany({
    where: {
      turma: {
        id: idTurma,
        idEscola,
      },
    },
  })

  return alunos
}

export async function matricularNovoAluno({
  nome,
  cpf,
  ra,
  rg,
  dataNascimento,
  idTurma,
  nomeResponsavel,
  cpfResponsavel,
  telefones,
}: NovoAlunoProps) {
  const verificaExisteResponsavel = await prisma.responsavel.findUnique({
    where: {
      cpf: cpfResponsavel,
    },
  })

  if (verificaExisteResponsavel) {
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
            idTurma: true,
          },
        },
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
            id: verificaExisteResponsavel.id,
          },
        },
      },
    })

    return aluno.aluno
  }
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
          idTurma: true,
        },
      },
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
              data: telefones,
            },
          },
        },
      },
    },
  })

  return aluno.aluno
}

export async function salvarTransferenciaAlunoTurma(
  idAluno: string,
  idTurma: string,
) {
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
      idTurma,
    },
  })

  return aluno
}

export async function salvarTransferenciasAlunosTurma(
  idsAlunos: Array<string>,
  idTurma: string,
) {
  const alunos = await prisma.aluno.updateMany({
    where: {
      id: {
        in: idsAlunos,
      },
    },
    data: {
      idTurma,
    },
  })

  return alunos
}

export async function excluirMatricula(idAluno: string, idEscola: string) {
  const deletaRegistrosChamadaAluno = prisma.chamadaTurma.deleteMany({
    where: {
      idAluno,
    },
  })

  const deletaNotificacoesResponsavelAluno =
    prisma.notificacaoResponsavelAluno.deleteMany({
      where: {
        idAluno,
      },
    })

  const deletaResponsavelAluno = prisma.responsavelAluno.deleteMany({
    where: {
      idAluno,
    },
  })

  const deletaAluno = prisma.aluno.delete({
    where: {
      id: idAluno,
      turma: {
        idEscola,
      },
    },
  })

  return await prisma.$transaction([
    deletaRegistrosChamadaAluno,
    deletaNotificacoesResponsavelAluno,
    deletaResponsavelAluno,
    deletaAluno,
  ])
}

export async function buscarDadosResponsavelAluno(idAluno: string) {
  const responsaveisAluno = await prisma.responsavelAluno.findMany({
    select: {
      aluno: {
        select: {
          id: true,
        },
      },
      responsavel: {
        select: {
          id: true,
          nome: true,
          TelefoneResponsavel: {
            select: {
              ddd: true,
              telefone: true,
            },
          },
        },
      },
    },
    where: {
      idAluno,
      responsavel: {
        TelefoneResponsavel: {
          every: {
            whatsapp: true,
          },
        },
      },
    },
  })

  return responsaveisAluno
}

export async function buscarResponsaveisAlunos(alunos: Array<string>) {
  const responsaveisAlunos = await prisma.responsavelAluno.findMany({
    select: {
      aluno: {
        select: {
          id: true,
          nome: true,
        },
      },
      responsavel: {
        select: {
          id: true,
          nome: true,
          TelefoneResponsavel: {
            select: {
              ddd: true,
              telefone: true,
            },
          },
        },
      },
    },
    where: {
      idAluno: {
        in: alunos,
      },
      aluno: {
        notificacaoBloqueado: false,
      },
      responsavel: {
        TelefoneResponsavel: {
          every: {
            whatsapp: true,
          },
        },
      },
    },
  })

  return responsaveisAlunos
}

export async function inserirNotificacoes(
  notificacoes: Array<NovaNotificacaoProps>,
) {
  const notificacao = await prisma.notificacaoResponsavelAluno.createMany({
    data: notificacoes,
  })

  return notificacao
}

export async function buscarNotificacoesReponsaveisAluno(idAluno: string) {
  const listaNotificacoes = await prisma.notificacaoResponsavelAluno.findMany({
    select: {
      id: true,
      mensagem: true,
      enviadoEm: true,
    },
    where: {
      idAluno,
    },
    orderBy: {
      enviadoEm: 'asc',
    },
  })

  return listaNotificacoes
}

export async function buscarDadosAluno(idAluno: string, idEscola: string) {
  return await prisma.aluno.findUniqueOrThrow({
    select: {
      id: true,
      nome: true,
      cpf: true,
      ra: true,
      rg: true,
      notificacaoBloqueado: true,
      dataNascimento: true,
      ResponsavelAluno: {
        select: {
          responsavel: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              TelefoneResponsavel: {
                select: {
                  id: true,
                  ddd: true,
                  telefone: true,
                  whatsapp: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      id: idAluno,
      turma: {
        idEscola,
      },
    },
  })
}

export async function consultaResponsavelPorDocumento(cpf: string) {
  return await prisma.responsavel.findUnique({
    select: {
      id: true,
      nome: true,
      cpf: true,
    },
    where: {
      cpf,
    },
  })
}

export async function alterarBloqueioNotificacaoAluno(
  idAluno: string,
  statusBloqueio: boolean,
  idEscola: string,
) {
  return await prisma.aluno.update({
    where: {
      id: idAluno,
      turma: {
        idEscola,
      },
    },
    data: {
      notificacaoBloqueado: statusBloqueio,
    },
  })
}

export async function removerContatoResponsavel(
  idContato: string,
  idResponsavel: string,
) {
  return await prisma.telefoneResponsavel.delete({
    where: {
      id: idContato,
      responsavel: {
        id: idResponsavel,
      },
    },
  })
}

export async function salvarEdicaoMatriculaAluno({
  id,
  cpf,
  dataNascimento,
  idEscola,
  nome,
  ra,
  rg,
}: EdicaoMatriculaAlunoProps) {
  return await prisma.aluno.update({
    where: {
      id,
      turma: {
        idEscola,
      },
    },
    data: {
      cpf,
      dataNascimento,
      nome,
      ra,
      rg,
    },
  })
}

export async function salvarEdicaoDadosResponsavel({
  id,
  idEscola,
  nome,
  cpf,
}: ResponsavelAlunoProps) {
  const responsavel = await prisma.responsavel.update({
    where: {
      id,
      ResponsavelAluno: {
        every: {
          aluno: {
            turma: {
              idEscola,
            },
          },
        },
      },
    },
    data: {
      nome,
      cpf,
    },
  })

  return responsavel
}

export async function salvarNovoResponsavelAluno({
  idAluno,
  nome,
  cpf,
}: ResponsavelAlunoProps) {
  if (idAluno) {
    console.log(idAluno)
    return await prisma.responsavelAluno.create({
      select: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            cpf: true,
          },
        },
      },
      data: {
        responsavel: {
          create: {
            nome,
            cpf,
          },
        },
        aluno: {
          connect: {
            id: idAluno,
          },
        },
      },
    })
  }
  return null
}

export async function vincularResponsavelAluno({
  id,
  idAluno,
  idEscola,
}: ResponsavelAlunoProps) {
  if (idAluno && id) {
    const vinculoResponsavelAluno = prisma.responsavelAluno.create({
      data: {
        idAluno,
        idResponsavel: id,
      },
    })

    await prisma.$transaction([vinculoResponsavelAluno])

    return prisma.responsavelAluno.findMany({
      select: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            TelefoneResponsavel: {
              select: {
                id: true,
                ddd: true,
                telefone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
      where: {
        aluno: {
          id: idAluno,
          turma: {
            idEscola,
          },
        },
      },
    })
  }
}

export async function removerVinculoResponsavelAluno(
  idResponsavel: string,
  idAluno: string,
) {
  return await prisma.responsavelAluno.delete({
    where: {
      idAluno_idResponsavel: {
        idAluno,
        idResponsavel,
      },
    },
  })
}

export async function salvarNovosTelefones({
  idResponsavel,
  telefones,
}: AdicionarNovosTelefonesProps) {
  await prisma.telefoneResponsavel.createMany({
    data: telefones.map((telefone) => ({
      idResponsavel,
      ddd: telefone.ddd,
      telefone: telefone.telefone,
      whatsapp: telefone.whatsapp,
    })),
  })

  return await prisma.telefoneResponsavel.findMany({
    select: {
      id: true,
      ddd: true,
      telefone: true,
      whatsapp: true,
    },
    where: {
      responsavel: {
        id: idResponsavel,
      },
    },
  })
}

export async function alterarPermissaoNotificacaoTelefoneResponsavel(
  idContato: string,
  idResponsavel: string,
  status: boolean,
) {
  return await prisma.telefoneResponsavel.update({
    where: {
      id: idContato,
      responsavel: {
        id: idResponsavel,
      },
    },
    data: {
      whatsapp: status,
    },
  })
}
