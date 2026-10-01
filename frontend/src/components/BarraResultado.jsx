// barra de progreso para los resultados de votacion
export default function BarraResultado({ opcion, porcentaje, votos, ganadora, vetada, miVoto }) {
  return (
    <div className={vetada ? 'opacity-50' : ''}>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">
          {opcion} {ganadora && '🏆'} {vetada && <span className="text-rose-500">(vetada)</span>}
          {miVoto && <span className="ml-1 text-xs text-pocion-600">• tu voto</span>}
        </span>
        <span className="text-slate-500">
          {porcentaje}% · {votos} {votos === 1 ? 'voto' : 'votos'}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${ganadora ? 'bg-elixir' : 'bg-pocion-500'}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
