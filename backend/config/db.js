const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a mongoDB correctamente");
  } catch (error) {
    console.error(`Error al conectar con mongoDB ${error}`);
    throw error;
  }
}
module.exports = connectDB;
