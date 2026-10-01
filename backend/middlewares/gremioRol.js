const mongoose = require("mongoose");
const Gremio = require("../models/Gremio");

// Middleware para autorizar por ROL DENTRO DEL GREMIO
// uso: verificarRolGremio("Grandmaster", "SeniorAlchemist")
// si no se pasan roles solo verifica que sea miembro
function verificarRolGremio(...roles) {
  return async (req, res, next) => {
    try {
      const gremioId = req.params.gremioId;
      if (!mongoose.isValidObjectId(gremioId)) {
        return res.status(400).json({ error: "ID de gremio inválido" });
      }
      const gremio = await Gremio.findById(gremioId);
      if (!gremio) {
        return res.status(404).json({ error: "Gremio no encontrado" });
      }

      let miembro = gremio.obtenerMiembro(req.usuario._id);

      // el admin de la app puede entrar a cualquier gremio (para moderar)
      if (req.usuario.role === "admin") {
        req.gremio = gremio;
        req.miembro = miembro || { usuario: req.usuario._id, rol: "admin" };
        return next();
      }

      if (!miembro) {
        return res.status(403).json({ error: "No eres miembro de este gremio" });
      }

      if (roles.length > 0 && !roles.includes(miembro.rol)) {
        return res
          .status(403)
          .json({ error: "Tu rol en el gremio no te permite realizar esta acción" });
      }

      // lo dejamos en el req para no volverlo a buscar en el controller
      req.gremio = gremio;
      req.miembro = miembro;
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { verificarRolGremio };
