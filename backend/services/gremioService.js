const Gremio = require("../models/Gremio");
const Pocion = require("../models/Pocion");
const Formula = require("../models/Formula");
const Voto = require("../models/Voto");
const auditoria = require("./auditoriaService");
const { crearError } = require("../utils/errores");
const { ROLES_GREMIO, MAX_SENIORS } = require("../utils/constantes");

// genera un codigo de 6 caracteres (letras mayusculas y numeros)
function generarCodigo() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O,0,I,1 para que no se confundan
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return codigo;
}

async function crearGremio({ nombre, lema, emblemaUrl, tipo }, usuario) {
  const existe = await Gremio.findOne({ nombre });
  if (existe) throw crearError(400, "Ya existe un gremio con ese nombre");

  let codigoInvitacion = null;
  if (tipo === "Private") {
    // nos aseguramos que el codigo no este repetido
    do {
      codigoInvitacion = generarCodigo();
    } while (await Gremio.findOne({ codigoInvitacion }));
  }

  // el que crea el gremio queda como Grandmaster
  const gremio = await Gremio.create({
    nombre,
    lema,
    emblemaUrl,
    tipo,
    codigoInvitacion,
    miembros: [{ usuario: usuario._id, rol: ROLES_GREMIO.GRANDMASTER }],
  });
  return gremio;
}

// lista los gremios SIN mostrar el codigo de invitacion
async function listarGremios({ tipo } = {}, usuarioId = null) {
  const filtro = {};
  if (tipo) filtro.tipo = tipo;
  const gremios = await Gremio.find(filtro).select("-codigoInvitacion").sort({ createdAt: -1 });
  return gremios.map((g) => ({
    _id: g._id,
    nombre: g.nombre,
    lema: g.lema,
    emblemaUrl: g.emblemaUrl,
    tipo: g.tipo,
    totalMiembros: g.miembros.length,
    // para que el front sepa si mostrar "entrar" o "unirme"
    miRol: usuarioId ? g.obtenerMiembro(usuarioId)?.rol || null : null,
  }));
}

async function obtenerGremio(gremioId, usuarioId) {
  const gremio = await Gremio.findById(gremioId).populate(
    "miembros.usuario",
    "nombre especialidad avatarUrl",
  );
  if (!gremio) throw crearError(404, "Gremio no encontrado");

  const obj = gremio.toObject();
  // el codigo solo lo ve el Grandmaster (para compartirlo)
  const miembro = gremio.miembros.find((m) => m.usuario._id.toString() === usuarioId.toString());
  if (!miembro || miembro.rol !== ROLES_GREMIO.GRANDMASTER) {
    delete obj.codigoInvitacion;
  }
  return obj;
}

async function unirse(gremioId, usuario, codigo) {
  const gremio = await Gremio.findById(gremioId);
  if (!gremio) throw crearError(404, "Gremio no encontrado");

  if (gremio.obtenerMiembro(usuario._id)) {
    throw crearError(400, "Ya eres miembro de este gremio");
  }

  // los privados necesitan el codigo, los publicos no
  if (gremio.tipo === "Private") {
    if (!codigo || codigo.toUpperCase() !== gremio.codigoInvitacion) {
      throw crearError(403, "Codigo de invitación incorrecto");
    }
  }

  gremio.miembros.push({ usuario: usuario._id, rol: ROLES_GREMIO.APPRENTICE });
  await gremio.save();
  return gremio;
}

// para unirse solo con el codigo (sin saber el id del gremio)
async function unirseConCodigo(usuario, codigo) {
  if (!codigo) throw crearError(400, "Debe enviar el codigo de invitación");
  const gremio = await Gremio.findOne({ codigoInvitacion: codigo.toUpperCase() });
  if (!gremio) throw crearError(404, "No existe un gremio con ese codigo");
  return await unirse(gremio._id, usuario, codigo);
}

async function listarMiembros(gremio) {
  await gremio.populate("miembros.usuario", "nombre email especialidad avatarUrl");
  return gremio.miembros.map((m) => ({
    usuario: m.usuario,
    especialidad: m.usuario.especialidad,
    rol: m.rol,
    fechaIngreso: m.fechaIngreso,
  }));
}

// El Grandmaster promueve o degrada Senior Alchemists
async function cambiarRol(gremio, usuarioId, nuevoRol, quien) {
  const permitidos = [ROLES_GREMIO.SENIOR, ROLES_GREMIO.APPRENTICE];
  if (!permitidos.includes(nuevoRol)) {
    throw crearError(400, "Solo se puede asignar SeniorAlchemist o Apprentice (para catador usar /catador)");
  }

  const miembro = gremio.obtenerMiembro(usuarioId);
  if (!miembro) throw crearError(404, "Ese usuario no es miembro del gremio");
  if (miembro.rol === ROLES_GREMIO.GRANDMASTER) {
    throw crearError(400, "No se puede cambiar el rol del Grandmaster");
  }

  if (nuevoRol === ROLES_GREMIO.SENIOR && miembro.rol !== ROLES_GREMIO.SENIOR) {
    const seniors = gremio.miembros.filter((m) => m.rol === ROLES_GREMIO.SENIOR).length;
    if (seniors >= MAX_SENIORS) {
      throw crearError(400, `El gremio ya tiene el maximo de ${MAX_SENIORS} Senior Alchemists`);
    }
  }

  const rolAnterior = miembro.rol;
  miembro.rol = nuevoRol;
  if (rolAnterior === ROLES_GREMIO.TASTER) gremio.catadorDesde = null;
  await gremio.save();

  await auditoria.registrar({
    accion: "CAMBIO_ROL",
    gremio: gremio._id,
    usuario: quien._id,
    detalle: { afectado: usuarioId, rolAnterior, nuevoRol },
  });
  return miembro;
}

// El Grandmaster nombra al Catador Oficial (solo puede haber 1)
async function nombrarCatador(gremio, usuarioId, quien) {
  const miembro = gremio.obtenerMiembro(usuarioId);
  if (!miembro) throw crearError(404, "Ese usuario no es miembro del gremio");
  if (miembro.rol === ROLES_GREMIO.GRANDMASTER) {
    throw crearError(400, "El Grandmaster no puede ser el Catador Oficial");
  }

  // si ya habia un catador vuelve a ser Apprentice
  const catadorActual = gremio.miembros.find((m) => m.rol === ROLES_GREMIO.TASTER);
  if (catadorActual) catadorActual.rol = ROLES_GREMIO.APPRENTICE;

  miembro.rol = ROLES_GREMIO.TASTER;
  gremio.catadorDesde = new Date();
  await gremio.save();

  await auditoria.registrar({
    accion: "CATADOR_NOMBRADO",
    gremio: gremio._id,
    usuario: quien._id,
    detalle: {
      nuevoCatador: usuarioId,
      catadorAnterior: catadorActual ? catadorActual.usuario : null,
    },
  });
  return miembro;
}

// PUT: editar los datos del gremio (Grandmaster o admin)
async function actualizarGremio(gremio, { nombre, lema, emblemaUrl, tipo }, quien) {
  if (nombre !== undefined && nombre !== gremio.nombre) {
    const existe = await Gremio.findOne({ nombre });
    if (existe) throw crearError(400, "Ya existe un gremio con ese nombre");
    gremio.nombre = nombre;
  }
  if (lema !== undefined) gremio.lema = lema;
  if (emblemaUrl !== undefined) gremio.emblemaUrl = emblemaUrl;

  if (tipo !== undefined && tipo !== gremio.tipo) {
    gremio.tipo = tipo;
    // si pasa a privado le generamos codigo, si pasa a publico se lo quitamos
    if (tipo === "Private") {
      do {
        gremio.codigoInvitacion = generarCodigo();
      } while (await Gremio.findOne({ codigoInvitacion: gremio.codigoInvitacion }));
    } else {
      gremio.codigoInvitacion = null;
    }
  }
  await gremio.save();

  await auditoria.registrar({
    accion: "GREMIO_EDITADO",
    gremio: gremio._id,
    usuario: quien._id,
    detalle: { nombre, lema, emblemaUrl, tipo },
  });
  return gremio;
}

// DELETE: borrar el gremio con sus formulas y votos (Grandmaster o admin)
// las pociones del grimorio tambien se borran porque pertenecen al gremio
async function eliminarGremio(gremio, quien) {
  const formulas = await Formula.find({ gremio: gremio._id }).select("_id");
  const ids = formulas.map((f) => f._id);
  await Voto.deleteMany({ formula: { $in: ids } });
  await Formula.deleteMany({ gremio: gremio._id });
  await Pocion.deleteMany({ gremio: gremio._id });
  await gremio.deleteOne();

  await auditoria.registrar({
    accion: "GREMIO_ELIMINADO",
    usuario: quien._id,
    detalle: { gremioId: gremio._id, nombre: gremio.nombre },
  });
}

// DELETE miembro: el Grandmaster expulsa a alguien o el usuario se sale solo
async function quitarMiembro(gremio, usuarioId, quien, rolQuien) {
  const esElMismo = usuarioId.toString() === quien._id.toString();
  if (!esElMismo && rolQuien !== ROLES_GREMIO.GRANDMASTER && quien.role !== "admin") {
    throw crearError(403, "Solo el Grandmaster puede expulsar miembros");
  }
  const miembro = gremio.obtenerMiembro(usuarioId);
  if (!miembro) throw crearError(404, "Ese usuario no es miembro del gremio");
  if (miembro.rol === ROLES_GREMIO.GRANDMASTER) {
    throw crearError(400, "El Grandmaster no puede salir del gremio (puede eliminarlo)");
  }
  if (miembro.rol === ROLES_GREMIO.TASTER) gremio.catadorDesde = null;

  gremio.miembros = gremio.miembros.filter(
    (m) => (m.usuario._id || m.usuario).toString() !== usuarioId.toString(),
  );
  await gremio.save();

  await auditoria.registrar({
    accion: esElMismo ? "MIEMBRO_SALIO" : "MIEMBRO_EXPULSADO",
    gremio: gremio._id,
    usuario: quien._id,
    detalle: { afectado: usuarioId },
  });
}

// Grimorio: pociones destiladas del gremio, se puede buscar por nombre
async function obtenerGrimorio(gremioId, { buscar, orden } = {}) {
  const filtro = { gremio: gremioId };
  if (buscar) {
    // busqueda sencilla con regex (no distingue mayusculas)
    const texto = buscar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filtro.nombreFinal = { $regex: texto, $options: "i" };
  }
  const ordenar = orden === "rareza" ? { rareza: -1 } : { createdAt: -1 };
  return await Pocion.find(filtro)
    .populate("formula", "nombrePocion efectoDeseado dificultad")
    .populate("creador", "nombre")
    .sort(ordenar);
}

module.exports = {
  crearGremio,
  listarGremios,
  obtenerGremio,
  unirse,
  unirseConCodigo,
  listarMiembros,
  cambiarRol,
  nombrarCatador,
  obtenerGrimorio,
  actualizarGremio,
  eliminarGremio,
  quitarMiembro,
  generarCodigo,
};
