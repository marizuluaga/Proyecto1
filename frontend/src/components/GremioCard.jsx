import { Link } from 'react-router-dom'
import Card from './Card'
import Badge from './Badge'

export default function GremioCard({ gremio, esMiembro, onUnirse }) {
  return (
    <Card className="flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pocion-100 text-2xl dark:bg-pocion-900">
          {gremio.tipo === 'Private' ? '🔒' : '⚗️'}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-titulo text-lg font-bold">{gremio.nombre}</h3>
          <p className="text-sm italic text-slate-500">"{gremio.lema || 'Sin lema'}"</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{gremio.tipo === 'Private' ? 'Privado' : 'Público'}</Badge>
        <span className="text-xs text-slate-500">{gremio.totalMiembros} miembros</span>
      </div>
      <div className="mt-auto pt-2">
        {esMiembro ? (
          <Link
            to={`/gremios/${gremio._id}`}
            className="block rounded-lg bg-pocion-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-pocion-700"
          >
            Entrar al gremio
          </Link>
        ) : (
          <button
            onClick={() => onUnirse(gremio)}
            className="w-full rounded-lg border border-pocion-200 px-4 py-2 text-sm font-semibold text-pocion-700 hover:bg-pocion-50 dark:border-slate-700 dark:text-pocion-100 dark:hover:bg-slate-800"
          >
            {gremio.tipo === 'Private' ? 'Unirme con código' : 'Unirme'}
          </button>
        )}
      </div>
    </Card>
  )
}
