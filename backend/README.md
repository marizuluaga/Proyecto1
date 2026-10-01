# Potion Lab - Backend (Entrega 2) 🧪

Backend del **Proyecto 1: "Potion Lab" – Laboratorio Colaborativo de Pociones** para Ingenieria Web.

API REST hecha con Node.js + Express + MongoDB (mongoose) donde los alquimistas se registran, crean gremios, proponen formulas, votan por categorias y el sistema calcula la pocion resultante que queda guardada en el Grimorio del gremio.

## Tecnologias
- Node.js + Express 5
- MongoDB con Mongoose
- JWT (jsonwebtoken) para la autenticación
- bcryptjs para encriptar las contraseñas
- express-validator para validar los datos que llegan
- swagger-ui-express para la documentación (`/api-docs`)
- cors, morgan, dotenv
- nodemon (desarrollo)

## Arquitectura por capas
(la misma que vimos en clase con taskflow)
- config      # Conexion a BD
- models      # Schemas de Mongo (Usuario, Gremio, Formula, Voto, Pocion, Auditoria)
- services    # Lógica de negocio (maquina de estados, votos, desempates, ranking...)
- controllers # Manejo de req/res
- routes      # Definición de los endpoints
- middlewares # autenticar, autorizar (admin/user), rol dentro del gremio, errores, validaciones
- utils       # Funciones auxiliares y constantes
- jobs        # Tareas automaticas (cerrar votaciones vencidas, revisar catador)
- seed        # Datos de prueba
- docs        # swagger.js (documentación OpenAPI)
- app.js      # Configuración de express
- index.js    # Arranca el servidor

## Como correrlo
1. Instalar dependencias
```
npm install
```
2. Copiar `.env.example` como `.env` y poner la URI de mongo (local o Atlas) y el JWT_SECRET
3. Llenar la bd con los datos de prueba (OJO borra todo lo que haya)
```
npm run seed
```
4. Correr el servidor
```
npm run dev
```
Queda en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/api-docs`

## Variables de entorno
| Variable | Para que |
|---|---|
| PORT | puerto del servidor (Render lo pone solo) |
| NODE_ENV | development / production |
| MONGODB_URI | conexión a Mongo (local o Atlas) |
| JWT_SECRET | secreto para firmar los tokens |
| JWT_EXPIRES_IN | duración del token (7d) |
| CORS_ORIGIN | url del front permitida (vacío = todas) |

El `.env` está en el `.gitignore`, en el repo solo va el `.env.example`.

## Roles
Hay **dos niveles** de roles:
1. **Rol global** (`role` en el usuario): `admin` o `user`. Se valida con el middleware `autorizar("admin")` (en `middlewares/auth.js`). El admin puede gestionar usuarios y moderar cualquier gremio.
2. **Rol dentro del gremio**: Grandmaster, SeniorAlchemist, Taster, Apprentice. Se valida con `verificarRolGremio(...)` (en `middlewares/gremioRol.js`).

Todos los usuarios del seed tienen la contraseña `123456` (ej: `mariana.zuluaga@eia.edu.co`).
El gremio privado tiene el codigo `LUNA26`.

## Endpoints

Las rutas con 🔒 necesitan el header `Authorization: Bearer <token>`

### Auth `/api/auth`
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | /registrar | nombre, email, password, especialidad (Herbalist, Runist, Taster, Brewmaster), avatarUrl (opcional) |
| POST | /login | email, password -> devuelve el token |
| POST | /logout 🔒 | invalida el token |
| GET | /perfil 🔒 | datos del usuario logueado |
| PUT | /perfil 🔒 | actualizar nombre, especialidad o avatar |

### Usuarios `/api/usuarios` 🔒 (solo admin)
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | / | listar usuarios (`?especialidad=Runist&role=user`) |
| GET | /:id | ver un usuario |
| PUT | /:id | editar nombre, especialidad, avatar o role (admin/user) |
| DELETE | /:id | eliminar usuario (no deja si es Grandmaster de un gremio) |

### Gremios `/api/gremios` 🔒
| Metodo | Ruta | Quien | Descripcion |
|---|---|---|---|
| GET | / | todos | lista de gremios (`?tipo=Public`) |
| POST | / | todos | crear gremio (nombre, lema, emblemaUrl, tipo). El creador queda de Grandmaster |
| POST | /unirse | todos | unirse a un privado solo con `{ codigo }` |
| GET | /:gremioId | todos | detalle del gremio |
| PUT | /:gremioId | Grandmaster | editar nombre, lema, emblema o tipo |
| DELETE | /:gremioId | Grandmaster | eliminar gremio con sus formulas |
| DELETE | /:gremioId/miembros/:usuarioId | miembro / Grandmaster | salirse o expulsar |
| POST | /:gremioId/unirse | todos | unirse (publico libre, privado con `{ codigo }`) |
| GET | /:gremioId/miembros | miembros | miembros con especialidad, rol y fecha de ingreso |
| PATCH | /:gremioId/miembros/:usuarioId/rol | Grandmaster | `{ rol: "SeniorAlchemist" \| "Apprentice" }` (max 3 seniors) |
| POST | /:gremioId/catador | Grandmaster | nombrar Catador Oficial `{ usuarioId }` |
| GET | /:gremioId/formulas | miembros | formulas del gremio (`?estado=VotingOpen`) |
| POST | /:gremioId/formulas | Senior / Grandmaster | crear formula (nombrePocion, efectoDeseado, dificultad 1-4, fechaFin max 7 dias) |
| GET | /:gremioId/ranking | miembros | ranking de alquimistas |
| GET | /:gremioId/grimorio | miembros | pociones destiladas (`?buscar=moon&orden=rareza`) |
| GET | /:gremioId/auditoria | Senior / Grandmaster | log de transiciones, desempates, vetos (`?accion=DESEMPATE`) |

### Formulas `/api/formulas` 🔒
| Metodo | Ruta | Quien | Descripcion |
|---|---|---|---|
| GET | /:id | miembros | detalle + opciones de cada categoria |
| PUT | /:id | creador / Senior / Grandmaster | editar (solo en Proposal) |
| DELETE | /:id | creador / Senior / Grandmaster | eliminar (solo en Proposal) |
| PATCH | /:id/abrir | Senior / Grandmaster | Proposal -> VotingOpen |
| PATCH | /:id/cerrar | Senior / Grandmaster | VotingOpen -> Closed -> Distilled (auto) |
| POST | /:id/votos | miembros | `{ categoria, opcion }` crea o cambia el voto |
| DELETE | /:id/votos/:categoria | miembros | retirar mi voto |
| GET | /:id/resultados | miembros | resultados por categoria (conteo + %) para el polling |
| POST | /:id/veto | Catador Oficial | `{ categoria, opcion }` 1 vez por formula |

## Reglas de negocio que implementamos
- **Maquina de estados**: Proposal → VotingOpen → Closed → Distilled. Todas las transiciones pasan por `transicionar()` en `formulaService.js`, si no esta en la tabla de `TRANSICIONES` da error.
- **Voto unico**: indice unico compuesto `(usuario, formula, categoria)` en el modelo Voto. Si vuelve a votar en la misma categoria se actualiza (mientras este VotingOpen).
- **Peso del voto**:
  - Herbalist x1.5 en ingrediente, Runist x1.5 en metodo, Taster x1.5 en frasco (el enunciado no dice cuanto, nosotros escogimos 1.5)
  - Brewmaster x1.2 en todas
  - Catador Oficial x2 (voto doble)
- **Ganador**: mayoria simple con los votos ponderados. Empate → voto del Catador, si no Grandmaster, si no al azar. Todo desempate queda en auditoria.
- **Veto**: el catador veta una opcion de una categoria, esa opcion no puede ganar.
- **Catador 48h**: si el catador no vota en 48h desde que se abrio la votacion pierde el rol (job cada minuto).
- **Cierre automatico**: el job cierra las formulas cuya fechaFin ya paso y las destila.
- **Pocion resultante**:
  - Nombre = `[Ingrediente] + [Metodo] in [Frasco]`
  - Pesos: Mandrake Root 2, Stardust Powder 3, Blue Flame 1, Arcane Water Bath 2
  - Dificultad real = dificultad + peso ingrediente + peso metodo
  - Rareza = (dificultad real * 10) + (peso ingrediente * 3) + (peso metodo * 2)
- **Ranking**: +10 por formula creada, +20 por formula destilada, rareza total, precision como catador y participacion.
- **Penalizacion**: con menos de 30% de participacion en las ultimas 5 formulas no puede crear formulas por 7 dias.
- **Tiempo real**: por ahora con **polling**, el front consulta `GET /api/formulas/:id/resultados` cada pocos segundos.

## Seed
- 3 gremios (2 publicos, 1 privado)
- 12 usuarios (4 Herbalist, 3 Runist, 3 Taster, 2 Brewmaster)
- 10 formulas (2 Proposal, 3 VotingOpen, 2 Closed, 3 Distilled)
- 45 votos (con un empate en "Poción de Voz de Trueno" que lo decide el catador)
- 1 Catador Oficial (Daniel Ospina en el Círculo de la Mandrágora)

## Usuario admin
En el seed `mariana.zuluaga@eia.edu.co` queda con `role: admin`, los demas son `user`.

## Despliegue
Ver [DESPLIEGUE.md](../DESPLIEGUE.md) en la raiz del repo (Render + MongoDB Atlas).
