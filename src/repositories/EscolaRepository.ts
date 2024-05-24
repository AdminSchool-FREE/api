import { InserirModeloMensagemProps, InserirUsuarioEscolaProps } from './../interfaces/EscolaInterface';
import { InserirEscolaProps } from "../interfaces/EscolaInterface";
import { prisma } from "../libraries/PrismaClient";
import { ConfiguracaoApiProps } from '../interfaces/WhatsAppInterface';

export async function buscarDadosEscola(idEscola: string){
  return await prisma.escola.findUnique({
    where: {
      id: idEscola
    },
  })
}

export async function inserirEscola({nomeEscola, emailUsuario, nomeUsuario, senhaUsuario}: InserirEscolaProps){
  return await prisma.escola.create({data: {
    nome: nomeEscola,
    Usuario: {
      create: {
        nome: nomeUsuario,
        email: emailUsuario,
        senha:  senhaUsuario,
        status: true
      }
    }
  }})
}

export async function removerModeloMensagem(idModelo: string){
  return await prisma.modeloMensagem.delete({
    where: {
      id: idModelo
    }
  })
}

export async function inserirModeloMensagem({
  assunto,
  modelo,
  idEscola
}: InserirModeloMensagemProps){
  return await prisma.modeloMensagem.create({data: {
    assunto,
    modelo,
    idEscola
  }})
}

export async function listarModelosMensagem(idEscola: string){
  return await prisma.modeloMensagem.findMany({
    select: {
      id: true,
      assunto: true,
      modelo: true
    },
    where: {
      idEscola
    },
    orderBy: {
      assunto: 'asc'
    }
  })
}

export async function inserirConfiguracoesApiWhatsapp({email, idEscola, password, token_api_whatsapp, token_dispositivo_api_whatsapp}:ConfiguracaoApiProps){
  if(idEscola){
    return await prisma.configuracoes.create({
      data: {
        login_api_whatsapp: email,
        idEscola,
        senha_api_whatsapp: password,
        token_api_whatsapp,
        token_dispositivo_api_whatsapp
      }
    })
  }

  return null
}

export async function atualizarConfiguracoesApiWhatsapp({id, email, password, token_api_whatsapp, token_dispositivo_api_whatsapp}:ConfiguracaoApiProps){
  return await prisma.configuracoes.update({
    where: {
      id
    },
    data: {
      login_api_whatsapp: email,
      senha_api_whatsapp: password,
      token_api_whatsapp,
      token_dispositivo_api_whatsapp
    }
  })
}

export async function buscarConfiguracoesApiWhatsapp(idEscola: string){
  return await prisma.configuracoes.findUnique({
    select: {
      id: true,
      login_api_whatsapp: true,
      token_api_whatsapp: true,
      token_dispositivo_api_whatsapp: true
    },
    where: {
      idEscola
    }
  })
}
