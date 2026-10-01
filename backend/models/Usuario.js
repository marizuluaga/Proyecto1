const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ESPECIALIDADES } = require("../utils/constantes");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El email no es valido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña no puede ser menor a 6 caracteres"],
      select: false, //No devolver la contraseña en una consulta
    },
    especialidad: {
      type: String,
      required: [true, "La especialidad alquimica es obligatoria"],
      enum: {
        values: ESPECIALIDADES,
        message: "La especialidad debe ser Herbalist, Runist, Taster o Brewmaster",
      },
    },
    // rol global de la aplicacion (aparte de los roles dentro de cada gremio)
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "El rol debe ser admin o user",
      },
      default: "user",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: null, // es opcional
    },
    // penalizacion: si participa poco no puede crear formulas hasta esta fecha
    bloqueadoCrearHasta: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Middleware: hashea contraseña antes de guardar
// (en mongoose 8 si la funcion es async no se usa next)
usuarioSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compara contraseñas
usuarioSchema.methods.compararPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
