const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
const app = require("../app");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

test("GET /health confirma que la API esta activa", async () => {
  const respuesta = await fetch(`${baseUrl}/health`);
  const datos = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(datos.estado, "ok");
});

test("una ruta protegida exige token", async () => {
  const respuesta = await fetch(`${baseUrl}/api/gremios`);
  const datos = await respuesta.json();

  assert.equal(respuesta.status, 401);
  assert.equal(datos.error, "Token no proporcionado");
});

test("el registro rechaza datos incompletos", async () => {
  const respuesta = await fetch(`${baseUrl}/api/auth/registrar`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "correo-invalido" }),
  });
  const datos = await respuesta.json();

  assert.equal(respuesta.status, 400);
  assert.equal(datos.error, "Datos inválidos");
  assert.ok(datos.errores.length >= 3);
});

test("una ruta inexistente devuelve 404", async () => {
  const respuesta = await fetch(`${baseUrl}/no-existe`);
  assert.equal(respuesta.status, 404);
});
