class RegistrarEventoRequestDto {
  constructor(userId, type) {
    this.userId = userId;
    this.type = type;
  }
}

module.exports = RegistrarEventoRequestDto;