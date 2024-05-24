import { InserirUsuarioEscolaProps } from "../interfaces/EscolaInterface";
import { ValidarCredenciaisUsuarioProps } from "../interfaces/UsuarioInterface";
import { prisma } from "../libraries/PrismaClient";
import { validarSenhaCriptografada } from "../utils/Bcrypt";

export async function validarCredenciaisUsuario({email, senha}: ValidarCredenciaisUsuarioProps){
  const usuario = await prisma.usuario.findUnique({
    where: {
      email,
      status: true
    }
  })

  if(usuario){
    await validarSenhaCriptografada(senha, usuario?.senha)

    return usuario
  }

  return null
  
}

export async function inserirUsuarioEscola({
  nome,
  email,
  senha,
  status,
  idEscola
}:InserirUsuarioEscolaProps){
  return await prisma.usuario.create({data: {
    nome,
    email,
    senha,
    status,
    idEscola
  }})
}

export async function listarUsuariosEscola(idEscola:string){
  return await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      status: true
    },
    where: {
      idEscola
    }
  })
}

export async function consultarUsuario(idUsuario:string){
  return await prisma.usuario.findUnique({
    select: {
      nome: true,
      email: true,
    },
    where: {
      id: idUsuario
    }
  })
}

export async function modificarStatus(idUsuario: string, idEscola: string, status: boolean){
  return await prisma.usuario.update({
    select: {
      id: true,
      nome: true,
      email: true,
      status: true
    },
    where: {
      id: idUsuario
    },
    data: {
      status
    }
  })
}