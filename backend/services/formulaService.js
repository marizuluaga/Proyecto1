const mongoose = require("mongoose");
const Formula = require("../models/Formula");
const Gremio = require("../models/Gremio");
const Voto = require("../models/Voto");
const Pocion = require("../models/Pocion");
const auditoria = require("./auditoriaService");
const { crearError } = require("../utils/errores");
const {
  ROLES_GREMIO,
  ESTADOS_FORMULA,
  TRANSICIONES,
  CATEGORIAS,
  PESO_INGREDIENTE,
  PESO_METODO,
  BONUS_ESPECIALIDAD,
  MULTIPLICADOR_ESPECIALIDAD,
  MULTIPLICADOR_BREWMASTER,
  MULTIPLICADOR_CATADOR,
  MAX_DIAS_FORMULA,
} = require("../utils/constantes");

const UN_DIA = 24 * 60 * 60 * 1000;
// "admin" es el admin global de la app (puede moderar cualquier gremio)
const PUEDEN_GESTIONAR = [ROLES_GREMIO.GRANDMASTER, ROLES_GREMIO.SENIOR, "admin"];

// ============================================================
// HELPERS
// ============================================================

// busca la formula, su gremio y el rol del usuario (si es miembro)
async function cargarContexto(formulaId, usuarioId, usuario = null) {
  if (!mongoose.isValidObjectId(formulaId)) throw crearError(400, "ID de formula inválido");
  const formula = await Formula.findById(formulaId);
  if (!formula) throw crearError(404, "Formula no encontrada");

  const gremio = await Gremio.findById(formula.gremio);
  let miembro = null;
  if (usuarioId) {
    miembro = gremio.obtenerMiembro(usuarioId);
    // el admin puede gestionar aunque no sea miembro
    if (!miembro && usuario && usuario.role === "admin") miembro = { rol: "admin" };
    if (!miembro) throw crearError(403, "No eres miembro del gremio de esta formula");
  }
  return { formula, gremio, miembro };
}

// ============================================================
// MAQUINA DE ESTADOS
// ============================================================
// TODAS las transiciones pasan por esta funcion, asi nos aseguramos que
// nunca se salte un estado (ej: Proposal -> Distilled no se puede)
async function transicionar(formula, nuevoEstado, usuarioId = null, motivo = "") {
  const permitidos = TRANSICIONES[formula.estado] || [];
  if (!permitidos.includes(nuevoEstado)) {
    throw crearError(
      400,
      `Transición inválida: no se puede pasar de ${formula.estado} a ${nuevoEstado}`,
    );
  }
  const estadoAnterior = formula.estado;
  formula.estado = nuevoEstado;
  await formula.save();

  await auditoria.registrar({
    accion: "TRANSICION",
    gremio: formula.gremio,
    formula: formula._id,
    usuario: usuarioId,
    detalle: { de: estadoAnterior, a: nuevoEstado, motivo },
  });
  return formula;
}

// ============================================================
// PARTICIPACION Y PENALIZACION
// ============================================================

// % de participacion de un usuario en las ultimas N formulas del gremio
// (solo cuentan las que ya abrieron votacion)
async function calcularParticipacion(usuarioId, gremioId, ultimas = 5) {
  const formulas = await Formula.find({
    gremio: gremioId,
    estado: { $ne: ESTADOS_FORMULA.PROPOSAL },
  })
    .sort({ fechaApertura: -1 })
    .limit(ultimas)
    .select("_id");

  if (formulas.length === 0) return { total: 0, votadas: 0, porcentaje: null };

  const ids = formulas.map((f) => f._id);
  const votadas = await Voto.distinct("formula", { usuario: usuarioId, formula: { $in: ids } });
  return {
    total: formulas.length,
    votadas: votadas.length,
    porcentaje: Math.round((votadas.length / formulas.length) * 100),
  };
}

// Regla: si participa menos del 30% en las ultimas 5 formulas
// pierde la posibilidad de crear formulas por 7 dias
async function verificarPenalizacion(usuario, gremioId) {
  if (usuario.bloqueadoCrearHasta && usuario.bloqueadoCrearHasta > new Date()) {
    throw crearError(
      403,
      `Estas penalizado por baja participacion hasta ${usuario.bloqueadoCrearHasta.toISOString()}`,
    );
  }

  const participacion = await calcularParticipacion(usuario._id, gremioId, 5);
  // solo aplicamos la regla si ya hay 5 formulas para evaluar
  if (participacion.total >= 5 && participacion.porcentaje < 30) {
    usuario.bloqueadoCrearHasta = new Date(Date.now() + 7 * UN_DIA);
    await usuario.save();
    await auditoria.registrar({
      accion: "PENALIZACION",
      gremio: gremioId,
      usuario: usuario._id,
      detalle: { participacion, bloqueadoHasta: usuario.bloqueadoCrearHasta },
    });
    throw crearError(
      403,
      `Tu participacion en las ultimas 5 formulas es de ${participacion.porcentaje}% (minimo 30%). No puedes crear formulas por 7 dias`,
    );
  }
}

// ============================================================
// CRUD FORMULAS
// ============================================================

async function crearFormula(gremio, usuario, { nombrePocion, efectoDeseado, dificultad, fechaFin }) {
  await verificarPenalizacion(usuario, gremio._id);

  const ahora = new Date();
  const fin = new Date(fechaFin);
  if (isNaN(fin.getTime())) throw crearError(400, "La fecha de fin no es valida");
  if (fin <= ahora) throw crearError(400, "La fecha de fin debe ser en el futuro");
  if (fin - ahora > MAX_DIAS_FORMULA * UN_DIA) {
    throw crearError(400, `La fecha de fin no puede ser mayor a ${MAX_DIAS_FORMULA} dias desde hoy`);
  }

  const formula = await Formula.create({
    gremio: gremio._id,
    creador: usuario._id,
    nombrePocion,
    efectoDeseado,
    dificultad,
    fechaFin: fin,
  });

  await auditoria.registrar({
    accion: "FORMULA_CREADA",
    gremio: gremio._id,
    formula: formula._id,
    usuario: usuario._id,
    detalle: { estado: formula.estado },
  });
  return formula;
}

async function listarFormulas(gremioId, { estado } = {}) {
  const filtro = { gremio: gremioId };
  if (estado) filtro.estado = estado;
  return await Formula.find(filtro).populate("creador", "nombre especialidad").sort({ createdAt: -1 });
}

async function obtenerFormula(formulaId, usuarioId) {
  const { formula } = await cargarContexto(formulaId, usuarioId);
  await formula.populate("creador", "nombre especialidad");
  // agregamos las opciones de cada categoria para que el front las pinte
  return { ...formula.toObject(), categorias: CATEGORIAS };
}

// PUT: solo se puede editar mientras esta en Proposal
// (lo puede hacer el creador, un Senior o el Grandmaster)
async function verificarPuedeEditar(formula, miembro, usuario) {
  const esCreador = formula.creador.toString() === usuario._id.toString();
  if (!esCreador && !PUEDEN_GESTIONAR.includes(miembro.rol)) {
    throw crearError(403, "No tienes permiso para modificar esta formula");
  }
  if (formula.estado !== ESTADOS_FORMULA.PROPOSAL) {
    throw crearError(400, "Solo se pueden modificar formulas en estado Proposal");
  }
}

async function actualizarFormula(formulaId, usuario, { nombrePocion, efectoDeseado, dificultad, fechaFin }) {
  const { formula, miembro } = await cargarContexto(formulaId, usuario._id, usuario);
  await verificarPuedeEditar(formula, miembro, usuario);

  if (nombrePocion !== undefined) formula.nombrePocion = nombrePocion;
  if (efectoDeseado !== undefined) formula.efectoDeseado = efectoDeseado;
  if (dificultad !== undefined) formula.dificultad = dificultad;
  if (fechaFin !== undefined) {
    const fin = new Date(fechaFin);
    // los 7 dias se cuentan desde que se creo la formula
    const maximo = new Date(formula.createdAt).getTime() + MAX_DIAS_FORMULA * UN_DIA;
    if (isNaN(fin.getTime()) || fin <= new Date()) throw crearError(400, "La fecha de fin debe ser en el futuro");
    if (fin.getTime() > maximo) {
      throw crearError(400, `La fecha de fin no puede ser mayor a ${MAX_DIAS_FORMULA} dias desde la creacion`);
    }
    formula.fechaFin = fin;
  }
  await formula.save();
  return formula;
}

// DELETE: solo en Proposal (despues ya hay votos y queda en el historial)
async function eliminarFormula(formulaId, usuario) {
  const { formula, miembro } = await cargarContexto(formulaId, usuario._id, usuario);
  await verificarPuedeEditar(formula, miembro, usuario);
  await formula.deleteOne();

  await auditoria.registrar({
    accion: "FORMULA_ELIMINADA",
    gremio: formula.gremio,
    formula: formula._id,
    usuario: usuario._id,
    detalle: { nombrePocion: formula.nombrePocion },
  });
}

// ============================================================
// CAMBIOS DE ESTADO
// ============================================================

// Proposal -> VotingOpen (solo Senior o Grandmaster)
async function abrirVotacion(formulaId, usuario) {
  const { formula, miembro } = await cargarContexto(formulaId, usuario._id, usuario);
  if (!PUEDEN_GESTIONAR.includes(miembro.rol)) {
    throw crearError(403, "Solo un Senior Alchemist o el Grandmaster pueden abrir la votación");
  }
  if (formula.fechaFin <= new Date()) {
    throw crearError(400, "La fecha de fin de la formula ya paso, no se puede abrir");
  }
  formula.fechaApertura = new Date();
  return await transicionar(formula, ESTADOS_FORMULA.VOTING_OPEN, usuario._id, "Apertura manual");
}

// VotingOpen -> Closed (manual o automatico) y luego Closed -> Distilled (automatico)
// si usuario es null es porque lo hizo el sistema (job)
async function cerrarVotacion(formulaId, usuario = null) {
  const { formula, gremio, miembro } = await cargarContexto(
    formulaId,
    usuario ? usuario._id : null,
    usuario,
  );

  if (usuario && !PUEDEN_GESTIONAR.includes(miembro.rol)) {
    throw crearError(403, "Solo un Senior Alchemist o el Grandmaster pueden cerrar la votación");
  }

  formula.fechaCierre = new Date();
  const motivo = usuario ? "Cierre manual" : "Cierre automatico por fecha de fin";
  await transicionar(formula, ESTADOS_FORMULA.CLOSED, usuario ? usuario._id : null, motivo);

  // calculamos los ganadores de cada categoria
  formula.ganadores = await calcularGanadores(formula, gremio);
  await formula.save();

  // Closed -> Distilled es automatico
  const pocion = await destilar(formula);
  return { formula, pocion };
}

// ============================================================
// VOTACION
// ============================================================

// calcula el peso del voto segun la especialidad y si es el catador
function calcularPeso(especialidad, categoria, esCatador) {
  let peso = 1;
  if (especialidad === "Brewmaster") {
    peso = MULTIPLICADOR_BREWMASTER; // 1.2 en todas
  } else if (BONUS_ESPECIALIDAD[especialidad] === categoria) {
    peso = MULTIPLICADOR_ESPECIALIDAD; // bonus solo en su categoria
  }
  if (esCatador) peso = peso * MULTIPLICADOR_CATADOR; // voto doble
  return Math.round(peso * 100) / 100;
}

// crear o cambiar el voto (upsert) - 1 voto por categoria por usuario
async function votar(formulaId, usuario, { categoria, opcion }) {
  const { formula, miembro } = await cargarContexto(formulaId, usuario._id);

  if (formula.estado !== ESTADOS_FORMULA.VOTING_OPEN) {
    throw crearError(400, "La votación de esta formula no esta abierta");
  }
  if (formula.fechaFin <= new Date()) {
    throw crearError(400, "La votación ya termino (fecha de fin alcanzada)");
  }
  if (!CATEGORIAS[categoria]) {
    throw crearError(400, "Categoria inválida, debe ser ingrediente, metodo o frasco");
  }
  if (!CATEGORIAS[categoria].includes(opcion)) {
    throw crearError(400, `Opcion inválida para ${categoria}. Opciones: ${CATEGORIAS[categoria].join(" / ")}`);
  }

  const esCatador = miembro.rol === ROLES_GREMIO.TASTER;
  const peso = calcularPeso(usuario.especialidad, categoria, esCatador);

  // findOneAndUpdate con upsert: si ya voto en esa categoria lo actualiza
  const votoAnterior = await Voto.findOne({ usuario: usuario._id, formula: formula._id, categoria });
  const voto = await Voto.findOneAndUpdate(
    { usuario: usuario._id, formula: formula._id, categoria },
    { opcion, peso, esCatador },
    { upsert: true, new: true, runValidators: true },
  );

  return { voto, cambiado: !!votoAnterior };
}

// DELETE voto: retirar el voto de una categoria (solo con la votacion abierta)
async function retirarVoto(formulaId, usuario, categoria) {
  const { formula } = await cargarContexto(formulaId, usuario._id);
  if (formula.estado !== ESTADOS_FORMULA.VOTING_OPEN) {
    throw crearError(400, "Solo se puede retirar el voto mientras la votación esta abierta");
  }
  const voto = await Voto.findOneAndDelete({ usuario: usuario._id, formula: formula._id, categoria });
  if (!voto) throw crearError(404, "No tienes voto en esa categoria");
  return voto;
}

// resultados agregados por categoria (conteo + porcentaje)
// el front hace polling a este endpoint cada X segundos para ver en "tiempo real"
async function obtenerResultados(formulaId, usuarioId) {
  const { formula } = await cargarContexto(formulaId, usuarioId);
  const votos = await Voto.find({ formula: formula._id });

  const resultados = {};
  for (const categoria of Object.keys(CATEGORIAS)) {
    const votosCat = votos.filter((v) => v.categoria === categoria);
    const totalPeso = votosCat.reduce((acc, v) => acc + v.peso, 0);

    resultados[categoria] = CATEGORIAS[categoria].map((opcion) => {
      const votosOpcion = votosCat.filter((v) => v.opcion === opcion);
      const peso = votosOpcion.reduce((acc, v) => acc + v.peso, 0);
      return {
        opcion,
        votos: votosOpcion.length,
        votosPonderados: Math.round(peso * 100) / 100,
        porcentaje: totalPeso > 0 ? Math.round((peso / totalPeso) * 1000) / 10 : 0,
        vetada: formula.veto && formula.veto.categoria === categoria && formula.veto.opcion === opcion,
      };
    });
  }

  // tambien devolvemos lo que voto el usuario para marcarlo en la UI
  const misVotos = usuarioId
    ? votos.filter((v) => v.usuario.toString() === usuarioId.toString()).map((v) => ({ categoria: v.categoria, opcion: v.opcion }))
    : [];

  return {
    formula: formula._id,
    estado: formula.estado,
    fechaFin: formula.fechaFin,
    totalVotos: votos.length,
    resultados,
    ganadores: formula.ganadores,
    misVotos,
    actualizado: new Date(),
  };
}

// ============================================================
// VETO DEL CATADOR OFICIAL (1 vez por formula)
// ============================================================
// Lo interpretamos asi: el catador veta UNA opcion de UNA categoria
// y esa opcion no puede ganar (gana la otra)
async function vetar(formulaId, usuario, { categoria, opcion }) {
  const { formula, miembro } = await cargarContexto(formulaId, usuario._id);

  if (miembro.rol !== ROLES_GREMIO.TASTER) {
    throw crearError(403, "Solo el Catador Oficial puede usar el veto");
  }
  if (formula.estado !== ESTADOS_FORMULA.VOTING_OPEN) {
    throw crearError(400, "Solo se puede vetar mientras la votación esta abierta");
  }
  if (formula.veto && formula.veto.categoria) {
    throw crearError(400, "El veto ya fue usado en esta formula");
  }
  if (!CATEGORIAS[categoria] || !CATEGORIAS[categoria].includes(opcion)) {
    throw crearError(400, "Categoria u opcion inválida");
  }

  formula.veto = { categoria, opcion, usuario: usuario._id };
  await formula.save();

  await auditoria.registrar({
    accion: "VETO",
    gremio: formula.gremio,
    formula: formula._id,
    usuario: usuario._id,
    detalle: { categoria, opcion },
  });
  return formula;
}

// ============================================================
// CALCULO DE GANADORES Y DESEMPATE
// ============================================================
async function calcularGanadores(formula, gremio) {
  const votos = await Voto.find({ formula: formula._id });
  const grandmaster = gremio.miembros.find((m) => m.rol === ROLES_GREMIO.GRANDMASTER);
  const ganadores = {};

  for (const categoria of Object.keys(CATEGORIAS)) {
    const [opcionA, opcionB] = CATEGORIAS[categoria];

    // 1. si hay veto en esta categoria gana la otra opcion directamente
    if (formula.veto && formula.veto.categoria === categoria) {
      ganadores[categoria] = formula.veto.opcion === opcionA ? opcionB : opcionA;
      continue;
    }

    const votosCat = votos.filter((v) => v.categoria === categoria);
    const sumar = (op) => votosCat.filter((v) => v.opcion === op).reduce((a, v) => a + v.peso, 0);
    const totalA = Math.round(sumar(opcionA) * 100) / 100;
    const totalB = Math.round(sumar(opcionB) * 100) / 100;

    if (totalA !== totalB) {
      // mayoria simple (con los votos ponderados)
      ganadores[categoria] = totalA > totalB ? opcionA : opcionB;
      continue;
    }

    // 2. EMPATE -> decide el catador, si no el grandmaster, si no al azar
    let metodo;
    const votoCatador = votosCat.find((v) => v.esCatador);
    const votoGM = grandmaster
      ? votosCat.find((v) => v.usuario.toString() === grandmaster.usuario.toString())
      : null;

    if (votoCatador) {
      ganadores[categoria] = votoCatador.opcion;
      metodo = "Voto del Catador Oficial";
    } else if (votoGM) {
      ganadores[categoria] = votoGM.opcion;
      metodo = "Decision del Grandmaster";
    } else {
      ganadores[categoria] = Math.random() < 0.5 ? opcionA : opcionB;
      metodo = "Seleccion aleatoria";
    }

    // los desempates quedan en la auditoria
    await auditoria.registrar({
      accion: "DESEMPATE",
      gremio: formula.gremio,
      formula: formula._id,
      detalle: { categoria, totalA, totalB, metodo, ganador: ganadores[categoria] },
    });
  }
  return ganadores;
}

// ============================================================
// DESTILACION -> genera la pocion y la guarda en el Grimorio
// ============================================================
function calcularPocion(formula) {
  const { ingrediente, metodo, frasco } = formula.ganadores;
  const pesoIng = PESO_INGREDIENTE[ingrediente];
  const pesoMet = PESO_METODO[metodo];

  // Dificultad real = dificultad de la formula + peso ingrediente + peso metodo
  // (el enunciado dice "average of voted difficulty", como la dificultad la pone
  // el creador tomamos ese valor como base)
  const dificultadReal = formula.dificultad + pesoIng + pesoMet;
  const rareza = dificultadReal * 10 + pesoIng * 3 + pesoMet * 2;

  return {
    nombreFinal: `${ingrediente} + ${metodo} in ${frasco}`,
    ingrediente,
    metodo,
    frasco,
    dificultadReal,
    rareza,
  };
}

async function destilar(formula) {
  await transicionar(formula, ESTADOS_FORMULA.DISTILLED, null, "Destilacion automatica");
  const datos = calcularPocion(formula);
  const pocion = await Pocion.create({
    gremio: formula.gremio,
    formula: formula._id,
    creador: formula.creador,
    ...datos,
  });
  return pocion;
}

module.exports = {
  transicionar,
  calcularParticipacion,
  crearFormula,
  listarFormulas,
  obtenerFormula,
  actualizarFormula,
  eliminarFormula,
  retirarVoto,
  abrirVotacion,
  cerrarVotacion,
  votar,
  obtenerResultados,
  vetar,
  calcularGanadores,
  calcularPeso,
  calcularPocion,
  destilar,
};
