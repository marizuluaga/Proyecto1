const { validationResult } = require("express-validator");

// revisa si express-validator encontro errores y los devuelve bonitos
function verificarValidaciones(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Datos inválidos",
      errores: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}

module.exports = { verificarValidaciones };
