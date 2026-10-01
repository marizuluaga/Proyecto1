const mongoose = require("mongoose");

// Pociones del Grimorio del gremio (permanentes, no se borran)
const pocionSchema = new mongoose.Schema(
  {
    gremio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gremio",
      required: true,
    },
    formula: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formula",
      required: true,
      unique: true, // una formula solo genera una pocion
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    nombreFinal: { type: String, required: true },
    ingrediente: String,
    metodo: String,
    frasco: String,
    dificultadReal: Number,
    rareza: Number,
  },
  { timestamps: true },
);

// indice de texto para poder buscar en el grimorio
pocionSchema.index({ nombreFinal: "text" });

module.exports = mongoose.model("Pocion", pocionSchema);
