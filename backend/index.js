require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { iniciarJobs } = require("./jobs/formulaJobs");

const PORT = process.env.PORT || 3000;

// primero conectamos a la bd y despues si levantamos el servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
    // tareas automaticas (cerrar votaciones vencidas, revisar catador)
    iniciarJobs();
  })
  .catch(() => {
    console.log("No se pudo iniciar el servidor por que fallo la bd");
    process.exit(1);
  });
