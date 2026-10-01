const mongoose = require("mongoose");
const { ESTADOS_FORMULA, CATEGORIAS } = require("../utils/constantes");

const formulaSchema = new mongoose.Schema(
  {
    gremio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gremio",
      required: true,
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    nombrePocion: {
      type: String,
      required: [true, "El nombre de la pocion es obligatorio"],
      maxlength: [50, "El nombre no puede tener mas de 50 caracteres"],
      trim: true,
    },
    efectoDeseado: {
      type: String,
      required: [true, "El efecto deseado es obligatorio"],
      maxlength: [200, "El efecto no puede tener mas de 200 caracteres"],
      trim: true,
    },
    // Easy=1 / Medium=2 / Hard=3 / Arcane=4
    dificultad: {
      type: Number,
      required: true,
      min: [1, "La dificultad minima es 1 (Easy)"],
      max: [4, "La dificultad maxima es 4 (Arcane)"],
    },
    estado: {
      type: String,
      enum: Object.values(ESTADOS_FORMULA),
      default: ESTADOS_FORMULA.PROPOSAL,
    },
    fechaFin: {
      type: Date,
      required: [true, "La fecha de fin es obligatoria"],
    },
    fechaApertura: { type: Date, default: null }, // cuando paso a VotingOpen
    fechaCierre: { type: Date, default: null },

    // veto del catador (solo 1 vez por formula)
    veto: {
      categoria: { type: String, enum: Object.keys(CATEGORIAS) },
      opcion: String,
      usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    },

    // se llena cuando se cierra la votacion
    ganadores: {
      ingrediente: String,
      metodo: String,
      frasco: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Formula", formulaSchema);
