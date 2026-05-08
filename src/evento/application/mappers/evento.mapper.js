const Evento = require('@modules/evento/domain/entities/evento');
const EventoResponseDto = require('../dto/response/evento.response');
// const RegistrarEventoRequestDto = require("../dto/request/registrar-evento.request");

function toDomain(dto, id) {
  return new Evento({
    id,
    userId: dto.userId,
    type: dto.type,
  });
}

function toResponse(evento) {
  return new EventoResponseDto(evento.id, evento.userId, evento.type, evento.timestamp);
}

function toListResponse(eventos) {
  return eventos.map(toResponse);
}

module.exports = {
  toDomain,
  toResponse,
  toListResponse,
};
