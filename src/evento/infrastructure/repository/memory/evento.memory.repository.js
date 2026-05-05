const EventoRepository = require("@modules/evento/domain/repository/evento.repository");
const Evento = require("@modules/evento/domain/entities/evento");
const logger = require("@common/logger");

// 🔥 almacenamiento en memoria (append-only)
let eventos = [];

class EventoMemoryRepository extends EventoRepository {

  async listarPorUsuario(userId) {
    logger.info("Listando eventos en memoria por usuario", {
      layer: "infrastructure",
      repository: "EventoMemoryRepository",
      method: "listarPorUsuario",
      userId
    });

    return eventos.filter(e => e.userId === userId);
  }

  async guardar(evento) {
    logger.info("Guardando evento en memoria", {
      layer: "infrastructure",
      repository: "EventoMemoryRepository",
      method: "guardar",
      id: evento.id,
      userId: evento.userId
    });

    // 🔥 inmutabilidad → solo append
    eventos.push(evento);

    return evento;
  }
}

module.exports = EventoMemoryRepository;