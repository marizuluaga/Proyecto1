const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { verificarValidaciones } = require("../middlewares/validators");
const { autenticar } = require("../middlewares/auth");
const { ESPECIALIDADES } = require("../utils/constantes");

const router = express.Router();

const validarRegistro = [
  body("nombre").notEmpty().withMessage("El nombre completo es obligatorio").trim(),
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no es válido"),
  // TODO: preguntarle a la profe si toca validar que sea @eia.edu.co
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("especialidad")
    .isIn(ESPECIALIDADES)
    .withMessage("La especialidad debe ser Herbalist, Runist, Taster o Brewmaster"),
  body("avatarUrl").optional({ values: "null" }).isURL().withMessage("El avatar debe ser una URL"),
];

const validarLogin = [
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

const validarPerfil = [
  body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacio"),
  body("especialidad").optional().isIn(ESPECIALIDADES).withMessage("Especialidad inválida"),
  body("avatarUrl").optional({ values: "null" }).isURL().withMessage("El avatar debe ser una URL"),
];

router.post("/registrar", validarRegistro, verificarValidaciones, authController.registrar);
router.post("/login", validarLogin, verificarValidaciones, authController.login);
router.post("/logout", autenticar, authController.logout);
router.get("/perfil", autenticar, authController.perfil);
router.put("/perfil", autenticar, validarPerfil, verificarValidaciones, authController.actualizarPerfil);

module.exports = router;
