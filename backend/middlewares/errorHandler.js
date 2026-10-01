function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);

  // errores que lanzamos nosotros con crearError(status, msg)
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // errores de validacion de mongoose
  if (err.name === "ValidationError") {
    const errores = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "Datos inválidos", errores });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID inválido en la db" });
  }

  // llave duplicada (ej: email repetido o voto repetido)
  if (err.code === 11000) {
    return res.status(409).json({ error: "El registro ya existe (dato duplicado)" });
  }

  return res
    .status(500)
    .json({ error: "Error interno del servidor, intente más tarde" });
}

module.exports = errorHandler;
