const jwtService = require('@modules/auth/infrastructure/services/jwt.service');
const mapper = require('@modules/auth/application/mappers/auth.mapper');
const logger = require('@common/logger');

class Login {
  async ejecutar(requestDto) {
    logger.info('Login ejecutado', {
      layer: 'application',
      usecase: 'Login',
      userId: requestDto.userId,
    });

    try {
      // DTO → Domain
      const user = mapper.toDomain(requestDto);
      const token = jwtService.generarToken({ userId: user.id });
      // Domain → DTO
      return mapper.toResponse(token);
    } catch (error) {
      logger.error('Error en Login', {
        layer: 'application',
        usecase: 'Login',
        userId: requestDto.userId,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = Login;
