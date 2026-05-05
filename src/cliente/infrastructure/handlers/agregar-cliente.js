require("module-alias/register");
require("dotenv").config();

const { getCliente } = require("@config/container");
const http = require("@common/utils/http.util");
const { getUserFromEvent, requireAuth } = require("@common/utils/auth.util");

module.exports.handler = async (event) => {
  try {
    
    // ✅ 1. Auth primero
    const user = getUserFromEvent(event);
    requireAuth(user);

    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.nombre) {
      return http.badRequest("nombre es requerido");
    }

    // ✅ 2. Lazy load
    const cliente = getCliente(); //Lazy Load aqui

    // ✅ 3. Use case
    const result = await cliente.agregarCliente.ejecutar(body);

    return http.created(result);

  } catch (error) {
    return http.serverError(error);
  }
};