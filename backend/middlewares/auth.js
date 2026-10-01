const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const tokenBlacklist = require("../utils/tokenBlacklist");

// Verifica que venga el token en el header Authorization: Bearer <token>
async function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }
    const token = authHeader.split(" ")[1];

    // si el usuario hizo logout el token ya no sirve
    if (tokenBlacklist.estaRevocado(token)) {
      return res.status(401).json({ error: "La sesion fue cerrada, inicia sesion otra vez" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    req.usuario = usuario;
    req.token = token;
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(500).json({ error: "Error al autenticar usuario" });
  }
}

// Autoriza por rol GLOBAL (admin / user), igual que en clase
// uso: router.get("/", autenticar, autorizar("admin"), ...)
function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!roles.includes(req.usuario.role)) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para realizar esta acción" });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
