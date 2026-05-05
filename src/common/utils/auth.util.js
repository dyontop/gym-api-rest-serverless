const { verificarToken } = require("@modules/auth/infrastructure/services/jwt.service");

/**
 * Extrae y valida el usuario desde el evento de Lambda
 */
function getUserFromEvent(event) {
  const authHeader = event.headers?.authorization;

  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  try {
    const user = verificarToken(token);
    return { 
      ... user,
        authenticated: true
    };
  } catch (err) {
    return { 
      authenticated: false,
      error: err.name // TokenExpiredError | JsonWebTokenError
    }; 
  }
}

/**
 * Valida autenticación del usuario
 */
function requireAuth(user) {
  // No hay usuario
  if (!user) {
    const error = new Error("No autorizado");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  // Token expirado
  if (user.error === "TokenExpiredError") {
    const error = new Error("Token expirado");
    error.code = "TOKEN_EXPIRED";
    throw error;
  }

  // Token inválido
  if (user.error === "JsonWebTokenError") {
    const error = new Error("Token inválido");
    error.code = "TOKEN_INVALID";
    throw error;
  }

  return user;
}

module.exports = {
  getUserFromEvent,
  requireAuth,
};