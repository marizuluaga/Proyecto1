const mongoose = require("mongoose");

// Log de auditoria: transiciones de estado, desempates, vetos, etc.
const auditoriaSchema = new mongoose.Schema(
  {
    accion: {
      type: String,
      required: true,
      // ej: TRANSICION, DESEMPATE, VETO, CATADOR_REMOVIDO, PENALIZACION...
    },
    gremio: { type: mongoose.Schema.Types.ObjectId, ref: "Gremio" },
    formula: { type: mongoose.Schema.Types.ObjectId, ref: "Formula" },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }, // quien lo hizo (null si fue el sistema)
    detalle: { type: Object },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Auditoria", auditoriaSchema);
