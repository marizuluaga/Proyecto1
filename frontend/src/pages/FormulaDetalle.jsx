import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import Alerta from '../components/Alerta'
import Card from '../components/Card'
import Button from '../components/Button'
import EstadoBadge from '../components/EstadoBadge'
import CategoriaVoto from '../components/CategoriaVoto'
import { CATEGORIAS, DIFICULTADES, formatearFecha } from '../utils/constantes'

const POLLING_MS = 5000 // cada 5 segundos se actualizan los resultados

export default function FormulaDetalle() {
  const { id } = useParams()
  const { token, usuario } = useAuth()
  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [enviando, setEnviando] = useState(false)
  const [modoVeto, setModoVeto] = useState(false)

  const formula = useFetch(() => api.formula(id, token), [id, token])
  const gremioId = formula.data?.gremio
  const gremio = useFetch(() => (gremioId ? api.gremio(gremioId, token) : Promise.resolve(null)), [gremioId, token])
  // "tiempo real" con polling
  const resultados = useFetch(() => api.resultados(id, token), [id, token], POLLING_MS)

  if (formula.cargando || gremio.cargando) return <Loader />
  if (formula.error) return <Alerta>{formula.error}</Alerta>

  const f = formula.data
  const miRol = gremio.data?.miembros.find((m) => m.usuario._id === usuario._id)?.rol
  const puedeGestionar = ['Grandmaster', 'SeniorAlchemist'].includes(miRol)
  const esCatador = miRol === 'Taster'
  const estado = resultados.data?.estado || f.estado
  const votacionAbierta = estado === 'VotingOpen'
  const misVotos = Object.fromEntries((resultados.data?.misVotos || []).map((v) => [v.categoria, v.opcion]))
  const ganadores = resultados.data?.ganadores || f.ganadores || {}
  const dificultad = DIFICULTADES.find((d) => d.valor === f.dificultad)

  async function ejecutar(promesa, textoOk) {
    setEnviando(true)
    try {
      await promesa
      setMensaje({ tipo: 'exito', texto: textoOk })
      formula.recargar(true)
      resultados.recargar(true)
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    } finally {
      setEnviando(false)
    }
  }

  function votar(categoria, opcion) {
    if (modoVeto) {
      if (!window.confirm(`¿Vetar "${opcion}"? Solo tienes 1 veto por fórmula.`)) return
      setModoVeto(false)
      return ejecutar(api.vetar(id, categoria, opcion, token), `Vetaste ${opcion}`)
    }
    ejecutar(api.votar(id, categoria, opcion, token), `Voto registrado: ${opcion}`)
  }

  async function eliminar() {
    if (!window.confirm('¿Eliminar esta fórmula?')) return
    try {
      await api.eliminarFormula(id, token)
      navigate(`/gremios/${gremioId}`)
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <div className="space-y-6">
      <Link to={`/gremios/${gremioId}`} className="text-sm text-pocion-600 hover:underline">
        ← Volver a {gremio.data?.nombre}
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-titulo text-3xl font-bold">{f.nombrePocion}</h1>
              <EstadoBadge estado={estado} />
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{f.efectoDeseado}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>⭐ Dificultad: {dificultad?.nombre}</span>
              <span>👤 {f.creador?.nombre}</span>
              <span>⏳ Termina: {formatearFecha(f.fechaFin)}</span>
              {f.veto?.categoria && <span className="text-rose-500">🚫 Veto usado en {f.veto.categoria}</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {puedeGestionar && estado === 'Proposal' && (
              <>
                <Button variante="exito" cargando={enviando} onClick={() => ejecutar(api.abrir(id, token), 'Votación abierta')}>
                  Abrir votación
                </Button>
                <Button variante="peligro" onClick={eliminar}>
                  Eliminar
                </Button>
              </>
            )}
            {puedeGestionar && votacionAbierta && (
              <Button
                variante="peligro"
                cargando={enviando}
                onClick={() =>
                  window.confirm('Se cerrará la votación y se destilará la poción. ¿Continuar?') &&
                  ejecutar(api.cerrar(id, token), '¡Poción destilada! Ya está en el grimorio')
                }
              >
                Cerrar votación
              </Button>
            )}
            {esCatador && votacionAbierta && !f.veto?.categoria && (
              <Button variante={modoVeto ? 'peligro' : 'secundario'} onClick={() => setModoVeto(!modoVeto)}>
                {modoVeto ? 'Cancelar veto' : '🚫 Usar veto'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje({ tipo: '', texto: '' })}>
        {mensaje.texto}
      </Alerta>
      {modoVeto && <Alerta tipo="info">Modo veto: escoge la opción que NO puede ganar.</Alerta>}
      {estado === 'Proposal' && <Alerta tipo="info">Esta fórmula todavía es una propuesta. Un Senior o el Gran Maestro debe abrir la votación.</Alerta>}

      {ganadores.ingrediente && (
        <Card className="border-elixir bg-emerald-50 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Poción resultante</p>
          <p className="font-titulo text-2xl font-bold">
            {ganadores.ingrediente} + {ganadores.metodo} in {ganadores.frasco}
          </p>
        </Card>
      )}

      {estado !== 'Proposal' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Votación</h2>
            {votacionAbierta && (
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                En vivo · {resultados.data?.totalVotos ?? 0} votos
              </span>
            )}
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {Object.entries(CATEGORIAS).map(([clave, cat]) => (
              <CategoriaVoto
                key={clave}
                titulo={cat.titulo}
                opciones={cat.opciones}
                resultados={resultados.data?.resultados?.[clave]}
                miVoto={misVotos[clave]}
                ganador={ganadores[clave]}
                puedeVotar={votacionAbierta}
                enviando={enviando}
                onVotar={(op) => votar(clave, op)}
              />
            ))}
          </div>
          {votacionAbierta && (
            <p className="mt-6 text-xs text-slate-500">
              Puedes cambiar tu voto mientras la votación esté abierta. Tu especialidad ({usuario.especialidad}) le da más peso a tu voto en su categoría.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
