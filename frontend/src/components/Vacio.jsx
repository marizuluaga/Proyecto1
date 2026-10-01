// cuando una lista no tiene datos
export default function Vacio({ titulo, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-800">
      <p className="text-3xl">🧪</p>
      <p className="mt-2 font-semibold">{titulo}</p>
      {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
    </div>
  )
}
