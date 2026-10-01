export default function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pocion-200 border-t-pocion-600" />
      <p className="text-sm">{texto}</p>
    </div>
  )
}
