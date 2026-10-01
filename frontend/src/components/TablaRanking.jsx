import Avatar from './Avatar'

const medallas = ['🥇', '🥈', '🥉']

export default function TablaRanking({ ranking }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">#</th>
            <th>Alquimista</th>
            <th className="text-right">Puntos</th>
            <th className="text-right">Rareza total</th>
            <th className="text-right">Precisión catador</th>
            <th className="text-right">Participación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {ranking.map((r) => (
            <tr key={r.usuario._id}>
              <td className="py-3 text-lg">{medallas[r.posicion - 1] || r.posicion}</td>
              <td>
                <div className="flex items-center gap-2">
                  <Avatar nombre={r.usuario.nombre} url={r.usuario.avatarUrl} tamaño="h-7 w-7" />
                  <div>
                    <p className="font-medium">{r.usuario.nombre}</p>
                    <p className="text-xs text-slate-500">{r.usuario.especialidad}</p>
                  </div>
                </div>
              </td>
              <td className="text-right font-semibold text-pocion-600">{r.puntosAlquimia}</td>
              <td className="text-right">{r.rarezaTotal}</td>
              <td className="text-right">{r.precisionCatador === null ? '—' : `${r.precisionCatador}%`}</td>
              <td className="text-right">
                <span className={r.participacion !== null && r.participacion < 30 ? 'font-semibold text-rose-600' : ''}>
                  {r.participacion === null ? '—' : `${r.participacion}%`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-500">
        +10 puntos por fórmula creada, +20 por fórmula destilada. Con menos de 30% de participación no se pueden crear fórmulas por 7 días.
      </p>
    </div>
  )
}
