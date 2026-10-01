const express = require("express");
const { body } = require("express-validator");
const gremioController = require("../controllers/gremioController");
const { autenticar } = require("../middlewares/auth");
const { verificarRolGremio } = require("../middlewares/gremioRol");
const { verificarValidaciones } = require("../middlewares/validators");
const { ROLES_GREMIO } = require("../utils/constantes");

const router = express.Router();
const { GRANDMASTER, SENIOR } = ROLES_GREMIO;

// todas las rutas de gremios necesitan estar logueado
router.use(autenticar);

const validarGremio = [
  body("nombre").notEmpty().withMessage("El nombre del gremio es obligatorio").trim(),
  body("lema").optional().isLength({ max: 150 }).withMessage("El lema es muy largo"),
  body("emblemaUrl").optional().isURL().withMessage("El emblema debe ser una URL"),
  body("tipo").isIn(["Public", "Private"]).withMessage("El tipo debe ser Public o Private"),
];

// en el PUT todo es opcional
const validarEdicionGremio = [
  body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacio").trim(),
  body("lema").optional().isLength({ max: 150 }).withMessage("El lema es muy largo"),
  body("emblemaUrl").optional().isURL().withMessage("El emblema debe ser una URL"),
  body("tipo").optional().isIn(["Public", "Private"]).withMessage("El tipo debe ser Public o Private"),
];

const validarFormula = [
  body("nombrePocion")
    .notEmpty()
    .withMessage("El nombre de la pocion es obligatorio")
    .isLength({ max: 50 })
    .withMessage("Maximo 50 caracteres")
    .trim(),
  body("efectoDeseado")
    .notEmpty()
    .withMessage("El efecto deseado es obligatorio")
    .isLength({ max: 200 })
    .withMessage("Maximo 200 caracteres")
    .trim(),
  body("dificultad")
    .isInt({ min: 1, max: 4 })
    .withMessage("La dificultad debe ser 1 (Easy), 2 (Medium), 3 (Hard) o 4 (Arcane)")
    .toInt(),
  body("fechaFin").isISO8601().withMessage("La fecha de fin debe tener formato de fecha (ISO)"),
];

// Gremios
router.get("/", gremioController.listar);
router.post("/", validarGremio, verificarValidaciones, gremioController.crear);
router.post("/unirse", gremioController.unirseConCodigo); // con el codigo de 6 caracteres
router.get("/:gremioId", gremioController.obtener);
router.put(
  "/:gremioId",
  verificarRolGremio(GRANDMASTER),
  validarEdicionGremio,
  verificarValidaciones,
  gremioController.actualizar,
);
router.delete("/:gremioId", verificarRolGremio(GRANDMASTER), gremioController.eliminar);
router.post("/:gremioId/unirse", gremioController.unirse);

// Miembros y roles
router.get("/:gremioId/miembros", verificarRolGremio(), gremioController.miembros);
router.patch(
  "/:gremioId/miembros/:usuarioId/rol",
  verificarRolGremio(GRANDMASTER),
  body("rol").notEmpty().withMessage("Debe enviar el rol"),
  verificarValidaciones,
  gremioController.cambiarRol,
);
// salir del gremio (uno mismo) o expulsar (Grandmaster)
router.delete("/:gremioId/miembros/:usuarioId", verificarRolGremio(), gremioController.quitarMiembro);
router.post(
  "/:gremioId/catador",
  verificarRolGremio(GRANDMASTER),
  body("usuarioId").isMongoId().withMessage("usuarioId inválido"),
  verificarValidaciones,
  gremioController.nombrarCatador,
);

// Formulas del gremio (solo Senior y Grandmaster crean)
router.get("/:gremioId/formulas", verificarRolGremio(), gremioController.listarFormulas);
router.post(
  "/:gremioId/formulas",
  verificarRolGremio(GRANDMASTER, SENIOR),
  validarFormula,
  verificarValidaciones,
  gremioController.crearFormula,
);

// Ranking, Grimorio y Auditoria
router.get("/:gremioId/ranking", verificarRolGremio(), gremioController.ranking);
router.get("/:gremioId/grimorio", verificarRolGremio(), gremioController.grimorio);
router.get(
  "/:gremioId/auditoria",
  verificarRolGremio(GRANDMASTER, SENIOR),
  gremioController.auditoria,
);

module.exports = router;
