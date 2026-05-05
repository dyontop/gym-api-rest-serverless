const User = require("@modules/auth/domain/entities/user");
const LoginResponseDto = require("@modules/auth/application/dto/response/login.response");
const LoginRequestDto = require("@modules/auth/application/dto/request/login.request");

/**
 * Mapper de Auth (Application Layer)
 */

/**
 * Convierte un DTO de request en una entidad de dominio User
 * @param {LoginRequestDto} dto
 * @returns {User}
 */
function toDomain(dto) {
  return new User(dto.userId);
}

/**
 * Convierte un token en un DTO de respuesta para el login
 * @param {string} token
 * @returns {LoginResponseDto}
 */
function toResponse(token) {
  return new LoginResponseDto(token);
}

module.exports = {
  toDomain,
  toResponse
};