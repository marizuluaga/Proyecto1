import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import Loader from '../components/Loader'
import Alerta from '../components/Alerta'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Tabs from '../components/Tabs'
import Vacio from '../components/Vacio'
import FormulaCard from '../components/FormulaCard'
import ListaMiembros from '../components/ListaMiembros'
import TablaRanking from '../components/TablaRanking'
import PocionCard from '../components/PocionCard'
import Input from '../components/Input'
import { ROLES } from '../utils/constantes'

const PESTAÑAS = [
  { id: 'formulas', titulo: '📜 Fórmulas' },
  { id: 'miembros', titulo: '👥 Miembros' },
  { id: 'ranking', titulo: '🏆 Ranking' },
  { id: 'grimorio', titulo: '📖 Grimorio' },
]

export default function GremioDetalle() {
  const { gremioId } = useParams()
  const { token, usuario } = useAuth()
  const navigate = useNavigate()
  const [pestaña, setPestaña] = useState('formulas')
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [buscar, setBuscar] = useState('')

  const gremio = useFetch(() => api.gremio(gremioId, token), [gremioId, token])
  const formulas = useFetch(() => api.formulas(gremioId, token), [gremioId, token])
  const miembros = useFetch(() => api.miembros(gremioId, token), [gremioId, token])
  const ranking = useFetch(() => api.ranking(gremioId, token), [gremioId, token])
  const grimorio = useFetch(() => api.grimorio(gremioId, buscar, token), [gremioId, buscar, token])

  if (gremio.cargando) return <Loader />
  if (gremio.error) return <Alerta>{gremio.error}</Alerta>

  const g = gremio.data
  const yo = g.miembros.find((m) => m.usuario._id === usuario._id)
  const miRol = yo?.rol
  const soyGM = miRol === 'Grandmaster'
  const puedeCrear = soyGM || miRol === 'SeniorAlchemist'

  // si no es miembro le mostramos solo la opcion de unirse
  if (!yo) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="font-titulo text-2xl font-bold">{g.nombre}</h1>
        <p className="my-4 text-slate-500">No eres miembro de este gremio.</p>
        <Link to="/gremios" className="text-pocion-600 hover:underline">
          Volver a gremios
        </Link>
      </Card>
    )
  }

  // ejecuta una accion, muestra el mensaje y recarga los datos
  async function accion(promesa, textoOk) {
    try {
      await promesa
      setMensaje({ tipo: 'exito', texto: textoOk })
      gremio.recargar(true)
      miembros.recargar(true)
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  async function salir() {
    if (!window.confirm('¿Seguro que quieres salir del gremio?')) return
    try {
      await api.salir(gremioId, usuario._id, token)
      navigate('/gremios')
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  async function eliminar() {
    if (!window.confirm('Se borrarán el gremio, sus fórmulas y el grimorio. ¿Continuar?')) return
    try {
      await api.eliminarGremio(gremioId, token)
      navigate('/gremios')
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {g.emblemaUrl ? (
          <img src={g.emblemaUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" onError={(e) => (e.target.style.display = 'none')} />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pocion-100 text-3xl dark:bg-pocion-900">⚗️</div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-titulo text-2xl font-bold">{g.nombre}</h1>
            <Badge>{g.tipo === 'Private' ? '🔒 Privado' : 'Público'}</Badge>
          </div>
          <p className="italic text-slate-500">"{g.lema}"</p>
          <p className="mt-1 text-sm">
            Tu rol: <b>{ROLES[miRol]}</b>
            {g.codigoInvitacion && (
              <span className="ml-3 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs dark:bg-slate-800">
                Código: {g.codigoInvitacion}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {puedeCrear && (
            <Link
              to={`/gremios/${gremioId}/formulas/nueva`}
              className="rounded-lg bg-pocion-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pocion-700"
            >
              + Proponer fórmula
            </Link>
          )}
          {soyGM ? (
            <Button variante="peligro" onClick={eliminar}>
              Eliminar
            </Button>
          ) : (
            <Button variante="secundario" onClick={salir}>
              Salir
            </Button>
          )}
        </div>
      </Card>

      <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje({ tipo: '', texto: '' })}>
        {mensaje.texto}
      </Alerta>

      <Tabs pestañas={PESTAÑAS} activa={pestaña} onCambiar={setPestaña} />

      {pestaña === 'formulas' &&
        (formulas.cargando ? (
          <Loader />
        ) : formulas.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formulas.data.map((f) => (
              <FormulaCard key={f._id} formula={f} />
            ))}
          </div>
        ) : (
          <Vacio titulo="Todavía no hay fórmulas">{puedeCrear ? 'Propón la primera' : 'Espera a que un Senior proponga una'}</Vacio>
        ))}

      {pestaña === 'miembros' && (
        <Card>
          {miembros.cargando ? (
            <Loader />
          ) : (
            <ListaMiembros
              miembros={miembros.data || []}
              soyGrandmaster={soyGM}
              miId={usuario._id}
              onCambiarRol={(m, rol) => accion(api.cambiarRol(gremioId, m.usuario._id, rol, token), 'Rol actualizado')}
              onCatador={(m) => accion(api.nombrarCatador(gremioId, m.usuario._id, token), `${m.usuario.nombre} es el nuevo Catador Oficial`)}
              onExpulsar={(m) =>
                window.confirm(`¿Expulsar a ${m.usuario.nombre}?`) &&
                accion(api.salir(gremioId, m.usuario._id, token), 'Miembro expulsado')
              }
            />
          )}
        </Card>
      )}

      {pestaña === 'ranking' && <Card>{ranking.cargando ? <Loader /> : <TablaRanking ranking={ranking.data || []} />}</Card>}

      {pestaña === 'grimorio' && (
        <div className="space-y-4">
          <Input placeholder="Buscar en el grimorio (ej: Moon, Mandrake...)" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          {grimorio.cargando ? (
            <Loader />
          ) : grimorio.data?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grimorio.data.map((p) => (
                <PocionCard key={p._id} pocion={p} />
              ))}
            </div>
          ) : (
            <Vacio titulo="El grimorio está vacío">Las pociones aparecen aquí cuando se destilan</Vacio>
          )}
        </div>
      )}
    </div>
  )
}
