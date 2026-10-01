const gremioService = require("../services/gremioService");
const formulaService = require("../services/formulaService");
const rankingService = require("../services/rankingService");
const auditoriaService = require("../services/auditoriaService");
const asyncHandler = require("../utils/asyncHandler");

const crear = asyncHandler(async (req, res) => {
  const gremio = await gremioService.crearGremio(req.body, req.usuario);
  res.status(201).json({ mensaje: "Gremio creado", gremio });
});

const listar = asyncHandler(async (req, res) => {
  const gremios = await gremioService.listarGremios(req.query, req.usuario._id);
  res.json(gremios);
});

const obtener = asyncHandler(async (req, res) => {
  const gremio = await gremioService.obtenerGremio(req.params.gremioId, req.usuario._id);
  res.json(gremio);
});

const unirse = asyncHandler(async (req, res) => {
  const gremio = await gremioService.unirse(req.params.gremioId, req.usuario, req.body.codigo);
  res.json({ mensaje: `Te uniste al gremio ${gremio.nombre}` });
});

const unirseConCodigo = asyncHandler(async (req, res) => {
  const gremio = await gremioService.unirseConCodigo(req.usuario, req.body.codigo);
  res.json({ mensaje: `Te uniste al gremio ${gremio.nombre}`, gremioId: gremio._id });
});

const miembros = asyncHandler(async (req, res) => {
  const lista = await gremioService.listarMiembros(req.gremio);
  res.json(lista);
});

const cambiarRol = asyncHandler(async (req, res) => {
  const miembro = await gremioService.cambiarRol(
    req.gremio,
    req.params.usuarioId,
    req.body.rol,
    req.usuario,
  );
  res.json({ mensaje: "Rol actualizado", miembro });
});

const nombrarCatador = asyncHandler(async (req, res) => {
  const miembro = await gremioService.nombrarCatador(req.gremio, req.body.usuarioId, req.usuario);
  res.json({ mensaje: "Catador Oficial nombrado", miembro });
});

const ranking = asyncHandler(async (req, res) => {
  const lista = await rankingService.rankingGremio(req.gremio);
  res.json(lista);
});

const grimorio = asyncHandler(async (req, res) => {
  const pociones = await gremioService.obtenerGrimorio(req.gremio._id, req.query);
  res.json(pociones);
});

const auditoria = asyncHandler(async (req, res) => {
  const logs = await auditoriaService.listarPorGremio(req.gremio._id, req.query);
  res.json(logs);
});

const actualizar = asyncHandler(async (req, res) => {
  const gremio = await gremioService.actualizarGremio(req.gremio, req.body, req.usuario);
  res.json({ mensaje: "Gremio actualizado", gremio });
});

const eliminar = asyncHandler(async (req, res) => {
  await gremioService.eliminarGremio(req.gremio, req.usuario);
  res.json({ mensaje: "Gremio eliminado" });
});

const quitarMiembro = asyncHandler(async (req, res) => {
  await gremioService.quitarMiembro(req.gremio, req.params.usuarioId, req.usuario, req.miembro.rol);
  res.json({ mensaje: "Miembro retirado del gremio" });
});

// formulas dentro del gremio
const crearFormula = asyncHandler(async (req, res) => {
  const formula = await formulaService.crearFormula(req.gremio, req.usuario, req.body);
  res.status(201).json({ mensaje: "Formula propuesta", formula });
});

const listarFormulas = asyncHandler(async (req, res) => {
  const formulas = await formulaService.listarFormulas(req.gremio._id, req.query);
  res.json(formulas);
});

module.exports = {
  crear,
  listar,
  actualizar,
  eliminar,
  quitarMiembro,
  obtener,
  unirse,
  unirseConCodigo,
  miembros,
  cambiarRol,
  nombrarCatador,
  ranking,
  grimorio,
  auditoria,
  crearFormula,
  listarFormulas,
};
