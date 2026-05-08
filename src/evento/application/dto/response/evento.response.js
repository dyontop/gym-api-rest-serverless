class EventoResponseDto {
  constructor(id, userId, type, timestamp) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.timestamp = timestamp;
  }
}

module.exports = EventoResponseDto;
