// mensaje de error o de exito
const tipos = {
  error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  info: 'border-pocion-100 bg-pocion-50 text-pocion-700 dark:border-pocion-900 dark:bg-slate-900 dark:text-pocion-100',
}

export default function Alerta({ tipo = 'error', children, onCerrar }) {
  if (!children) return null
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${tipos[tipo]}`}>
      <span>{children}</span>
      {onCerrar && (
        <button onClick={onCerrar} className="font-bold opacity-60 hover:opacity-100" aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  )
}
