const logger = require("@common/logger");
const mapper = require('@modules/cliente/application/mappers/cliente.mapper');

class ObtenerClientes {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async ejecutar() {
    logger.info("ObtenerClientes ejecutado", {
      layer: "application",
      usecase: "ObtenerClientes",
      action: "execute"
    });
    try{
      const clientes =  await this.clienteRepository.listar();
      return mapper.toListResponse(clientes);
    } catch(error) {
      logger.error("Error al listar clientes", {
        layer: "application",
        usecase: "ObtenerClientes",
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = ObtenerClientes;