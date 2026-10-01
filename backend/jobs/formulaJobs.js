const Formula = require("../models/Formula");
const Gremio = require("../models/Gremio");
const Voto = require("../models/Voto");
const formulaService = require("../services/formulaService");
const auditoria = require("../services/auditoriaService");
const { ESTADOS_FORMULA, ROLES_GREMIO, HORAS_LIMITE_CATADOR } = require("../utils/constantes");

const CADA_MINUTO = 60 * 1000;

// 1. Cierra automaticamente las votaciones que ya llegaron a su fecha de fin
async function cerrarVotacionesVencidas() {
  const vencidas = await Formula.find({
    estado: ESTADOS_FORMULA.VOTING_OPEN,
    fechaFin: { $lte: new Date() },
  });
  for (const formula of vencidas) {
    try {
      await formulaService.cerrarVotacion(formula._id, null); // null = lo hizo el sistema
      console.log(`[job] Formula "${formula.nombrePocion}" cerrada y destilada automaticamente`);
    } catch (e) {
      console.error(`[job] No se pudo cerrar la formula ${formula._id}:`, e.message);
    }
  }
}

// 2. Si el Catador Oficial no vota dentro de 48h desde que se abrio la votacion,
//    pierde el rol de catador
async function revisarCatadores() {
  const limite = HORAS_LIMITE_CATADOR * 60 * 60 * 1000;
  const gremios = await Gremio.find({ "miembros.rol": ROLES_GREMIO.TASTER });

  for (const gremio of gremios) {
    const catador = gremio.miembros.find((m) => m.rol === ROLES_GREMIO.TASTER);
    const abiertas = await Formula.find({ gremio: gremio._id, estado: ESTADOS_FORMULA.VOTING_OPEN });

    for (const formula of abiertas) {
      // las 48h cuentan desde la apertura, o desde que lo nombraron si fue despues
      const inicio = Math.max(
        new Date(formula.fechaApertura || formula.createdAt).getTime(),
        new Date(gremio.catadorDesde || 0).getTime(),
      );
      if (Date.now() - inicio < limite) continue;

      const yaVoto = await Voto.exists({ formula: formula._id, usuario: catador.usuario });
      if (!yaVoto) {
        catador.rol = ROLES_GREMIO.APPRENTICE;
        gremio.catadorDesde = null;
        await gremio.save();
        await auditoria.registrar({
          accion: "CATADOR_REMOVIDO",
          gremio: gremio._id,
          formula: formula._id,
          detalle: { usuario: catador.usuario, motivo: "No voto dentro de las 48 horas" },
        });
        console.log(`[job] El catador del gremio ${gremio.nombre} perdio su rol por no votar`);
        break; // ya no es catador, no hay que revisar mas formulas de este gremio
      }
    }
  }
}

async function ejecutarJobs() {
  try {
    await cerrarVotacionesVencidas();
    await revisarCatadores();
  } catch (e) {
    console.error("[job] Error ejecutando las tareas automaticas:", e.message);
  }
}

function iniciarJobs() {
  ejecutarJobs(); // una vez al arrancar
  return setInterval(ejecutarJobs, CADA_MINUTO);
}

module.exports = { iniciarJobs, ejecutarJobs, cerrarVotacionesVencidas, revisarCatadores };
