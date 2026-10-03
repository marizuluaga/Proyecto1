# Guía de despliegue

## 1. Base de datos en MongoDB Atlas
1. Entrar a https://cloud.mongodb.com y crear un proyecto y un cluster **M0 (Free)**.
2. En el asistente de seguridad, crear un usuario de base de datos con permiso de lectura y escritura. Este usuario es diferente a la cuenta con la que se inicia sesión en Atlas.
3. Agregar la IP actual para poder probar desde el computador.
4. Para la entrega en Render, agregar temporalmente `0.0.0.0/0` en **Network Access**. Esta opción permite conexiones desde cualquier IP, por lo que se debe usar una contraseña fuerte.
5. En **Connect → Drivers** copiar la URI y agregarle el nombre de la base:
   ```
   mongodb+srv://potionlab:CLAVE@cluster0.xxxxx.mongodb.net/potion-lab
   ```
6. Si la contraseña tiene caracteres especiales, codificarlos para una URI. Por ejemplo, `@` se convierte en `%40`.
7. Copiar `backend/.env.example` como `backend/.env`, pegar la URI y crear un `JWT_SECRET` largo. Se puede generar con `openssl rand -hex 32`.
8. Desde `backend`, comprobar primero la conexión:
   ```bash
   npm run db:check
   ```
9. Cuando la conexión sea correcta, cargar los datos de prueba:
   ```bash
   npm run seed
   ```
   El seed borra los datos que ya existan en esa base.

## 2. Backend en Render
1. Entrar a https://render.com con la cuenta de GitHub.
2. **New → Web Service** → escoger el repo `Proyecto1`.
3. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
4. En **Environment** agregar las variables:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | la URI de Atlas |
   | `JWT_SECRET` | un texto largo cualquiera |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | la URL del front (cuando exista) |
5. **Create Web Service** y esperar que diga *Live*.
6. Probar: `https://potion-lab-api.onrender.com/health` y `https://potion-lab-api.onrender.com/api-docs`

> Ojo: en el plan gratis Render "duerme" el servidor; la primera petición puede tardar ~50 s.

(También se puede usar el archivo `render.yaml` de la raíz con **New → Blueprint**.)

## 3. Frontend en Vercel (o Netlify)
1. Entrar a https://vercel.com con GitHub → **Add New Project** → repo `Proyecto1`.
2. **Root Directory:** `frontend` (Vercel detecta Vite solo).
3. En **Environment Variables** agregar:
   `VITE_API_URL = https://potion-lab-api.onrender.com/api`
4. **Deploy**.
5. Volver a Render y poner `https://proyecto1-mocha.vercel.app` en `CORS_ORIGIN`.

`frontend/vercel.json` y `frontend/public/_redirects` ya están para que las rutas de React no den 404 al recargar.

## 4. Actualizar el README
Poner las tres URLs reales en la tabla del inicio del `README.md` y probarlas en una ventana privada.
