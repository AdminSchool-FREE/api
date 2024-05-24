
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { atualizarConfiguracoesApiWhatsapp, buscarConfiguracoesApiWhatsapp, inserirConfiguracoesApiWhatsapp, inserirEscola, inserirModeloMensagem, listarModelosMensagem, removerModeloMensagem } from '../repositories/EscolaRepository';
import { criptografarSenha } from '../utils/Bcrypt';
import { inserirUsuarioEscola, listarUsuariosEscola, modificarStatus } from "../repositories/UsuarioRepository";
import WhatsappService from "../services/WhatsappService";

class EscolaController {

  async criarEscola(app: FastifyInstance) {
    const bodyEscola = z.object({
      nomeEscola: z.string(),
      nomeUsuario: z.string(),
      emailUsuario: z.string().email(),
      senhaUsuario: z.string().min(8),
    })

    app.post('/', async (req, res) => {
      const { 
        nomeEscola, 
        nomeUsuario,
        emailUsuario,
        senhaUsuario, 
      } = await bodyEscola.parseAsync(req.body)

      const criaEscola = await inserirEscola({ 
        nomeEscola, 
        emailUsuario, 
        senhaUsuario: criptografarSenha(senhaUsuario), 
        nomeUsuario 
      })

      res.status(201).send(criaEscola)
    })
  }

  async adicionarUsuarioEscola(app: FastifyInstance) {
    const bodyUsuarioEscola = z.object({
      nome: z.string(),
      email: z.string().email(),
      senha: z.string().min(8),
    })

    app.post('/usuario', async (req, res) => {
      const {
        nome,
        email,
        senha,
      } = await bodyUsuarioEscola.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola){

        const criaUsuarioEscola = await inserirUsuarioEscola({
          nome,
          email,
          senha: criptografarSenha(senha),
          status: true,
          idEscola
        })

        res.status(201).send(criaUsuarioEscola)
      } else {
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async listarUsuariosEscola(app: FastifyInstance) {
    app.get('/usuario', async (req, res) => {

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola){

        const usuariosEscola = await listarUsuariosEscola(idEscola)

        res.status(200).send(usuariosEscola)
      }
      else{
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async alterarStatusUsuario(app: FastifyInstance){
    const paramsUsuario = z.object({
      id: z.string().uuid()
    })

    const bodyStatusUsuario = z.object({
      status: z.boolean()
    })

    app.patch('/usuario/:id', async (req, res) => {
      const { id } = await paramsUsuario.parseAsync(req.params)
      const { status } = await bodyStatusUsuario.parseAsync(req.body)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola){

        const alterarStatusUsuario = await modificarStatus(id, idEscola, status)

        res.status(200).send(alterarStatusUsuario)
      }
      else{
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async criarModeloMensagem(app: FastifyInstance) {

    const bodyModeloMensagem = z.object({
      assunto: z.string(),
      modelo: z.string(),
    })

    app.post('/modelo', async (req, res) => {

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola){

        const { assunto, modelo } = await bodyModeloMensagem.parseAsync(req.body)

        const criaModeloMensagem = await inserirModeloMensagem({ assunto, modelo, idEscola })

        res.status(201).send(criaModeloMensagem)
      }
      else{
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async removerModeloMensagem(app: FastifyInstance) {
    const paramsModeloMensagem = z.object({
      id: z.string().uuid()
    })

    app.delete('/modelo/:id', async (req, res) => {
      const { id } = await paramsModeloMensagem.parseAsync(req.params)

      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola){
        await removerModeloMensagem(id)

        res.status(204).send()
      }
      else{
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async listarModelosMensagemEscola(app: FastifyInstance) {
    
    app.get('/modelo', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola){
        const modelosMensagem = await listarModelosMensagem(idEscola)

        res.status(200).send(modelosMensagem)
      }
      else{
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }

  async configurarApiWhatsApp(app: FastifyInstance) {
    const bodyConfiguracaoApi = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      token_dispositivo_api_whatsapp: z.string()
    })

    const searchParams = z.object({
      id: z.string().uuid().optional()
    })

    const whatsappService = new WhatsappService()

    app.post('/configuracoes/whatsapp', async (req, res) => {
      const {
        email,
        password,
        token_dispositivo_api_whatsapp
      } = await bodyConfiguracaoApi.parseAsync(req.body)

      const { id } = await searchParams.parseAsync(req.query)
      const autenticaApiWhatsapp = await whatsappService.loginApiWhatsApp(email, password)

      if (!id) {
        const cookieSession = req.cookies
        const idEscola = cookieSession['session-company']

        if (autenticaApiWhatsapp && idEscola) {

          const criaConfiguracaoApi = await inserirConfiguracoesApiWhatsapp({
            email,
            idEscola,
            password,
            token_dispositivo_api_whatsapp,
            token_api_whatsapp: autenticaApiWhatsapp.authorization.token
          })

          res.status(201).send(criaConfiguracaoApi)
        }
        else {
          res.status(401).send({
            mensagem: 'Usuário não logado'
          })
        }
      }
      else {
        if (autenticaApiWhatsapp) {

          const atualizaConfiguracaoApi = await atualizarConfiguracoesApiWhatsapp({
            id,
            email,
            password,
            token_dispositivo_api_whatsapp,
            token_api_whatsapp: autenticaApiWhatsapp.authorization.token
          })

          res.status(200).send(atualizaConfiguracaoApi)
        }
      }
    })
  }

  async buscarConfiguracoesApiWhatsapp(app: FastifyInstance) {
    app.get('/configuracoes/whatsapp', async (req, res) => {
      const cookieSession = req.cookies
      const idEscola = cookieSession['session-company']

      if (idEscola) {
        const configuracoesApiWhatsapp = await buscarConfiguracoesApiWhatsapp(idEscola)

        res.status(200).send(configuracoesApiWhatsapp)
      }
      else {
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }
    })
  }
}

export default EscolaController