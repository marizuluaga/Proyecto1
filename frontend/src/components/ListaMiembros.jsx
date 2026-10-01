import Avatar from './Avatar'
import Badge from './Badge'
import { ROLES, formatearFecha } from '../utils/constantes'

const coloresRol = {
  Grandmaster: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  SeniorAlchemist: 'bg-pocion-100 text-pocion-700 dark:bg-pocion-900 dark:text-pocion-100',
  Taster: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  Apprentice: undefined,
}

// lista de miembros; si soyGrandmaster muestra los botones para cambiar roles
export default function ListaMiembros({ miembros, soyGrandmaster, miId, onCambiarRol, onCatador, onExpulsar }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {miembros.map((m) => (
        <li key={m.usuario._id} className="flex flex-wrap items-center gap-3 py-3">
          <Avatar nombre={m.usuario.nombre} url={m.usuario.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {m.usuario.nombre} {m.usuario._id === miId && <span className="text-xs text-slate-400">(tú)</span>}
            </p>
            <p className="text-xs text-slate-500">
              {m.especialidad} · desde {formatearFecha(m.fechaIngreso)}
            </p>
          </div>
          <Badge color={coloresRol[m.rol]}>{ROLES[m.rol]}</Badge>

          {soyGrandmaster && m.rol !== 'Grandmaster' && (
            <div className="flex w-full gap-1 sm:w-auto">
              {m.rol === 'SeniorAlchemist' ? (
                <button onClick={() => onCambiarRol(m, 'Apprentice')} className="rounded px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
                  Degradar
                </button>
              ) : (
                <button onClick={() => onCambiarRol(m, 'SeniorAlchemist')} className="rounded px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
                  Hacer Senior
                </button>
              )}
              {m.rol !== 'Taster' && (
                <button onClick={() => onCatador(m)} className="rounded px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
                  Nombrar catador
                </button>
              )}
              <button onClick={() => onExpulsar(m)} className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                Expulsar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
