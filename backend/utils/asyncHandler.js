// envuelve las funciones async para que los errores lleguen al errorHandler
// y no tener que poner try/catch en todos lados
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
module.exports = asyncHandler;
