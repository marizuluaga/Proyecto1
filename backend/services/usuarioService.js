const Usuario = require("../models/Usuario");
const Gremio = require("../models/Gremio");
const Voto = require("../models/Voto");
const { crearError } = require("../utils/errores");
const { ROLES_GREMIO } = require("../utils/constantes");

// CRUD de usuarios (solo para el admin)

async function listarUsuarios({ especialidad, role } = {}) {
  const filtro = {};
  if (especialidad) filtro.especialidad = especialidad;
  if (role) filtro.role = role;
  return await Usuario.find(filtro).sort({ nombre: 1 });
}

async function obtenerUsuario(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw crearError(404, "Usuario no encontrado");
  return usuario;
}

async function actualizarUsuario(id, { nombre, especialidad, avatarUrl, role }) {
  const usuario = await obtenerUsuario(id);
  if (nombre !== undefined) usuario.nombre = nombre;
  if (especialidad !== undefined) usuario.especialidad = especialidad;
  if (avatarUrl !== undefined) usuario.avatarUrl = avatarUrl;
  if (role !== undefined) usuario.role = role;
  await usuario.save();
  return usuario;
}

async function eliminarUsuario(id, quien) {
  if (id.toString() === quien._id.toString()) {
    throw crearError(400, "No te puedes eliminar a ti mismo");
  }
  const usuario = await obtenerUsuario(id);

  // buscamos los gremios donde esta el usuario
  const gremios = await Gremio.find({ "miembros.usuario": usuario._id });

  // si es Grandmaster de algun gremio no lo dejamos borrar (el gremio quedaria sin dueño)
  const esDueño = gremios.some((g) => g.obtenerMiembro(usuario._id).rol === ROLES_GREMIO.GRANDMASTER);
  if (esDueño) {
    throw crearError(400, "El usuario es Grandmaster de un gremio, primero elimine el gremio");
  }

  // lo sacamos de los gremios y borramos sus votos
  for (const gremio of gremios) {
    gremio.miembros = gremio.miembros.filter((m) => m.usuario.toString() !== usuario._id.toString());
    await gremio.save();
  }
  await Voto.deleteMany({ usuario: usuario._id });
  await usuario.deleteOne();
  return usuario;
}

module.exports = { listarUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario };
