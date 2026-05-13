require('module-alias/register');
require('dotenv').config();

const { getEvento } = require('@config/container');
const http = require('@common/utils/http.util');
const { getUserFromEvent, requireAuth } = require('@common/utils/auth.util');

module.exports.handler = async event => {
  try {
    // ✅ 1. Auth primero
    // const user = getUserFromEvent(event);
    // requireAuth(user);

    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return http.badRequest('userId es requerido');
    }

    // ✅ 2. Lazy load
    const evento = getEvento();

    // ✅ 3. Use case
    const result = await evento.obtenerEventos.ejecutar({ userId });

    return http.ok(result);
  } catch (error) {
    return http.serverError(error);
  }
};
