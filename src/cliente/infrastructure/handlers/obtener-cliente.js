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

    const id = event.pathParameters?.id;

    if (!id) {
      return http.badRequest("id es requerido");
    }

    // ✅ 2. Lazy load
    const cliente = getCliente(); //Lazy Load aqui

    // ✅ 3. Use case
    const result = await cliente.obtenerCliente.ejecutar({ id });

    if (!result) {
      return http.notFound();
    }

    return http.ok(result);

  } catch (error) {
    return http.serverError(error);
  }
};