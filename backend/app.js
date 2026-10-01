const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const authRouter = require("./routes/auth");
const usuariosRouter = require("./routes/usuarios");
const gremiosRouter = require("./routes/gremios");
const formulasRouter = require("./routes/formulas");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// CORS: en produccion solo dejamos entrar al front (CORS_ORIGIN en el .env)
// si no esta definido deja pasar a todos (para desarrollo)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // para parsear el body de las peticiones

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    mensaje: "API DE POTION LAB - Laboratorio Colaborativo de Pociones",
    version: "1.0.0",
    documentacion: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      gremios: "/api/gremios",
      formulas: "/api/formulas",
    },
  });
});

// para revisar que el servidor este vivo (Render lo usa)
app.get("/health", (req, res) => {
  res.json({ estado: "ok", fecha: new Date() });
});

// Documentacion Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/gremios", gremiosRouter);
app.use("/api/formulas", formulasRouter);

// si ninguna ruta coincide
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada, petición no existe" });
});

app.use(errorHandler);

module.exports = app;
