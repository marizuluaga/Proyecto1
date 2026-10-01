// Documentacion de la API con Swagger (OpenAPI 3)
// se ve en http://localhost:3000/api-docs

const seguridad = [{ bearerAuth: [] }];
const idPath = (nombre, desc) => ({ name: nombre, in: "path", required: true, schema: { type: "string" }, description: desc });
const ok = (desc) => ({ description: desc });
const errores = {
  400: ok("Datos inválidos o regla de negocio no cumplida"),
  401: ok("No autenticado (token faltante, inválido o expirado)"),
  403: ok("Sin permisos para esta acción"),
  404: ok("No encontrado"),
};
const json = (schema) => ({ required: true, content: { "application/json": { schema } } });

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Potion Lab API",
    version: "1.0.0",
    description:
      "API del Laboratorio Colaborativo de Pociones (Proyecto 1 - Ingenieria Web). " +
      "Para probar las rutas protegidas: hacer login, copiar el token y darle al boton Authorize.",
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  tags: [
    { name: "Auth" },
    { name: "Usuarios (admin)" },
    { name: "Gremios" },
    { name: "Formulas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Registro: {
        type: "object",
        required: ["nombre", "email", "password", "especialidad"],
        properties: {
          nombre: { type: "string", example: "Mariana Zuluaga" },
          email: { type: "string", example: "mariana@eia.edu.co" },
          password: { type: "string", example: "123456" },
          especialidad: { type: "string", enum: ["Herbalist", "Runist", "Taster", "Brewmaster"] },
          avatarUrl: { type: "string", example: "https://i.pravatar.cc/150" },
        },
      },
      Login: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "mariana.zuluaga@eia.edu.co" },
          password: { type: "string", example: "123456" },
        },
      },
      Gremio: {
        type: "object",
        required: ["nombre", "tipo"],
        properties: {
          nombre: { type: "string", example: "Los del Caldero Azul" },
          lema: { type: "string", example: "Hervir es vivir" },
          emblemaUrl: { type: "string", example: "https://i.imgur.com/emblema.png" },
          tipo: { type: "string", enum: ["Public", "Private"] },
        },
      },
      Formula: {
        type: "object",
        required: ["nombrePocion", "efectoDeseado", "dificultad", "fechaFin"],
        properties: {
          nombrePocion: { type: "string", maxLength: 50, example: "Elixir de la Suerte" },
          efectoDeseado: { type: "string", maxLength: 200, example: "Da suerte por un dia" },
          dificultad: { type: "integer", minimum: 1, maximum: 4, description: "1 Easy, 2 Medium, 3 Hard, 4 Arcane" },
          fechaFin: { type: "string", format: "date-time", description: "Maximo 7 dias desde la creacion" },
        },
      },
      Voto: {
        type: "object",
        required: ["categoria", "opcion"],
        properties: {
          categoria: { type: "string", enum: ["ingrediente", "metodo", "frasco"] },
          opcion: {
            type: "string",
            example: "Mandrake Root",
            description:
              "ingrediente: Mandrake Root / Stardust Powder, metodo: Blue Flame / Arcane Water Bath, frasco: Moon Crystal / Silver Skull",
          },
        },
      },
    },
  },
  paths: {
    // ---------------- AUTH ----------------
    "/api/auth/registrar": {
      post: { tags: ["Auth"], summary: "Registrar usuario", requestBody: json({ $ref: "#/components/schemas/Registro" }), responses: { 201: ok("Usuario creado + token"), 400: errores[400] } },
    },
    "/api/auth/login": {
      post: { tags: ["Auth"], summary: "Iniciar sesion", requestBody: json({ $ref: "#/components/schemas/Login" }), responses: { 200: ok("Token JWT"), 401: errores[401] } },
    },
    "/api/auth/logout": {
      post: { tags: ["Auth"], summary: "Cerrar sesion (invalida el token)", security: seguridad, responses: { 200: ok("Sesion cerrada"), 401: errores[401] } },
    },
    "/api/auth/perfil": {
      get: { tags: ["Auth"], summary: "Ver mi perfil", security: seguridad, responses: { 200: ok("Perfil"), 401: errores[401] } },
      put: {
        tags: ["Auth"], summary: "Editar mi perfil", security: seguridad,
        requestBody: json({ type: "object", properties: { nombre: { type: "string" }, especialidad: { type: "string" }, avatarUrl: { type: "string" } } }),
        responses: { 200: ok("Perfil actualizado"), 400: errores[400] },
      },
    },

    // ---------------- USUARIOS (ADMIN) ----------------
    "/api/usuarios": {
      get: { tags: ["Usuarios (admin)"], summary: "Listar usuarios", security: seguridad, responses: { 200: ok("Lista"), 403: errores[403] } },
    },
    "/api/usuarios/{id}": {
      parameters: [idPath("id", "ID del usuario")],
      get: { tags: ["Usuarios (admin)"], summary: "Ver un usuario", security: seguridad, responses: { 200: ok("Usuario"), 404: errores[404] } },
      put: {
        tags: ["Usuarios (admin)"], summary: "Editar usuario (incluye el rol admin/user)", security: seguridad,
        requestBody: json({ type: "object", properties: { nombre: { type: "string" }, especialidad: { type: "string" }, role: { type: "string", enum: ["admin", "user"] } } }),
        responses: { 200: ok("Actualizado"), 403: errores[403] },
      },
      delete: { tags: ["Usuarios (admin)"], summary: "Eliminar usuario", security: seguridad, responses: { 200: ok("Eliminado"), 400: errores[400], 403: errores[403] } },
    },

    // ---------------- GREMIOS ----------------
    "/api/gremios": {
      get: { tags: ["Gremios"], summary: "Listar gremios", security: seguridad, parameters: [{ name: "tipo", in: "query", schema: { type: "string", enum: ["Public", "Private"] } }], responses: { 200: ok("Lista") } },
      post: { tags: ["Gremios"], summary: "Crear gremio (quedas de Grandmaster)", security: seguridad, requestBody: json({ $ref: "#/components/schemas/Gremio" }), responses: { 201: ok("Creado"), 400: errores[400] } },
    },
    "/api/gremios/unirse": {
      post: { tags: ["Gremios"], summary: "Unirse a un gremio privado con el codigo", security: seguridad, requestBody: json({ type: "object", properties: { codigo: { type: "string", example: "LUNA26" } } }), responses: { 200: ok("Unido"), 404: errores[404] } },
    },
    "/api/gremios/{gremioId}": {
      parameters: [idPath("gremioId", "ID del gremio")],
      get: { tags: ["Gremios"], summary: "Detalle del gremio", security: seguridad, responses: { 200: ok("Gremio"), 404: errores[404] } },
      put: { tags: ["Gremios"], summary: "Editar gremio (Grandmaster)", security: seguridad, requestBody: json({ $ref: "#/components/schemas/Gremio" }), responses: { 200: ok("Actualizado"), 403: errores[403] } },
      delete: { tags: ["Gremios"], summary: "Eliminar gremio (Grandmaster)", security: seguridad, responses: { 200: ok("Eliminado"), 403: errores[403] } },
    },
    "/api/gremios/{gremioId}/unirse": {
      parameters: [idPath("gremioId", "ID del gremio")],
      post: { tags: ["Gremios"], summary: "Unirse (publico libre, privado con codigo)", security: seguridad, requestBody: { content: { "application/json": { schema: { type: "object", properties: { codigo: { type: "string" } } } } } }, responses: { 200: ok("Unido"), 403: errores[403] } },
    },
    "/api/gremios/{gremioId}/miembros": {
      parameters: [idPath("gremioId", "ID del gremio")],
      get: { tags: ["Gremios"], summary: "Miembros con especialidad, rol y fecha de ingreso", security: seguridad, responses: { 200: ok("Lista") } },
    },
    "/api/gremios/{gremioId}/miembros/{usuarioId}": {
      parameters: [idPath("gremioId", "ID del gremio"), idPath("usuarioId", "ID del usuario")],
      delete: { tags: ["Gremios"], summary: "Salir del gremio o expulsar (Grandmaster)", security: seguridad, responses: { 200: ok("Retirado"), 403: errores[403] } },
    },
    "/api/gremios/{gremioId}/miembros/{usuarioId}/rol": {
      parameters: [idPath("gremioId", "ID del gremio"), idPath("usuarioId", "ID del usuario")],
      patch: { tags: ["Gremios"], summary: "Promover/degradar Senior (Grandmaster)", security: seguridad, requestBody: json({ type: "object", properties: { rol: { type: "string", enum: ["SeniorAlchemist", "Apprentice"] } } }), responses: { 200: ok("Rol cambiado"), 400: errores[400] } },
    },
    "/api/gremios/{gremioId}/catador": {
      parameters: [idPath("gremioId", "ID del gremio")],
      post: { tags: ["Gremios"], summary: "Nombrar Catador Oficial (Grandmaster)", security: seguridad, requestBody: json({ type: "object", properties: { usuarioId: { type: "string" } } }), responses: { 200: ok("Nombrado") } },
    },
    "/api/gremios/{gremioId}/formulas": {
      parameters: [idPath("gremioId", "ID del gremio")],
      get: { tags: ["Formulas"], summary: "Formulas del gremio", security: seguridad, parameters: [{ name: "estado", in: "query", schema: { type: "string", enum: ["Proposal", "VotingOpen", "Closed", "Distilled"] } }], responses: { 200: ok("Lista") } },
      post: { tags: ["Formulas"], summary: "Proponer formula (Senior/Grandmaster)", security: seguridad, requestBody: json({ $ref: "#/components/schemas/Formula" }), responses: { 201: ok("Creada"), 400: errores[400], 403: errores[403] } },
    },
    "/api/gremios/{gremioId}/ranking": {
      parameters: [idPath("gremioId", "ID del gremio")],
      get: { tags: ["Gremios"], summary: "Ranking de alquimistas", security: seguridad, responses: { 200: ok("Ranking") } },
    },
    "/api/gremios/{gremioId}/grimorio": {
      parameters: [idPath("gremioId", "ID del gremio")],
      get: {
        tags: ["Gremios"], summary: "Pociones del grimorio", security: seguridad,
        parameters: [{ name: "buscar", in: "query", schema: { type: "string" } }, { name: "orden", in: "query", schema: { type: "string", enum: ["rareza"] } }],
        responses: { 200: ok("Pociones") },
      },
    },
    "/api/gremios/{gremioId}/auditoria": {
      parameters: [idPath("gremioId", "ID del gremio")],
      get: { tags: ["Gremios"], summary: "Log de auditoria (Senior/Grandmaster)", security: seguridad, parameters: [{ name: "accion", in: "query", schema: { type: "string", example: "DESEMPATE" } }], responses: { 200: ok("Logs") } },
    },

    // ---------------- FORMULAS ----------------
    "/api/formulas/{id}": {
      parameters: [idPath("id", "ID de la formula")],
      get: { tags: ["Formulas"], summary: "Detalle de la formula", security: seguridad, responses: { 200: ok("Formula"), 404: errores[404] } },
      put: { tags: ["Formulas"], summary: "Editar formula (solo en Proposal)", security: seguridad, requestBody: json({ $ref: "#/components/schemas/Formula" }), responses: { 200: ok("Actualizada"), 400: errores[400] } },
      delete: { tags: ["Formulas"], summary: "Eliminar formula (solo en Proposal)", security: seguridad, responses: { 200: ok("Eliminada"), 400: errores[400] } },
    },
    "/api/formulas/{id}/abrir": {
      parameters: [idPath("id", "ID de la formula")],
      patch: { tags: ["Formulas"], summary: "Proposal -> VotingOpen (Senior/Grandmaster)", security: seguridad, responses: { 200: ok("Abierta"), 400: errores[400], 403: errores[403] } },
    },
    "/api/formulas/{id}/cerrar": {
      parameters: [idPath("id", "ID de la formula")],
      patch: { tags: ["Formulas"], summary: "VotingOpen -> Closed -> Distilled (Senior/Grandmaster)", security: seguridad, responses: { 200: ok("Cerrada y destilada"), 400: errores[400] } },
    },
    "/api/formulas/{id}/votos": {
      parameters: [idPath("id", "ID de la formula")],
      post: { tags: ["Formulas"], summary: "Votar o cambiar el voto", security: seguridad, requestBody: json({ $ref: "#/components/schemas/Voto" }), responses: { 201: ok("Voto registrado"), 200: ok("Voto actualizado"), 400: errores[400] } },
    },
    "/api/formulas/{id}/votos/{categoria}": {
      parameters: [idPath("id", "ID de la formula"), idPath("categoria", "ingrediente, metodo o frasco")],
      delete: { tags: ["Formulas"], summary: "Retirar mi voto de una categoria", security: seguridad, responses: { 200: ok("Retirado"), 404: errores[404] } },
    },
    "/api/formulas/{id}/resultados": {
      parameters: [idPath("id", "ID de la formula")],
      get: { tags: ["Formulas"], summary: "Resultados por categoria (para polling)", security: seguridad, responses: { 200: ok("Resultados") } },
    },
    "/api/formulas/{id}/veto": {
      parameters: [idPath("id", "ID de la formula")],
      post: { tags: ["Formulas"], summary: "Veto del Catador Oficial (1 por formula)", security: seguridad, requestBody: json({ $ref: "#/components/schemas/Voto" }), responses: { 200: ok("Veto aplicado"), 403: errores[403] } },
    },
  },
};

module.exports = swaggerSpec;
