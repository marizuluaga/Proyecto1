const mongoose = require("mongoose");
const { ROLES_GREMIO } = require("../utils/constantes");

// sub-documento para cada miembro del gremio
const miembroSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    rol: {
      type: String,
      enum: Object.values(ROLES_GREMIO),
      default: ROLES_GREMIO.APPRENTICE,
    },
    fechaIngreso: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const gremioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del gremio es obligatorio"],
      trim: true,
      unique: true,
    },
    lema: {
      type: String,
      trim: true,
      maxlength: [150, "El lema no puede tener mas de 150 caracteres"],
    },
    emblemaUrl: {
      type: String,
      trim: true,
    },
    tipo: {
      type: String,
      enum: {
        values: ["Public", "Private"],
        message: "El tipo debe ser Public o Private",
      },
      default: "Public",
    },
    // solo los privados tienen codigo de 6 caracteres
    codigoInvitacion: {
      type: String,
      minlength: 6,
      maxlength: 6,
      default: null,
    },
    miembros: [miembroSchema],
    // fecha en que se nombro el catador oficial (para lo de las 48h)
    catadorDesde: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// metodo para buscar el rol de un usuario dentro del gremio
gremioSchema.methods.obtenerMiembro = function (usuarioId) {
  // (m.usuario._id por si el campo ya viene populado)
  return this.miembros.find(
    (m) => (m.usuario._id || m.usuario).toString() === usuarioId.toString(),
  );
};

module.exports = mongoose.model("Gremio", gremioSchema);
