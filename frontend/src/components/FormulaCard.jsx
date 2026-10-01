import { Link } from 'react-router-dom'
import Card from './Card'
import EstadoBadge from './EstadoBadge'
import { DIFICULTADES, formatearFecha } from '../utils/constantes'

export default function FormulaCard({ formula }) {
  const dificultad = DIFICULTADES.find((d) => d.valor === formula.dificultad)
  return (
    <Link to={`/formulas/${formula._id}`}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-pocion-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{formula.nombrePocion}</h3>
          <EstadoBadge estado={formula.estado} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{formula.efectoDeseado}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>⭐ {dificultad?.nombre}</span>
          <span>👤 {formula.creador?.nombre}</span>
          <span>⏳ {formatearFecha(formula.fechaFin)}</span>
        </div>
      </Card>
    </Link>
  )
}
