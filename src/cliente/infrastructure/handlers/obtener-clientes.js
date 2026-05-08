require('module-alias/register');
require('dotenv').config();

const { getCliente } = require('@config/container');
const http = require('@common/utils/http.util');
const { getUserFromEvent, requireAuth } = require('@common/utils/auth.util');
const logger = require('@common/logger');

module.exports.handler = async event => {
  try {
    // ✅ 1. Auth primero
    const user = getUserFromEvent(event);
    requireAuth(user);

    logger.info('Usuario autorizado', {
      userId: user.userId,
    });

    // ✅ 2. Lazy load
    const cliente = getCliente(); // Lazy Load aqui

    // ✅ 3. Use case
    const result = await cliente.obtenerClientes.ejecutar();

    logger.info('Clientes obtenidos', {
      total: result.length,
    });

    return http.ok(result);
  } catch (error) {
    // LOG REAL DEL ERROR
    logger.error(error.message, {
      message: error.message,
      code: error.code,
      // stack: error.stack
    });

    // manejar errores conocidos
    if (error.code === 'UNAUTHORIZED') {
      return http.unauthorized('No autorizado');
    }

    if (error.code === 'TOKEN_EXPIRED') {
      return http.unauthorized('Token expirado');
    }

    if (error.code === 'TOKEN_INVALID') {
      return http.unauthorized('Token inválido');
    }

    return http.serverError(error);
  }
};
