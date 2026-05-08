/**
 * Container global (Composition Root)
 *
 * Este archivo actúa como un punto central de composición que agrupa
 * los distintos módulos de la aplicación (cliente, auth, evento) y
 * expone sus containers ya inicializados.
 *
 * Responsabilidades:
 * - Centralizar el acceso a los containers de cada módulo
 * - Evitar que los handlers conozcan detalles de implementación
 *
 * Nota:
 * - NO contiene lógica de negocio
 * - NO construye dependencias internas de los módulos
 * - NO ejecuta flujo de aplicación
 * - SOLO agrupa y expone módulos ya construidos
 */

require('dotenv').config();
const logger = require('@common/logger');

logger.info('Inicializando container global', {
  layer: 'config',
});

module.exports = {
  getCliente: () => require('@modules/cliente/infrastructure/container/cliente.container')(),

  getAuth: () => require('@modules/auth/infrastructure/container/auth.container')(),

  getEvento: () => require('@modules/evento/infrastructure/container/evento.container')(),
};
