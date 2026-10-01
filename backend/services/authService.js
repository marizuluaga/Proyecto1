const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const tokenBlacklist = require("../utils/tokenBlacklist");
const { crearError } = require("../utils/errores");

async function registrar({ nombre, email, password, especialidad, avatarUrl }) {
  const usuarioExistente = await Usuario.findOne({ email });
  if (usuarioExistente) throw crearError(400, "El email ya está registrado");

  const usuario = new Usuario({ nombre, email, password, especialidad, avatarUrl });
  await usuario.save();

  const token = generarToken(usuario);
  return { usuario: limpiarUsuario(usuario), token };
}

async function login({ email, password }) {
  const usuario = await Usuario.findOne({ email }).select("+password");
  if (!usuario) throw crearError(401, "El email es incorrecto o no existe");

  const passwordValida = await usuario.compararPasswords(password);
  if (!passwordValida) throw crearError(401, "La contraseña es incorrecta");

  const token = generarToken(usuario);
  return { usuario: limpiarUsuario(usuario), token };
}

function logout(token) {
  tokenBlacklist.revocar(token);
}

async function actualizarPerfil(usuario, { nombre, especialidad, avatarUrl }) {
  // el email no se deja cambiar porque es el correo universitario
  if (nombre !== undefined) usuario.nombre = nombre;
  if (especialidad !== undefined) usuario.especialidad = especialidad;
  if (avatarUrl !== undefined) usuario.avatarUrl = avatarUrl;
  await usuario.save();
  return limpiarUsuario(usuario);
}

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario._id,
      email: usuario.email,
      especialidad: usuario.especialidad,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

// para no mandar la contraseña en la respuesta
function limpiarUsuario(usuario) {
  const obj = usuario.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
}

module.exports = { registrar, login, logout, actualizarPerfil, generarToken, limpiarUsuario };
