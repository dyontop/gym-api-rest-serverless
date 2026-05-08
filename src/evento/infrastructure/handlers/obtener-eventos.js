require('module-alias/register');
require('dotenv').config();

const { evento } = require('@config/container');
const http = require('@common/utils/http.util');
const { getUserFromEvent, requireAuth } = require('@common/utils/auth.util');

module.exports.handler = async event => {
  try {
    // const user = getUserFromEvent(event);
    // requireAuth(user);

    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return http.badRequest('userId es requerido');
    }

    const result = await evento.obtenerEventos.ejecutar({ userId });

    return http.ok(result);
  } catch (error) {
    return http.serverError(error);
  }
};
