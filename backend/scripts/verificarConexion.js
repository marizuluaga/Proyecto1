require("dotenv").config();
const mongoose = require("mongoose");

async function verificarConexion() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Conexion correcta. Base de datos: ${mongoose.connection.name}`);
  await mongoose.disconnect();
}

verificarConexion().catch(async (error) => {
  console.error(`No fue posible conectar con MongoDB: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
