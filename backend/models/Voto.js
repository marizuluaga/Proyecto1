const mongoose = require("mongoose");
const { CATEGORIAS } = require("../utils/constantes");

const votoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    formula: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formula",
      required: true,
    },
    categoria: {
      type: String,
      required: true,
      enum: {
        values: Object.keys(CATEGORIAS),
        message: "La categoria debe ser ingrediente, metodo o frasco",
      },
    },
    opcion: {
      type: String,
      required: true,
    },
    // peso calculado segun especialidad y si es catador
    peso: {
      type: Number,
      default: 1,
    },
    esCatador: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// llave compuesta: un usuario solo puede votar 1 vez por categoria en cada formula
votoSchema.index({ usuario: 1, formula: 1, categoria: 1 }, { unique: true });

module.exports = mongoose.model("Voto", votoSchema);
