const { randomUUID } = require('crypto');
const logger = require('@common/logger');
const mapper = require('@modules/cliente/application/mappers/cliente.mapper');

class AgregarCliente {
  constructor(clienteRepository, eventPublisher) {
    this.clienteRepository = clienteRepository;
    this.eventPublisher = eventPublisher;
  }

  async ejecutar(requestDto) {
    logger.info('AgregarCliente ejecutado', {
      layer: 'application',
      usecase: 'AgregarCliente',
      action: 'execute',
      nombre: requestDto.nombre,
    });

    const id = randomUUID();

    // DTO → Domain
    const nuevoCliente = mapper.toDomain(requestDto, id);

    try {
      // 1. CORE (negocio): guardar cliente
      const clienteGuardado = await this.clienteRepository.guardar(nuevoCliente);

      // 2. EVENTO (comunicación): desacoplar efectos secundarios
      await this.eventPublisher.publish({
        type: 'CLIENTE_REGISTRADO',
        payload: {
          id: clienteGuardado.id,
          nombre: clienteGuardado.nombre,
          email: clienteGuardado.email, // importante para SES
        },
      });

      /**
       * // ⚠️ ENVÍO DE EMAIL DIRECTO (SOLO PARA PRUEBAS / DEBUG LOCAL)
       * Este bloque permite enviar el email de forma síncrona desde el caso de uso,
       * sin pasar por SNS.
       */

      // 3. SIDE EFFECTS (reacciones) - enviar email, enviar SMS, etc
      // try {
      //   await this.emailService.enviarBienvenida(clienteGuardado);
      // } catch (error) {
      //   logger.warn("Fallo envío de email", {
      //     clienteId: clienteGuardado.id,
      //     error: error.message
      //   });
      // }

      // Domain → DTO
      return mapper.toResponse(clienteGuardado);
    } catch (error) {
      logger.error('Error al agregar cliente', {
        layer: 'application',
        usecase: 'AgregarCliente',
        nombre: requestDto.nombre,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = AgregarCliente;
