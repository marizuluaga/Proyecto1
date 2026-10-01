// Boton reutilizable con variantes de color
const variantes = {
  primario: 'bg-pocion-600 text-white hover:bg-pocion-700 shadow-sm',
  secundario:
    'bg-white text-pocion-700 border border-pocion-200 hover:bg-pocion-50 dark:bg-slate-800 dark:text-pocion-100 dark:border-slate-600 dark:hover:bg-slate-700',
  peligro: 'bg-rose-600 text-white hover:bg-rose-700',
  exito: 'bg-emerald-600 text-white hover:bg-emerald-700',
  fantasma: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
}

export default function Button({ children, variante = 'primario', cargando = false, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variante]} ${className}`}
      disabled={cargando || props.disabled}
      {...props}
    >
      {cargando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
