const { randomUUID } = require("crypto");
const logger = require("@common/logger");
const mapper = require('@modules/cliente/application/mappers/cliente.mapper');

class AgregarCliente {
  constructor(clienteRepository, emailService, eventPublisher) {
    this.clienteRepository = clienteRepository;
    this.emailService = emailService;
    this.eventPublisher = eventPublisher;
  }

  async ejecutar(requestDto) {
    logger.info("AgregarCliente ejecutado", {
      layer: "application",
      usecase: "AgregarCliente",
      action: "execute",
      nombre: requestDto.nombre
    });

    const id = randomUUID();
    
    // DTO → Domain
    const nuevoCliente = mapper.toDomain(requestDto, id);

    try {

      // 1. Guardar cliente (core negocio)
      const clienteGuardado = await this.clienteRepository.guardar(nuevoCliente);

      // 2. Emitir evento (desacoplar side-effects)
      await this.eventPublisher.publish({
        type: "CLIENTE_REGISTRADO",
        payload: {
          id: clienteGuardado.id,
          nombre: clienteGuardado.nombre
        }
      });

      // 3. Email (opcional - no rompe flujo)
      try {
        await this.emailService.enviarBienvenida(clienteGuardado);
      } catch (error) {
        logger.warn("Fallo envío de email", {
          clienteId: clienteGuardado.id,
          error: error.message
        });
      }
      // Domain → DTO
      return mapper.toResponse(clienteGuardado);
      
    } catch (error) {
      logger.error("Error al agregar cliente", {
        layer: "application",
        usecase: "AgregarCliente",
        nombre: requestDto.nombre,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = AgregarCliente;