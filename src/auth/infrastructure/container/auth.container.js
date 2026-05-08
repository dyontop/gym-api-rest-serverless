const Login = require('@modules/auth/application/usecases/login.usecase');
const logger = require('@common/logger');

let instance = null;

/**
 * Inicialización del módulo auth (Singleton)
 */
function build() {
  if (instance) {
    logger.info('Reutilizando instancia de auth.container', {
      layer: 'config',
      module: 'auth',
    });
    return instance;
  }

  logger.info('Inicializando dependencias del módulo auth', {
    layer: 'config',
    module: 'auth',
  });

  /**
   * Casos de uso
   */
  instance = {
    login: new Login(),
  };

  return instance;
}

module.exports = build;
