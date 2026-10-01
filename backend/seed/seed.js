// Script para llenar la base de datos con datos de prueba
// Uso: npm run seed   (OJO: borra todo lo que haya en la bd)
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Usuario = require("../models/Usuario");
const Gremio = require("../models/Gremio");
const Formula = require("../models/Formula");
const Voto = require("../models/Voto");
const Pocion = require("../models/Pocion");
const Auditoria = require("../models/Auditoria");
const formulaService = require("../services/formulaService");
const { ROLES_GREMIO, ESTADOS_FORMULA } = require("../utils/constantes");

const DIA = 24 * 60 * 60 * 1000;
const ahora = Date.now();
const { GRANDMASTER, SENIOR, TASTER, APPRENTICE } = ROLES_GREMIO;

// 12 usuarios: 4 Herbalist, 3 Runist, 3 Taster, 2 Brewmaster
// contraseña de todos: 123456
const usuariosData = [
  { nombre: "Laura Gómez", email: "laura.gomez@eia.edu.co", especialidad: "Herbalist" },
  { nombre: "Santiago Restrepo", email: "santiago.restrepo@eia.edu.co", especialidad: "Herbalist" },
  { nombre: "Valentina Ríos", email: "valentina.rios@eia.edu.co", especialidad: "Herbalist" },
  { nombre: "Mateo Cardona", email: "mateo.cardona@eia.edu.co", especialidad: "Herbalist" },
  { nombre: "Camila Henao", email: "camila.henao@eia.edu.co", especialidad: "Runist" },
  { nombre: "Juan Pablo Arango", email: "juanpablo.arango@eia.edu.co", especialidad: "Runist" },
  { nombre: "Sara Montoya", email: "sara.montoya@eia.edu.co", especialidad: "Runist" },
  { nombre: "Daniel Ospina", email: "daniel.ospina@eia.edu.co", especialidad: "Taster" },
  { nombre: "Isabella Vélez", email: "isabella.velez@eia.edu.co", especialidad: "Taster" },
  { nombre: "Tomás Quintero", email: "tomas.quintero@eia.edu.co", especialidad: "Taster" },
  { nombre: "Mariana Zuluaga", email: "mariana.zuluaga@eia.edu.co", especialidad: "Brewmaster", role: "admin" },
  { nombre: "Samuel Betancur", email: "samuel.betancur@eia.edu.co", especialidad: "Brewmaster" },
];

async function seed() {
  await connectDB();
  console.log("Borrando datos anteriores...");
  await Promise.all([
    Usuario.deleteMany({}),
    Gremio.deleteMany({}),
    Formula.deleteMany({}),
    Voto.deleteMany({}),
    Pocion.deleteMany({}),
    Auditoria.deleteMany({}),
  ]);
  await Voto.syncIndexes(); // para que exista el indice unico (usuario, formula, categoria)

  // ---------- USUARIOS ----------
  const u = [];
  for (const data of usuariosData) {
    // se usa save() uno por uno para que se ejecute el hash de la contraseña
    const usuario = new Usuario({ ...data, password: "123456" });
    await usuario.save();
    u.push(usuario);
  }
  console.log(`${u.length} usuarios creados`);

  // ---------- GREMIOS (2 publicos, 1 privado) ----------
  const miembro = (usuario, rol, diasAtras) => ({
    usuario: usuario._id,
    rol,
    fechaIngreso: new Date(ahora - diasAtras * DIA),
  });

  const gremioA = await Gremio.create({
    nombre: "Círculo de la Mandrágora",
    lema: "De la raíz nace el poder",
    emblemaUrl: "https://i.imgur.com/mandragora.png",
    tipo: "Public",
    miembros: [
      miembro(u[10], GRANDMASTER, 30),
      miembro(u[0], SENIOR, 28),
      miembro(u[4], SENIOR, 27),
      miembro(u[7], TASTER, 25), // el Catador Oficial
      miembro(u[1], APPRENTICE, 20),
      miembro(u[5], APPRENTICE, 18),
      miembro(u[8], APPRENTICE, 15),
      miembro(u[2], APPRENTICE, 10),
    ],
    catadorDesde: new Date(ahora - 3 * DIA),
  });

  const gremioB = await Gremio.create({
    nombre: "Hermandad del Caldero",
    lema: "Lo que hierve, une",
    emblemaUrl: "https://i.imgur.com/caldero.png",
    tipo: "Public",
    miembros: [
      miembro(u[11], GRANDMASTER, 29),
      miembro(u[3], SENIOR, 26),
      miembro(u[6], APPRENTICE, 22),
      miembro(u[9], APPRENTICE, 19),
      miembro(u[1], APPRENTICE, 12),
    ],
  });

  const gremioC = await Gremio.create({
    nombre: "Orden Secreta Lunar",
    lema: "Solo bajo la luna llena",
    emblemaUrl: "https://i.imgur.com/luna.png",
    tipo: "Private",
    codigoInvitacion: "LUNA26",
    miembros: [
      miembro(u[0], GRANDMASTER, 21),
      miembro(u[5], SENIOR, 20),
      miembro(u[2], APPRENTICE, 14),
      miembro(u[8], APPRENTICE, 9),
      miembro(u[11], APPRENTICE, 5),
    ],
  });
  console.log("3 gremios creados (codigo del privado: LUNA26)");

  // ---------- FORMULAS ----------
  // helper para crear formulas directo en la bd con el estado que queramos
  const crear = (gremio, creador, nombrePocion, efectoDeseado, dificultad, estado, diasApertura, diasFin) =>
    Formula.create({
      gremio: gremio._id,
      creador: creador._id,
      nombrePocion,
      efectoDeseado,
      dificultad,
      estado,
      fechaApertura: diasApertura !== null ? new Date(ahora - diasApertura * DIA) : null,
      fechaFin: new Date(ahora + diasFin * DIA),
    });

  const { PROPOSAL, VOTING_OPEN } = ESTADOS_FORMULA;
  // Las Closed y Distilled se crean como VotingOpen y despues se cierran con el service
  const f1 = await crear(gremioA, u[0], "Elixir del Amanecer", "Despierta al que lo toma con energia", 1, PROPOSAL, null, 5);
  const f2 = await crear(gremioA, u[4], "Tónico de Runas Vivas", "Hace brillar las runas escritas en la piel", 3, VOTING_OPEN, 1, 4);
  const f3 = await crear(gremioA, u[10], "Brebaje del Olvido Suave", "Olvidar solo lo que duele", 2, VOTING_OPEN, 0.5, 6);
  const f4 = await crear(gremioA, u[0], "Poción de Voz de Trueno", "La voz se escucha a kilometros", 2, VOTING_OPEN, 6, -1);
  const f5 = await crear(gremioA, u[4], "Esencia de Estrellas", "Permite ver en la oscuridad total", 4, VOTING_OPEN, 10, -3);
  const f6 = await crear(gremioA, u[10], "Filtro de la Calma", "Calma cualquier criatura furiosa", 1, VOTING_OPEN, 12, -5);
  const f7 = await crear(gremioC, u[5], "Rocío Lunar", "Solo funciona con luna llena", 3, PROPOSAL, null, 7);
  const f8 = await crear(gremioB, u[3], "Caldo de Gigante", "Aumenta la fuerza por una hora", 2, VOTING_OPEN, 2, 3);
  const f9 = await crear(gremioB, u[11], "Niebla Protectora", "Crea un escudo de niebla", 3, VOTING_OPEN, 5, -1);
  const f10 = await crear(gremioB, u[3], "Agua de Risa", "Hace reir sin parar por 10 minutos", 1, VOTING_OPEN, 9, -4);
  console.log("10 formulas creadas");

  // ---------- VOTOS (45) ----------
  let totalVotos = 0;
  async function votar(formula, gremio, usuario, ingrediente, metodo, frasco) {
    const m = gremio.obtenerMiembro(usuario._id);
    const esCatador = m.rol === TASTER;
    const votos = { ingrediente, metodo, frasco };
    for (const categoria of Object.keys(votos)) {
      if (!votos[categoria]) continue; // null = no voto en esa categoria
      await Voto.create({
        usuario: usuario._id,
        formula: formula._id,
        categoria,
        opcion: votos[categoria],
        esCatador,
        peso: formulaService.calcularPeso(usuario.especialidad, categoria, esCatador),
      });
      totalVotos++;
    }
  }
  const MR = "Mandrake Root", SP = "Stardust Powder";
  const BF = "Blue Flame", AW = "Arcane Water Bath";
  const MC = "Moon Crystal", SS = "Silver Skull";

  // F2 (VotingOpen) - 11 votos, el catador ya voto
  await votar(f2, gremioA, u[0], MR, AW, MC);
  await votar(f2, gremioA, u[4], SP, AW, MC);
  await votar(f2, gremioA, u[7], MR, BF, SS);
  await votar(f2, gremioA, u[1], MR, BF, null);
  // F3 (VotingOpen) - 4 votos (el catador todavia no vota)
  await votar(f3, gremioA, u[2], SP, BF, null);
  await votar(f3, gremioA, u[5], MR, AW, null);
  // F4 (quedara Closed) - 9 votos
  // ESCENARIO DE EMPATE en "metodo": Catador (1 x2 = 2) vs Santiago (1) + Valentina (1) = 2
  // -> decide el voto del Catador Oficial (Blue Flame)
  await votar(f4, gremioA, u[1], MR, AW, MC);
  await votar(f4, gremioA, u[0], MR, null, MC);
  await votar(f4, gremioA, u[8], SP, null, null);
  await votar(f4, gremioA, u[7], null, BF, SS);
  await votar(f4, gremioA, u[2], null, AW, null);
  // F5 (Distilled) - 8 votos
  await votar(f5, gremioA, u[0], SP, BF, MC);
  await votar(f5, gremioA, u[4], SP, AW, MC);
  await votar(f5, gremioA, u[10], MR, AW, null);
  // F6 (Distilled) - 6 votos
  await votar(f6, gremioA, u[5], MR, BF, SS);
  await votar(f6, gremioA, u[8], MR, AW, SS);
  // F8 (VotingOpen gremio B) - 3 votos
  await votar(f8, gremioB, u[6], SP, AW, null);
  await votar(f8, gremioB, u[9], null, null, MC);
  // F9 (Closed gremio B) - 2 votos
  await votar(f9, gremioB, u[3], MR, BF, null);
  // F10 (Distilled gremio B) - 2 votos
  await votar(f10, gremioB, u[11], SP, null, null);
  await votar(f10, gremioB, u[6], null, BF, null);
  console.log(`${totalVotos} votos creados`);

  // ---------- CERRAR / DESTILAR (usando la maquina de estados) ----------
  // Closed: se cierran pero NO se destilan (para tener el estado de prueba)
  for (const [formula, gremio] of [[f4, gremioA], [f9, gremioB]]) {
    formula.fechaCierre = new Date();
    await formulaService.transicionar(formula, ESTADOS_FORMULA.CLOSED, null, "Seed: cierre");
    formula.ganadores = await formulaService.calcularGanadores(formula, gremio);
    await formula.save();
  }
  // Distilled: flujo completo (cerrar -> calcular ganadores -> destilar -> grimorio)
  for (const formula of [f5, f6, f10]) {
    await formulaService.cerrarVotacion(formula._id, null);
  }

  // registramos en auditoria el nombramiento del catador
  await Auditoria.create({
    accion: "CATADOR_NOMBRADO",
    gremio: gremioA._id,
    usuario: u[10]._id,
    detalle: { nuevoCatador: u[7]._id, nota: "Seed" },
  });

  const resumen = await Formula.aggregate([{ $group: { _id: "$estado", total: { $sum: 1 } } }]);
  console.log("Formulas por estado:", resumen.map((r) => `${r._id}: ${r.total}`).join(", "));
  console.log(`Pociones en grimorios: ${await Pocion.countDocuments()}`);
  console.log("Catador Oficial: Daniel Ospina (Círculo de la Mandrágora)");
  console.log("Seed terminado :)  admin: mariana.zuluaga@eia.edu.co / 123456 (los demas son role user)");

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error("Error en el seed:", e);
  await mongoose.disconnect();
  process.exit(1);
});
