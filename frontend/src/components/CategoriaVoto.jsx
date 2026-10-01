import BarraResultado from './BarraResultado'

// una categoria de votacion: botones para votar + barras de resultados
export default function CategoriaVoto({ titulo, opciones, resultados = [], miVoto, ganador, puedeVotar, onVotar, enviando }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{titulo}</h3>

      {puedeVotar && (
        <div className="grid grid-cols-2 gap-2">
          {opciones.map((op) => (
            <button
              key={op}
              disabled={enviando}
              onClick={() => onVotar(op)}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition disabled:opacity-50 ${
                miVoto === op
                  ? 'border-pocion-500 bg-pocion-600 text-white'
                  : 'border-slate-200 hover:border-pocion-400 hover:bg-pocion-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              {miVoto === op ? '✓ ' : ''}
              {op}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {resultados.map((r) => (
          <BarraResultado
            key={r.opcion}
            opcion={r.opcion}
            porcentaje={r.porcentaje}
            votos={r.votos}
            vetada={r.vetada}
            ganadora={ganador === r.opcion}
            miVoto={miVoto === r.opcion}
          />
        ))}
      </div>
    </div>
  )
}
