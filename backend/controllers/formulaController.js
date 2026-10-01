const formulaService = require("../services/formulaService");
const asyncHandler = require("../utils/asyncHandler");

const obtener = asyncHandler(async (req, res) => {
  const formula = await formulaService.obtenerFormula(req.params.id, req.usuario._id);
  res.json(formula);
});

const abrir = asyncHandler(async (req, res) => {
  const formula = await formulaService.abrirVotacion(req.params.id, req.usuario);
  res.json({ mensaje: "Votación abierta", formula });
});

const cerrar = asyncHandler(async (req, res) => {
  const { formula, pocion } = await formulaService.cerrarVotacion(req.params.id, req.usuario);
  res.json({ mensaje: "Votación cerrada y pocion destilada", formula, pocion });
});

const votar = asyncHandler(async (req, res) => {
  const { voto, cambiado } = await formulaService.votar(req.params.id, req.usuario, req.body);
  res.status(cambiado ? 200 : 201).json({
    mensaje: cambiado ? "Voto actualizado" : "Voto registrado",
    voto,
  });
});

const resultados = asyncHandler(async (req, res) => {
  const data = await formulaService.obtenerResultados(req.params.id, req.usuario._id);
  res.json(data);
});

const vetar = asyncHandler(async (req, res) => {
  const formula = await formulaService.vetar(req.params.id, req.usuario, req.body);
  res.json({ mensaje: "Veto aplicado", veto: formula.veto });
});

const actualizar = asyncHandler(async (req, res) => {
  const formula = await formulaService.actualizarFormula(req.params.id, req.usuario, req.body);
  res.json({ mensaje: "Formula actualizada", formula });
});

const eliminar = asyncHandler(async (req, res) => {
  await formulaService.eliminarFormula(req.params.id, req.usuario);
  res.json({ mensaje: "Formula eliminada" });
});

const retirarVoto = asyncHandler(async (req, res) => {
  await formulaService.retirarVoto(req.params.id, req.usuario, req.params.categoria);
  res.json({ mensaje: "Voto retirado" });
});

module.exports = { obtener, actualizar, eliminar, abrir, cerrar, votar, retirarVoto, resultados, vetar };
