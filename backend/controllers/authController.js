const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const registrar = asyncHandler(async (req, res) => {
  const { usuario, token } = await authService.registrar(req.body);
  res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario, token });
});

const login = asyncHandler(async (req, res) => {
  const { usuario, token } = await authService.login(req.body);
  res.json({ mensaje: "Bienvenido al laboratorio", usuario, token });
});

const logout = asyncHandler(async (req, res) => {
  authService.logout(req.token);
  res.json({ mensaje: "Sesion cerrada correctamente" });
});

const perfil = asyncHandler(async (req, res) => {
  res.json(authService.limpiarUsuario(req.usuario));
});

const actualizarPerfil = asyncHandler(async (req, res) => {
  const usuario = await authService.actualizarPerfil(req.usuario, req.body);
  res.json({ mensaje: "Perfil actualizado", usuario });
});

module.exports = { registrar, login, logout, perfil, actualizarPerfil };
