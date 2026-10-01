const Formula = require("../models/Formula");
const Voto = require("../models/Voto");
const Pocion = require("../models/Pocion");
const { calcularParticipacion } = require("./formulaService");
const { ESTADOS_FORMULA } = require("../utils/constantes");

// Ranking del gremio:
// - Puntos de alquimia: +10 por formula creada, +20 por formula destilada
// - Rareza total: suma de la rareza de las pociones de sus formulas
// - Precision como catador: % de votos de catador que coincidieron con el ganador
// - Participacion: % de las ultimas 5 formulas en las que voto
async function rankingGremio(gremio) {
  await gremio.populate("miembros.usuario", "nombre especialidad avatarUrl");

  const ranking = [];
  for (const m of gremio.miembros) {
    const usuarioId = m.usuario._id;

    const creadas = await Formula.countDocuments({ gremio: gremio._id, creador: usuarioId });
    const destiladas = await Formula.countDocuments({
      gremio: gremio._id,
      creador: usuarioId,
      estado: ESTADOS_FORMULA.DISTILLED,
    });
    const puntos = creadas * 10 + destiladas * 20;

    const pociones = await Pocion.find({ gremio: gremio._id, creador: usuarioId }).select("rareza");
    const rarezaTotal = pociones.reduce((acc, p) => acc + (p.rareza || 0), 0);

    // precision de catador: solo cuenta votos hechos como catador en formulas ya cerradas
    const votosCatador = await Voto.find({ usuario: usuarioId, esCatador: true }).populate(
      "formula",
      "gremio ganadores estado",
    );
    const evaluables = votosCatador.filter(
      (v) =>
        v.formula &&
        v.formula.gremio.toString() === gremio._id.toString() &&
        v.formula.ganadores &&
        v.formula.ganadores[v.categoria],
    );
    const aciertos = evaluables.filter((v) => v.formula.ganadores[v.categoria] === v.opcion).length;
    const precisionCatador =
      evaluables.length > 0 ? Math.round((aciertos / evaluables.length) * 100) : null;

    const participacion = await calcularParticipacion(usuarioId, gremio._id, 5);

    ranking.push({
      usuario: m.usuario,
      rol: m.rol,
      puntosAlquimia: puntos,
      formulasCreadas: creadas,
      formulasDestiladas: destiladas,
      rarezaTotal,
      precisionCatador, // null si nunca voto como catador
      participacion: participacion.porcentaje, // null si no hay formulas
    });
  }

  // ordenamos por puntos y si empatan por rareza
  ranking.sort((a, b) => b.puntosAlquimia - a.puntosAlquimia || b.rarezaTotal - a.rarezaTotal);
  return ranking.map((r, i) => ({ posicion: i + 1, ...r }));
}

module.exports = { rankingGremio };
