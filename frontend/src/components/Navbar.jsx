import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import Avatar from './Avatar'

const claseLink = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-pocion-100 text-pocion-700 dark:bg-pocion-900 dark:text-pocion-100'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`

export default function Navbar() {
  const { usuario, estaLogueado, logout } = useAuth()
  const { tema, cambiarTema } = useTheme()
  const [abierto, setAbierto] = useState(false) // menu en celular
  const navigate = useNavigate()

  async function salir() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/pocion.svg" alt="" className="h-8 w-8" />
          <span className="font-titulo text-xl font-bold text-pocion-700 dark:text-pocion-100">Potion Lab</span>
        </Link>

        <button className="rounded-lg p-2 md:hidden" onClick={() => setAbierto(!abierto)} aria-label="Menú">
          ☰
        </button>

        <div
          className={`${abierto ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 dark:border-slate-800 dark:bg-slate-950 md:dark:bg-transparent`}
          onClick={() => setAbierto(false)}
        >
          {estaLogueado ? (
            <>
              <NavLink to="/gremios" className={claseLink}>
                Gremios
              </NavLink>
              <NavLink to="/gremios/nuevo" className={claseLink}>
                Crear gremio
              </NavLink>
              <NavLink to="/perfil" className={claseLink}>
                <span className="flex items-center gap-2">
                  <Avatar nombre={usuario.nombre} url={usuario.avatarUrl} tamaño="h-6 w-6" />
                  {usuario.nombre.split(' ')[0]}
                </span>
              </NavLink>
              <button onClick={salir} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/registro" className={claseLink}>
                Registrarme
              </NavLink>
            </>
          )}
          <button
            onClick={cambiarTema}
            className="rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Cambiar tema"
          >
            {tema === 'claro' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
    </header>
  )
}
