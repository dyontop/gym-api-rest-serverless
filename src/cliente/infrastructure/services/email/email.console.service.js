const logger = require("@common/logger");

class ConsoleEmailService {
  async enviarBienvenida(cliente) {
    logger.info("Email enviado (console)", {
      layer: "infrastructure",
      service: "ConsoleEmailService",
      clienteId: cliente.id,
      nombre: cliente.nombre
    });

    console.log(`📧 Bienvenido ${cliente.nombre}`);
  }
}

module.exports = ConsoleEmailService;