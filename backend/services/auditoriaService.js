const Auditoria = require("../models/Auditoria");

// registra cualquier cosa importante que pase en el sistema
// (se llama desde los otros services)
async function registrar({ accion, gremio, formula, usuario = null, detalle = {} }) {
  try {
    await Auditoria.create({ accion, gremio, formula, usuario, detalle });
  } catch (e) {
    // si falla el log no queremos tumbar la peticion, solo avisamos en consola
    console.error("No se pudo guardar la auditoria:", e.message);
  }
}

async function listarPorGremio(gremioId, { formula, accion } = {}) {
  const filtro = { gremio: gremioId };
  if (formula) filtro.formula = formula;
  if (accion) filtro.accion = accion;
  return await Auditoria.find(filtro)
    .populate("usuario", "nombre email")
    .populate("formula", "nombrePocion")
    .sort({ createdAt: -1 })
    .limit(200);
}

module.exports = { registrar, listarPorGremio };
