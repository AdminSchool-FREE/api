import { routesAuth, routesEscola, routesMensagemWhatsApp, routesReportBug, routesTurma } from "./routes/routes";
import Servidor from "./server/Servidor";

const server = new Servidor(
  process.env.ENV_HOST_SERVER || '0.0.0.0',
  Number(process.env.ENV_PORT_SERVER) || 3333,
)

routesEscola(server.getServico())
routesMensagemWhatsApp(server.getServico())
routesAuth(server.getServico())
routesTurma(server.getServico())
routesReportBug(server.getServico())

server.inicializar()