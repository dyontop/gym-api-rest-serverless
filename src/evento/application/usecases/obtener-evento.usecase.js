const logger = require("@common/logger");
const mapper = require("@modules/evento/application/mappers/evento.mapper");

class ObtenerEventos {
  constructor(eventoRepository) {
    this.eventoRepository = eventoRepository;
  }

  async ejecutar(requestDto) {
    logger.info("ObtenerEventos ejecutado", {
      layer: "application",
      usecase: "ObtenerEventos",
      action: "execute"
    });

    try {
      const eventos = await this.eventoRepository.listarPorUsuario(requestDto.userId);

      // Domain → DTO
      return mapper.toListResponse(eventos);

    } catch (error) {
      logger.error("Error al obtener eventos", {
        layer: "application",
        usecase: "ObtenerEventosPorUsuario",
        userId: requestDto.userId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = ObtenerEventos;