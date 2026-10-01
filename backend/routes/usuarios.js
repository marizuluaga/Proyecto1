const express = require("express");
const { body, param } = require("express-validator");
const usuarioController = require("../controllers/usuarioController");
const { autenticar, autorizar } = require("../middlewares/auth");
const { verificarValidaciones } = require("../middlewares/validators");
const { ESPECIALIDADES } = require("../utils/constantes");

const router = express.Router();

// todas estas rutas son solo para el admin
router.use(autenticar, autorizar("admin"));

const validarId = [param("id").isMongoId().withMessage("ID de usuario inválido")];

const validarActualizar = [
  body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacio").trim(),
  body("especialidad").optional().isIn(ESPECIALIDADES).withMessage("Especialidad inválida"),
  body("role").optional().isIn(["admin", "user"]).withMessage("El rol debe ser admin o user"),
  body("avatarUrl").optional({ values: "null" }).isURL().withMessage("El avatar debe ser una URL"),
];

router.get("/", usuarioController.listar);
router.get("/:id", validarId, verificarValidaciones, usuarioController.obtener);
router.put("/:id", validarId, validarActualizar, verificarValidaciones, usuarioController.actualizar);
router.delete("/:id", validarId, verificarValidaciones, usuarioController.eliminar);

module.exports = router;
