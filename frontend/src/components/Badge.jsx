// Etiqueta pequeña de colores (estado, rol, tipo...)
export default function Badge({ children, color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{children}</span>
}
