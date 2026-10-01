// funcion pequeña para lanzar errores con status, asi el errorHandler
// sabe que codigo devolver (400, 403, 404...)
function crearError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = { crearError };
