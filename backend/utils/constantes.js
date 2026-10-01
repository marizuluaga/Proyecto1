// Constantes del dominio, las ponemos aca para no repetirlas en todo el codigo

const ESPECIALIDADES = ["Herbalist", "Runist", "Taster", "Brewmaster"];

const ROLES_GREMIO = {
  GRANDMASTER: "Grandmaster", // dueño, solo 1
  SENIOR: "SeniorAlchemist", // moderador, max 3
  TASTER: "Taster", // Catador Oficial, max 1
  APPRENTICE: "Apprentice", // miembro normal
};

const MAX_SENIORS = 3;

const ESTADOS_FORMULA = {
  PROPOSAL: "Proposal",
  VOTING_OPEN: "VotingOpen",
  CLOSED: "Closed",
  DISTILLED: "Distilled",
};

// Maquina de estados: desde cada estado a cual se puede pasar
// (si no esta aca, la transicion NO es valida)
const TRANSICIONES = {
  Proposal: ["VotingOpen"],
  VotingOpen: ["Closed"],
  Closed: ["Distilled"],
  Distilled: [], // estado final
};

// Las 3 categorias con sus 2 opciones exactas
const CATEGORIAS = {
  ingrediente: ["Mandrake Root", "Stardust Powder"],
  metodo: ["Blue Flame", "Arcane Water Bath"],
  frasco: ["Moon Crystal", "Silver Skull"],
};

// Pesos de ingredientes y metodos para calcular dificultad y rareza
// (el enunciado no los dice, entonces los definimos nosotros)
const PESO_INGREDIENTE = {
  "Mandrake Root": 2,
  "Stardust Powder": 3,
};
const PESO_METODO = {
  "Blue Flame": 1,
  "Arcane Water Bath": 2,
};

// Que categoria "potencia" cada especialidad
const BONUS_ESPECIALIDAD = {
  Herbalist: "ingrediente",
  Runist: "metodo",
  Taster: "frasco",
};
const MULTIPLICADOR_ESPECIALIDAD = 1.5; // si vota en su categoria
const MULTIPLICADOR_BREWMASTER = 1.2; // en todas las categorias
const MULTIPLICADOR_CATADOR = 2; // voto doble del catador oficial

const MAX_DIAS_FORMULA = 7;
const HORAS_LIMITE_CATADOR = 48;

module.exports = {
  ESPECIALIDADES,
  ROLES_GREMIO,
  MAX_SENIORS,
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
  HORAS_LIMITE_CATADOR,
};
