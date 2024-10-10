/* eslint-disable camelcase */
import {
  InserirDisciplinaEscolaProps,
  InserirEscolaProps,
  RemoverDisciplinaEscolaProps,
} from '../interfaces/EscolaInterface'
import { ConfiguracaoApiProps } from '../interfaces/WhatsAppInterface'
import { prisma } from '../libraries/PrismaClient'

import { InserirModeloMensagemProps } from './../interfaces/EscolaInterface'

export async function buscarDadosEscola(idEscola: string) {
  return await prisma.escola.findUnique({
    where: {
      id: idEscola,
    },
  })
}

export async function inserirEscola({
  nomeEscola,
  emailUsuario,
  nomeUsuario,
  senhaUsuario,
}: InserirEscolaProps) {
  return await prisma.escola.create({
    data: {
      nome: nomeEscola,
      Usuario: {
        create: {
          nome: nomeUsuario,
          email: emailUsuario,
          senha: senhaUsuario,
          status: true,
        },
      },
    },
  })
}

export async function removerModeloMensagem(idModelo: string) {
  return await prisma.modeloMensagem.delete({
    where: {
      id: idModelo,
    },
  })
}

export async function inserirModeloMensagem({
  assunto,
  modelo,
  idEscola,
}: InserirModeloMensagemProps) {
  return await prisma.modeloMensagem.create({
    data: {
      assunto,
      modelo,
      idEscola,
    },
  })
}

export async function listarModelosMensagem(idEscola: string) {
  return await prisma.modeloMensagem.findMany({
    select: {
      id: true,
      assunto: true,
      modelo: true,
    },
    where: {
      idEscola,
    },
    orderBy: {
      assunto: 'asc',
    },
  })
}

export async function inserirConfiguracoesApiWhatsapp({
  email,
  idEscola,
  password,
  token_api_whatsapp,
  token_dispositivo_api_whatsapp,
}: ConfiguracaoApiProps) {
  if (idEscola) {
    return await prisma.configuracoes.create({
      data: {
        login_api_whatsapp: email,
        idEscola,
        senha_api_whatsapp: password,
        token_api_whatsapp,
        token_dispositivo_api_whatsapp,
      },
    })
  }

  return null
}

export async function atualizarConfiguracoesApiWhatsapp({
  id,
  email,
  password,
  token_api_whatsapp,
  token_dispositivo_api_whatsapp,
}: ConfiguracaoApiProps) {
  return await prisma.configuracoes.update({
    where: {
      id,
    },
    data: {
      login_api_whatsapp: email,
      senha_api_whatsapp: password,
      token_api_whatsapp,
      token_dispositivo_api_whatsapp,
    },
  })
}

export async function buscarConfiguracoesApiWhatsapp(idEscola: string) {
  return await prisma.configuracoes.findUnique({
    select: {
      id: true,
      login_api_whatsapp: true,
      token_api_whatsapp: true,
      token_dispositivo_api_whatsapp: true,
    },
    where: {
      idEscola,
    },
  })
}

export async function inserirDisciplina({
  idEscola,
  nome,
}: InserirDisciplinaEscolaProps) {
  return await prisma.disciplina.create({
    select: {
      id: true,
      nome: true,
    },
    data: {
      nome,
      idEscola,
    },
  })
}

export async function buscarDisciplinasEscola(idEscola: string) {
  return await prisma.disciplina.findMany({
    select: {
      id: true,
      nome: true,
    },
    where: {
      idEscola,
    },
  })
}

export async function excluirDisciplina({
  idDisciplina,
  idEscola,
}: RemoverDisciplinaEscolaProps) {
  return await prisma.disciplina.delete({
    select: {
      id: true,
      nome: true,
    },
    where: {
      id: idDisciplina,
      idEscola,
    },
  })
}

export async function buscarNomeDisciplina({
  idDisciplina,
  idEscola,
}: RemoverDisciplinaEscolaProps) {
  return await prisma.disciplina.findUniqueOrThrow({
    where: {
      id: idDisciplina,
      idEscola,
    },
    select: {
      nome: true,
    },
  })
}
