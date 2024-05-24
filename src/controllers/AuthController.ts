import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  consultarUsuario,
  validarCredenciaisUsuario
} from "../repositories/UsuarioRepository";

class AuthController {

  async inciarSessao(app: FastifyInstance) {
    const bodyCredenciais = z.object({
      email: z.string().email(),
      senha: z.string().min(8)
    })

    app.post('/login', async (req, reply) => {
      const { email, senha } = await bodyCredenciais.parseAsync(req.body);

      const validaUsuario = await validarCredenciaisUsuario({
        email,
        senha
      })

      if (validaUsuario) {
        reply.status(202)
          .setCookie('session-user', validaUsuario?.id, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 1,
            sameSite: 'lax',
            path: '/',
          })
          .setCookie('session-company', validaUsuario.idEscola, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 1,
            sameSite: 'lax',
            path: '/',
          })
          .send({
            status: true,
            mensagem: 'Usuário logado com sucesso'
          })
      }
      else {
        reply.status(401).send({
          status: false,
          mensagem: 'Credenciais inválidas ou usuário desativado!'
        })
      }
    })
  }

  async buscarDadosUsuario(app: FastifyInstance) {
    app.get('/usuario', async (req, res) => {
      const cookiesSession = req.cookies

      if (cookiesSession['session-user']) {
        const dadosUsuario = await consultarUsuario(cookiesSession['session-user'])

        res.status(200).send(dadosUsuario)
      }
      else {
        res.status(401).send({
          mensagem: 'Usuário não logado'
        })
      }

    })
  }
}

export default AuthController