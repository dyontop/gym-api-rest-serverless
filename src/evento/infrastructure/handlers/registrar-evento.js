require('module-alias/register');
require('dotenv').config();

const container = require('@config/container');
const http = require('@common/utils/http.util');
const { getUserFromEvent, requireAuth } = require('@common/utils/auth.util');

module.exports.handler = async event => {
  try {
    // const user = getUserFromEvent(event);
    // requireAuth(user);

    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.userId) {
      return http.badRequest('userId es requerido');
    }

    if (!body.type) {
      return http.badRequest('type es requerido');
    }

    const result = await container.evento.registrarEvento.ejecutar(body);

    return http.created(result);
  } catch (error) {
    return http.serverError(error);
  }
};
