const { randomUUID } = require("crypto");
const logger = require("@common/logger");
const mapper = require("@modules/evento/application/mappers/evento.mapper");

class RegistrarEvento {
  constructor(eventoRepository) {
    this.eventoRepository = eventoRepository;
  }

  async ejecutar(requestDto) {
    logger.info("RegistrarEvento ejecutado", {
      layer: "application",
      usecase: "RegistrarEvento",
      action: "execute",
      userId: requestDto.userId,
      type: requestDto.type
    });

    try {
      // DTO → Domain
      const evento = mapper.toDomain(requestDto, randomUUID());

      const eventoGuardado = await this.eventoRepository.guardar(evento);

      // Domain → DTO
      return mapper.toResponse(eventoGuardado);

    } catch (error) {
      logger.error("Error al registrar evento", {
        layer: "application",
        usecase: "RegistrarEvento",
        userId: requestDto.userId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = RegistrarEvento;