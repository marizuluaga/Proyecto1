# Potion Lab

**Proyecto 1 · Ingeniería Web · Universidad EIA**

Aplicación web en la que los usuarios crean gremios, proponen fórmulas y votan por sus ingredientes. El resultado de cada votación se guarda como una poción en el grimorio del gremio.

| | |
|---|---|
| Frontend | Pendiente de desplegar |
| API | Pendiente de desplegar |
| Swagger | Pendiente de desplegar |

## 👥 Integrantes

| Nombre | GitHub |
|---|---|
| Mariana Zuluaga | [@marizuluaga](https://github.com/marizuluaga) |

## 🛠️ Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend (Entrega 1) | React 19, Vite, React Router, Context API, Tailwind CSS 4 |
| Backend (Entrega 2) | Node.js, Express 5, MongoDB + Mongoose, JWT, bcryptjs, express-validator, Swagger UI |
| Despliegue | Render (API), MongoDB Atlas (BD), Vercel o Netlify (front) |

## 📁 Estructura del repositorio

```
Proyecto1/
├── frontend/          # Entrega 1 - React
│   └── src/
│       ├── components/   # componentes reutilizables (Button, Card, Input, GremioCard...)
│       ├── pages/        # vistas (Login, Gremios, GremioDetalle, FormulaDetalle...)
│       ├── context/      # AuthContext y ThemeContext
│       ├── hooks/        # useAuth, useFetch, useForm, useTheme
│       ├── services/     # api.js (fetch al backend)
│       └── utils/        # constantes
├── backend/           # Entrega 2 - API REST
│   ├── config/  models/  services/  controllers/
│   ├── routes/  middlewares/  utils/  jobs/  seed/  docs/
│   └── app.js / index.js
└── render.yaml        # despliegue del backend en Render
```

## 🚀 Cómo correrlo en local

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # y poner la MONGODB_URI y el JWT_SECRET
npm run seed              # datos de prueba (borra la BD)
npm run dev               # http://localhost:3000  ·  Swagger en /api-docs
```

**2. Frontend** 
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm run dev               # http://localhost:5173
```

**Usuarios de prueba** (contraseña `123456`):
- `mariana.zuluaga@eia.edu.co` → admin, Gran Maestro del *Círculo de la Mandrágora*
- `daniel.ospina@eia.edu.co` → Catador Oficial
- `laura.gomez@eia.edu.co` → Alquimista Senior
- `santiago.restrepo@eia.edu.co` → Aprendiz

Código del gremio privado: `LUNA26`

## ✨ Funcionalidades

- Registro / login / logout con JWT y especialidad alquímica (Herbalist, Runist, Taster, Brewmaster)
- Gremios públicos y privados (código de 6 caracteres), roles: Gran Maestro, Senior (máx. 3), Catador Oficial y Aprendiz
- Fórmulas con máquina de estados: **Proposal → VotingOpen → Closed → Distilled**
- Votación por categoría con peso según la especialidad, voto doble y veto del Catador
- Resultados "en vivo" (polling cada 5 segundos)
- Desempates: Catador → Gran Maestro → aleatorio (todo queda en auditoría)
- Grimorio con buscador, ranking del gremio y penalización por baja participación
- Modo oscuro 🌙 y diseño responsive

