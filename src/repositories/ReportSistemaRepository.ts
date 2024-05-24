import { prisma } from "../libraries/PrismaClient";

interface InserirReportBugProps {
  problema: string,
  imagem?: string,
  idEscola: string,
}

export async function inserirBug({problema, imagem, idEscola}: InserirReportBugProps){
  return await prisma.reportSistema.create({
    data: {
      problema,
      imagem,
      idEscola
    }
  })
}