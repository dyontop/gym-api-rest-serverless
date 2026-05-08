const jwt = require('jsonwebtoken');
const authConfig = require('@config/auth.config');

function generarToken(payload) {
  return jwt.sign(payload, authConfig.jwt.secret, { expiresIn: authConfig.jwt.expiresIn });
}

function verificarToken(token) {
  return jwt.verify(token, authConfig.jwt.secret);
}

module.exports = {
  generarToken,
  verificarToken,
};
