const usuarioService = require("../services/usuarioService");
const asyncHandler = require("../utils/asyncHandler");

const listar = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.listarUsuarios(req.query);
  res.json(usuarios);
});

const obtener = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.obtenerUsuario(req.params.id);
  res.json(usuario);
});

const actualizar = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
  res.json({ mensaje: "Usuario actualizado", usuario });
});

const eliminar = asyncHandler(async (req, res) => {
  await usuarioService.eliminarUsuario(req.params.id, req.usuario);
  res.json({ mensaje: "Usuario eliminado" });
});

module.exports = { listar, obtener, actualizar, eliminar };
