import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import GremioCard from '../components/GremioCard'
import Loader from '../components/Loader'
import Alerta from '../components/Alerta'
import Vacio from '../components/Vacio'
import Input from '../components/Input'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Gremios() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { data: gremios, cargando, error, recargar } = useFetch(() => api.gremios(token), [token])
  const [filtro, setFiltro] = useState('todos')
  const [buscar, setBuscar] = useState('')
  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  async function unirse(gremio) {
    try {
      if (gremio.tipo === 'Private') {
        const cod = window.prompt(`Escribe el código de invitación de "${gremio.nombre}"`)
        if (!cod) return
        await api.unirse(gremio._id, cod, token)
      } else {
        await api.unirse(gremio._id, null, token)
      }
      navigate(`/gremios/${gremio._id}`)
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    }
  }

  async function unirseConCodigo(e) {
    e.preventDefault()
    if (codigo.trim().length !== 6) {
      setMensaje({ tipo: 'error', texto: 'El código debe tener 6 caracteres' })
      return
    }
    try {
      const res = await api.unirseConCodigo(codigo.trim(), token)
      setCodigo('')
      recargar()
      navigate(`/gremios/${res.gremioId}`)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    }
  }

  if (cargando) return <Loader texto="Buscando gremios..." />

  const lista = (gremios || [])
    .filter((g) => (filtro === 'mios' ? g.miRol : filtro === 'todos' ? true : g.tipo === filtro))
    .filter((g) => g.nombre.toLowerCase().includes(buscar.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl font-bold">Gremios</h1>
          <p className="text-slate-500">Encuentra tu grupo de alquimistas</p>
        </div>
        <Link to="/gremios/nuevo" className="rounded-lg bg-pocion-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pocion-700">
          + Crear gremio
        </Link>
      </div>

      <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje({ tipo: '', texto: '' })}>
        {mensaje.texto}
      </Alerta>
      <Alerta>{error}</Alerta>

      <Card className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <Input label="Buscar" placeholder="Nombre del gremio..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {[
            ['todos', 'Todos'],
            ['mios', 'Mis gremios'],
            ['Public', 'Públicos'],
            ['Private', 'Privados'],
          ].map(([valor, texto]) => (
            <button
              key={valor}
              onClick={() => setFiltro(valor)}
              className={`rounded-md px-3 py-1.5 text-sm ${filtro === valor ? 'bg-white font-semibold shadow dark:bg-slate-950' : 'text-slate-500'}`}
            >
              {texto}
            </button>
          ))}
        </div>
        <form onSubmit={unirseConCodigo} className="flex items-end gap-2">
          <Input label="¿Tienes un código?" placeholder="ABC123" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} />
          <Button type="submit" variante="secundario">
            Unirme
          </Button>
        </form>
      </Card>

      {lista.length === 0 ? (
        <Vacio titulo="No hay gremios con ese filtro">Prueba con otro o crea uno nuevo</Vacio>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((g) => (
            <GremioCard key={g._id} gremio={g} esMiembro={!!g.miRol} onUnirse={unirse} />
          ))}
        </div>
      )}
    </div>
  )
}
