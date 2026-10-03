# Revisión de las entregas 1 y 2

Este archivo resume qué demuestra el proyecto y qué falta antes de entregarlo. La idea es poder revisar cada punto sin memorizar todo el código.

## Entrega 1 Frontend React

- [x] El proyecto compila con `npm run build`.
- [x] Hay carpetas separadas para componentes, páginas, contextos, hooks, servicios y utilidades.
- [x] Hay componentes reutilizables con props, por ejemplo `Button`, `Input`, `Card` y `GremioCard`.
- [x] Están definidas las vistas de inicio, login, registro, gremios, detalle, fórmulas, perfil y página 404.
- [x] Los datos se consultan desde la API en `frontend/src/services/api.js`.
- [x] Los formularios son controlados y muestran errores por campo mediante `useForm`.
- [x] Se usa Context API para la sesión y para el tema claro u oscuro.
- [x] Los estilos son responsive y están hechos con Tailwind CSS.

## Entrega 2 Backend

- [x] La API está organizada por modelos, servicios, controladores, rutas, middlewares y utilidades.
- [x] Los modelos de Mongoose tienen validaciones como `required`, `enum`, `minlength`, `maxlength`, `min` y `max`.
- [x] Hay CRUD con `GET`, `POST`, `PUT` o `PATCH` y `DELETE`.
- [x] Hay registro, login, JWT y rutas protegidas.
- [x] Hay autorización global `admin/user` y roles dentro de cada gremio.
- [x] Hay validaciones con `express-validator`, manejo global de errores y códigos HTTP.
- [x] Existen `.env.example` y `.gitignore`; el archivo `.env` no debe subirse.
- [ ] Conectar el proyecto a MongoDB Atlas y ejecutar `npm run db:check`.
- [ ] Cargar datos de prueba con `npm run seed` solamente después de confirmar la base correcta.
- [ ] Desplegar la API y comprobar `/health` y `/api-docs`.
- [ ] Desplegar el frontend y comprobar que consume la API desplegada.
- [ ] Reemplazar las URLs pendientes del README por las URLs reales.

## MongoDB Atlas paso a paso

1. Entrar a MongoDB Atlas y crear un proyecto.
2. Crear un cluster gratuito y esperar a que quede disponible.
3. Crear un usuario de base de datos. Este usuario no es el mismo de la cuenta de Atlas.
4. Agregar la IP del computador a la lista de acceso. Para Render también se necesita permitir la conexión desde el servicio desplegado.
5. En el cluster, escoger `Connect`, luego `Drivers` y copiar la cadena que empieza por `mongodb+srv://`.
6. Crear `backend/.env` a partir de `backend/.env.example`.
7. Reemplazar `USUARIO`, `CLAVE` y `CLUSTER` en `MONGODB_URI`. La URI debe terminar en `/potion-lab` antes de los parámetros.
8. Poner un `JWT_SECRET` aleatorio de mínimo 32 caracteres.
9. Desde la carpeta `backend`, ejecutar `npm run db:check`.
10. Si la conexión es correcta, ejecutar `npm run seed`. Este comando borra los datos anteriores de esa base y carga los datos de demostración.
11. Ejecutar `npm run dev` y abrir `http://localhost:3000/api-docs`.

No se debe pegar la URI real, la contraseña de MongoDB ni el `JWT_SECRET` en GitHub, en el README o en capturas de pantalla.

## Pruebas rápidas antes de entregar

En `frontend`:

```bash
npm run build
npm run lint
```

En `backend`:

```bash
npm test
npm run db:check
npm run dev
```

Después se debe probar manualmente: registro, login, creación de un gremio, edición y eliminación de un recurso, una ruta de administrador, Swagger y la recarga de una ruta del frontend.

## Explicación corta para la sustentación

El frontend guarda la sesión en `AuthContext` y usa `api.js` para enviar el token al backend. En la API, las rutas validan los datos y llaman a un controlador. El controlador delega la lógica al servicio, y el servicio consulta los modelos de Mongoose. Los middlewares de autenticación y autorización bloquean las rutas cuando falta el token o el usuario no tiene el rol necesario. Los errores llegan a un middleware global que responde con el código HTTP adecuado.
