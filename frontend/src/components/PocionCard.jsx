import Card from './Card'
import { formatearFecha } from '../utils/constantes'

// tarjeta de una pocion del grimorio
export default function PocionCard({ pocion }) {
  return (
    <Card className="relative overflow-hidden">
      <span className="absolute -right-3 -top-3 text-6xl opacity-10">📖</span>
      <p className="text-xs font-semibold uppercase text-pocion-600">{pocion.formula?.nombrePocion}</p>
      <h3 className="mt-1 font-titulo text-lg font-bold">{pocion.nombreFinal}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Dificultad real</p>
          <p className="text-lg font-bold">{pocion.dificultadReal}</p>
        </div>
        <div className="rounded-lg bg-pocion-50 p-2 dark:bg-pocion-900">
          <p className="text-xs text-slate-500 dark:text-pocion-100">Rareza</p>
          <p className="text-lg font-bold text-pocion-700 dark:text-pocion-100">{pocion.rareza}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Por {pocion.creador?.nombre} · {formatearFecha(pocion.createdAt)}
      </p>
    </Card>
  )
}
