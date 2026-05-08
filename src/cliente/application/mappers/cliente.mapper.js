const Cliente = require('@modules/cliente/domain/entities/cliente');
const ClienteResponseDto = require('../dto/response/cliente.response');
const AgregarClienteRequestDto = require('../dto/request/agregar-cliente.request');

/**
 * Mapper de Cliente (Application Layer)
 *
 * Responsabilidad:
 * Convertir entre DTOs (entrada/salida) y la entidad de dominio Cliente.
 *
 * NO conoce detalles de infraestructura (DB, Redis, etc.)
 * SOLO transforma datos entre capas.
 */

/**
 * Convierte un DTO de request en una entidad de dominio Cliente
 *
 * @param {AgregarClienteRequestDto} dto - DTO de entrada con los datos del cliente
 * @param {string} id - Identificador generado (uuid)
 * @returns {Cliente} Entidad de dominio lista para persistir
 */
function toDomain(dto, id) {
  return new Cliente(id, dto.nombre);
}

/**
 * Convierte una entidad de dominio Cliente en un DTO de respuesta
 *
 * @param {Cliente} cliente - Entidad de dominio
 * @returns {ClienteResponseDto} DTO listo para exponer (GraphQL / API)
 */
function toResponse(cliente) {
  return new ClienteResponseDto(cliente.id, cliente.nombre);
}

/**
 * Convierte una lista de entidades Cliente en una lista de DTOs de respuesta
 *
 * @param {Cliente[]} clientes - Lista de entidades de dominio
 * @returns {ClienteResponseDto[]} Lista de DTOs
 */
function toListResponse(clientes) {
  return clientes.map(toResponse);
}

module.exports = {
  toDomain,
  toResponse,
  toListResponse,
};
