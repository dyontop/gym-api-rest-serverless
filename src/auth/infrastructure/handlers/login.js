require("module-alias/register");
require("dotenv").config();

const { getAuth } = require("@config/container");
const http = require("@common/utils/http.util");

module.exports.handler = async (event) => {

  try {
    const auth = getAuth(); // aquí recién se carga el modulo de auth y sus dependencias
    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.userId) {
      return http.badRequest("userId es requerido");
    }

    const result = await auth.login.ejecutar({
      userId: body.userId
    });

    return http.ok(result);

  } catch (error) {
    return http.serverError(error);
  }
};