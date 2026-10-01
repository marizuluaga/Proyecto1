# Potion Lab – Frontend (Entrega 1)

Frontend en **React + Vite** con **Tailwind CSS**. Consume la API del backend (`VITE_API_URL`).

## Scripts
```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de produccion (carpeta dist/)
npm run preview  # ver el build
```

## Variables de entorno
Copiar `.env.example` como `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

## Estructura
```
src/
├── components/    # reutilizables
│   ├── Button, Input, Card, Badge, Alerta, Loader, Vacio, Tabs, Avatar
│   ├── Navbar, Footer, ProtectedRoute
│   ├── GremioCard, FormulaCard, PocionCard, EstadoBadge
│   ├── ListaMiembros, TablaRanking, CategoriaVoto, BarraResultado
├── pages/         # una por vista
├── context/       # AuthContext (usuario + token), ThemeContext (claro/oscuro)
├── hooks/         # useAuth, useTheme, useFetch (con polling), useForm (validacion)
├── services/api.js
└── utils/constantes.js
```

## Vistas
| Ruta | Vista | Protegida |
|---|---|---|
| `/` | Inicio | no |
| `/login` | Iniciar sesión | no |
| `/registro` | Registro con especialidad | no |
| `/gremios` | Lista de gremios, filtros, unirse con código | sí |
| `/gremios/nuevo` | Formulario crear gremio | sí |
| `/gremios/:id` | Detalle: fórmulas, miembros, ranking, grimorio | sí |
| `/gremios/:id/formulas/nueva` | Formulario proponer fórmula | sí |
| `/formulas/:id` | Votación en vivo, abrir/cerrar, veto | sí |
| `/perfil` | Editar perfil | sí |
| `*` | 404 | no |

## Lo que pide la rúbrica y donde esta
- **Componentes con props**: `src/components/` (ej. `Button` con variantes, `Input` con label/error, `CategoriaVoto`)
- **Formularios controlados con validación y feedback**: hook `useForm` + Login, Registro, CrearGremio, CrearFormula, Perfil (errores por campo, contador de caracteres, errores del servidor)
- **Context API**: `AuthContext` (sesión) y `ThemeContext` (modo oscuro)
- **Datos de API**: `services/api.js` + hook `useFetch`
- **Estilos**: Tailwind 4, responsive (menú hamburguesa en celular) y modo oscuro
