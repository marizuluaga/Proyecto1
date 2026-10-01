// Input reutilizable con label y mensaje de error
export default function Input({ label, error, ayuda, como = 'input', children, ...props }) {
  const Campo = como // puede ser input, textarea o select
  const clases = `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 dark:bg-slate-900 ${
    error
      ? 'border-rose-400 focus:ring-rose-200 dark:border-rose-500'
      : 'border-slate-300 focus:border-pocion-500 focus:ring-pocion-100 dark:border-slate-700 dark:focus:ring-pocion-900'
  }`

  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
      <Campo className={clases} {...props}>
        {children}
      </Campo>
      {error ? (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>
      ) : (
        ayuda && <span className="mt-1 block text-xs text-slate-500">{ayuda}</span>
      )}
    </label>
  )
}
