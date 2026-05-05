const logger = require("@common/logger");
const mapper = require('@modules/cliente/application/mappers/cliente.mapper');

class ObtenerCliente {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async ejecutar(requestDto) {
    logger.info("ObtenerCliente ejecutado", {
      layer: "application",
      usecase: "ObtenerCliente",
      action: "execute",
      id: requestDto.id
    });

    try{
      const cliente = await this.clienteRepository.buscarPorId(requestDto.id);
      return cliente ? mapper.toResponse(cliente) : null;
    } catch(error) {
      logger.error("Error al obtener cliente", {
        layer: "application",
        usecase: "ObtenerCliente",
        id: requestDto.id,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = ObtenerCliente;