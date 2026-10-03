function validarEntorno() {
  const faltantes = ["MONGODB_URI", "JWT_SECRET"].filter((nombre) => !process.env[nombre]);
  if (faltantes.length) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(", ")}`);
  }

  const secretosDeEjemplo = ["cambiar_este_secreto", "pon_aqui_un_secreto_de_32_caracteres_o_mas"];
  if (secretosDeEjemplo.includes(process.env.JWT_SECRET)) {
    throw new Error("JWT_SECRET todavia tiene el valor de ejemplo");
  }
}

module.exports = validarEntorno;
