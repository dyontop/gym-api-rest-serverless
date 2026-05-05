function ok(data) {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}

function created(data) {
  return {
    statusCode: 201,
    body: JSON.stringify(data),
  };
}

function badRequest(message) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message }),
  };
}

function unauthorized(message = "No autorizado") {
  return {
    statusCode: 401,
    body: JSON.stringify({ message }),
  };
}

function notFound() {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Not Found" }),
  };
}

function serverError(error) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: error.message,
    }),
  };
}

module.exports = {
  ok,
  created,
  badRequest,
  unauthorized,
  notFound,
  serverError,
};