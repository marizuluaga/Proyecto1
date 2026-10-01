# Guía de despliegue

## 1. Base de datos en MongoDB Atlas (gratis)
1. Entrar a https://cloud.mongodb.com y crear un cluster **M0 (Free)**.
2. En **Database Access** crear un usuario con contraseña (ej: `potionlab` / una clave sin caracteres raros).
3. En **Network Access** agregar `0.0.0.0/0` (para que Render se pueda conectar).
4. En **Connect → Drivers** copiar la URI y agregarle el nombre de la BD:
   ```
   mongodb+srv://potionlab:CLAVE@cluster0.xxxxx.mongodb.net/potion-lab
   ```
5. (Opcional) Llenar Atlas con los datos de prueba desde el computador:
   poner esa URI en `backend/.env` y correr `npm run seed`.

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
6. Probar: `https://TU-API.onrender.com/health` y `https://TU-API.onrender.com/api-docs`

> Ojo: en el plan gratis Render "duerme" el servidor; la primera petición puede tardar ~50 s.

(También se puede usar el archivo `render.yaml` de la raíz con **New → Blueprint**.)

## 3. Frontend en Vercel (o Netlify)
1. Entrar a https://vercel.com con GitHub → **Add New Project** → repo `Proyecto1`.
2. **Root Directory:** `frontend` (Vercel detecta Vite solo).
3. En **Environment Variables** agregar:
   `VITE_API_URL = https://TU-API.onrender.com/api`
4. **Deploy**.
5. Volver a Render y poner esa URL de Vercel en `CORS_ORIGIN`.

`frontend/vercel.json` y `frontend/public/_redirects` ya están para que las rutas de React no den 404 al recargar.

## 4. Actualizar el README
Poner las URLs reales en la tabla del inicio del `README.md`.
