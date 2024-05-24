import { FastifyInstance } from "fastify"
import { z } from "zod"
import { buscarConfiguracoesApiWhatsapp, buscarDadosEscola } from "../repositories/EscolaRepository"
import { inserirBug } from "../repositories/ReportSistemaRepository"
import WhatsappService from "../services/WhatsappService"

class ReportBugController {

  async reportarBug(app: FastifyInstance) {
    const schemaBodyReport = z.object({
      problema: z.string(),
      imagem: z.string().optional()
    })

    app.post('/', async (req, res) => {
      const {
        problema,
        imagem
      } = await schemaBodyReport.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const configuracoesEscola = await buscarConfiguracoesApiWhatsapp(idEscola)
        const telefoneWhatsapp = process.env.WHATSAPP_REPORT ?? null

        if (telefoneWhatsapp && configuracoesEscola) {
          if (configuracoesEscola?.token_api_whatsapp && configuracoesEscola?.token_dispositivo_api_whatsapp) {

            const servicoWhatsapp = new WhatsappService()

            servicoWhatsapp.setNumeroWhatsapp(telefoneWhatsapp)
            servicoWhatsapp.setTokenApi(configuracoesEscola?.token_api_whatsapp)
            servicoWhatsapp.setTokenDevice(configuracoesEscola?.token_dispositivo_api_whatsapp)

            const dadosEscola = await buscarDadosEscola(idEscola)

            if (dadosEscola) {
              const mensagemProblema = `${dadosEscola.nome}\n` + problema
              const reportBug = await inserirBug({
                problema: mensagemProblema,
                imagem,
                idEscola
              })

              if (reportBug.imagem) {
                try{
                  await servicoWhatsapp.enviarMensagemComArquivo(
                    reportBug.problema,
                    reportBug.imagem
                  )
  
                  res.status(201).send({
                    message: 'Bug reportado com sucesso'
                  })
                }
                catch(error){
                  res.status(500).send({
                    message: 'Houve um problema ao reportar o bug',
                    error: error
                  })
                }
              } 
              else {
                try{
                  await servicoWhatsapp.enviarMensagem(reportBug.problema, telefoneWhatsapp)
                  
                  res.status(201).send({
                    message: 'Bug reportado com sucesso'
                  })
                }
                catch(error){
                  res.status(500).send({
                    message: 'Houve um problema ao reportar o bug',
                    error: error
                  })
              }
              }
            }
            else{
              res.status(401).send({
                mensagem: 'Escola não encontrado'
              })
            }
          }
          else {
            res.status(400).send({
              message: 'Houve um problema ao reportar o bug'
            })
          }
        }
        else {
          res.status(400).send({
            message: 'Houve um problema ao reportar o bug'
          })
        }
      }
      else{
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }
}

export default ReportBugController