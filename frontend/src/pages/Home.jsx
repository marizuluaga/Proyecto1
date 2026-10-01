import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/Card'

const pasos = [
  { icono: '🏰', titulo: 'Únete a un gremio', texto: 'Crea tu propio gremio o entra a uno público. Los privados usan código de invitación.' },
  { icono: '📜', titulo: 'Propón fórmulas', texto: 'Los Alquimistas Senior proponen fórmulas con su efecto y dificultad.' },
  { icono: '🗳️', titulo: 'Vota por categoría', texto: 'Ingrediente, método y frasco. Tu especialidad le da más peso a tu voto.' },
  { icono: '📖', titulo: 'Destila la poción', texto: 'Al cerrar la votación se calcula la poción final y queda en el Grimorio.' },
]

export default function Home() {
  const { estaLogueado, usuario } = useAuth()

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pocion-700 via-pocion-600 to-indigo-600 px-6 py-16 text-white sm:px-12">
        <div className="relative max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pocion-100">Laboratorio colaborativo</p>
          <h1 className="font-titulo text-4xl font-bold leading-tight sm:text-5xl">
            Se acabó el caos del grupo de WhatsApp
          </h1>
          <p className="mt-4 text-lg text-pocion-100">
            En Potion Lab los aprendices proponen fórmulas, votan ingredientes y deciden juntos cuál es la poción definitiva.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {estaLogueado ? (
              <Link to="/gremios" className="rounded-lg bg-white px-5 py-3 font-semibold text-pocion-700 hover:bg-pocion-50">
                Ir a mis gremios, {usuario.nombre.split(' ')[0]}
              </Link>
            ) : (
              <>
                <Link to="/registro" className="rounded-lg bg-white px-5 py-3 font-semibold text-pocion-700 hover:bg-pocion-50">
                  Crear cuenta
                </Link>
                <Link to="/login" className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
        <span className="pointer-events-none absolute -bottom-10 -right-6 text-[11rem] opacity-20 sm:text-[14rem]">⚗️</span>
      </section>

      <section>
        <h2 className="mb-6 text-center font-titulo text-2xl font-bold">¿Cómo funciona?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => (
            <Card key={p.titulo}>
              <div className="text-3xl">{p.icono}</div>
              <p className="mt-3 text-xs font-semibold text-pocion-600">PASO {i + 1}</p>
              <h3 className="font-semibold">{p.titulo}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.texto}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
