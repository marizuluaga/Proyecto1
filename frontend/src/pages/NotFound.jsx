import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl">💥</p>
      <h1 className="mt-4 font-titulo text-3xl font-bold">404 - Poción no encontrada</h1>
      <p className="mt-2 text-slate-500">Esta página explotó en el caldero</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-pocion-600 px-4 py-2 font-semibold text-white">
        Volver al inicio
      </Link>
    </div>
  )
}
