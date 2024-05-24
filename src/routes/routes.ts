import { FastifyInstance } from "fastify";
import EscolaController from "../controllers/EscolaController";
import MensagemController from "../controllers/MensagemController";
import AuthController from "../controllers/AuthController";
import TurmaController from "../controllers/TurmaController";
import ReportBugController from "../controllers/ReportController";

export const routesEscola = (server: FastifyInstance) => {
  const escolaController = new EscolaController()

  server.register(escolaController.criarEscola, {
    prefix: 'escola'
  })

  server.register(escolaController.adicionarUsuarioEscola, {
    prefix: 'escola'
  })

  server.register(escolaController.listarUsuariosEscola, {
    prefix: 'escola'
  })

  server.register(escolaController.alterarStatusUsuario, {
    prefix: 'escola'
  })

  server.register(escolaController.criarModeloMensagem, {
    prefix: 'escola'
  })

  server.register(escolaController.listarModelosMensagemEscola, {
    prefix: 'escola'
  })

  server.register(escolaController.removerModeloMensagem, {
    prefix: 'escola'
  })

  server.register(escolaController.buscarConfiguracoesApiWhatsapp,{
    prefix: 'escola'
  })

  server.register(escolaController.configurarApiWhatsApp, {
    prefix: 'escola'
  })
}

export const routesMensagemWhatsApp = (server: FastifyInstance) => {
  const mensagemController = new MensagemController()

  server.register(mensagemController.enviarMensagemResponsavelAluno, {
    prefix: 'mensagem/whatsapp'
  })

  server.register(mensagemController.buscarMensagensAluno,{
    prefix:'mensagem/whatsapp'
  })
}

export const routesReportBug = (server: FastifyInstance) => {
  const reportController = new ReportBugController()

  server.register(reportController.reportarBug, {
    prefix: 'reportar'
  })
}

export const routesAuth = (server: FastifyInstance) => {
  const authController = new AuthController()

  server.register(authController.inciarSessao, {
    prefix: 'auth'
  })

  server.register(authController.buscarDadosUsuario, {
    prefix: 'auth'
  })
}

export const routesTurma = (server: FastifyInstance) => {
  const turmaController = new TurmaController()

  server.register(turmaController.criarTurma, {
    prefix: 'turma'
  })

  server.register(turmaController.listarTurmas, {
    prefix: 'turma'
  })

  server.register(turmaController.renomearTurma, {
    prefix: 'turma'
  })

  server.register(turmaController.matricularAlunoTurma, {
    prefix: 'turma'
  })

  server.register(turmaController.transferirAlunosTurma, {
    prefix: 'turma'
  })

  server.register(turmaController.listarAlunosTurma, {
    prefix: 'turma'
  })

  server.register(turmaController.transferirAlunoTurma, {
    prefix: 'turma'
  })

  server.register(turmaController.excluirMatriculaAluno, {
    prefix: 'turma'
  })

  server.register(turmaController.realizarChamadaTurma, {
    prefix: 'turma'
  })
}