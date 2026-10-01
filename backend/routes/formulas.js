const express = require("express");
const { body, param } = require("express-validator");
const formulaController = require("../controllers/formulaController");
const { autenticar } = require("../middlewares/auth");
const { verificarValidaciones } = require("../middlewares/validators");
const { CATEGORIAS } = require("../utils/constantes");

const router = express.Router();
router.use(autenticar);

// los permisos por rol se revisan en el service porque primero hay que
// buscar a que gremio pertenece la formula
const validarVoto = [
  body("categoria")
    .isIn(Object.keys(CATEGORIAS))
    .withMessage("La categoria debe ser ingrediente, metodo o frasco"),
  body("opcion").notEmpty().withMessage("Debe enviar la opcion"),
];

const validarEdicion = [
  body("nombrePocion").optional().notEmpty().isLength({ max: 50 }).withMessage("Nombre de 1 a 50 caracteres").trim(),
  body("efectoDeseado").optional().notEmpty().isLength({ max: 200 }).withMessage("Efecto de 1 a 200 caracteres").trim(),
  body("dificultad").optional().isInt({ min: 1, max: 4 }).withMessage("La dificultad debe ser de 1 a 4").toInt(),
  body("fechaFin").optional().isISO8601().withMessage("Fecha de fin inválida"),
];

router.get("/:id", formulaController.obtener);
router.put("/:id", validarEdicion, verificarValidaciones, formulaController.actualizar); // solo en Proposal
router.delete("/:id", formulaController.eliminar); // solo en Proposal
router.patch("/:id/abrir", formulaController.abrir); // Proposal -> VotingOpen
router.patch("/:id/cerrar", formulaController.cerrar); // VotingOpen -> Closed -> Distilled
router.post("/:id/votos", validarVoto, verificarValidaciones, formulaController.votar);
router.delete(
  "/:id/votos/:categoria",
  param("categoria").isIn(Object.keys(CATEGORIAS)).withMessage("Categoria inválida"),
  verificarValidaciones,
  formulaController.retirarVoto,
);
router.get("/:id/resultados", formulaController.resultados); // para el polling del front
router.post("/:id/veto", validarVoto, verificarValidaciones, formulaController.vetar);

module.exports = router;
