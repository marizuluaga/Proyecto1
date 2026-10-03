import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alerta from '../components/Alerta'
import { CATEGORIAS, DIFICULTADES } from '../utils/constantes'

const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000

// para el input datetime-local (formato yyyy-mm-ddThh:mm en hora local)
function aInputFecha(fecha) {
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function validar(v) {
  const errores = {}
  if (!v.nombrePocion.trim()) errores.nombrePocion = 'El nombre es obligatorio'
  else if (v.nombrePocion.length > 50) errores.nombrePocion = 'Máximo 50 caracteres'
  if (!v.efectoDeseado.trim()) errores.efectoDeseado = 'Describe el efecto'
  else if (v.efectoDeseado.length > 200) errores.efectoDeseado = 'Máximo 200 caracteres'
  const fin = new Date(v.fechaFin)
  if (!v.fechaFin || isNaN(fin)) errores.fechaFin = 'Escoge la fecha de fin'
  else if (fin <= new Date()) errores.fechaFin = 'Debe ser en el futuro'
  else if (fin - new Date() > SIETE_DIAS) errores.fechaFin = 'Máximo 7 días desde hoy'
  return errores
}

function valoresIniciales() {
  const tresDias = 3 * 24 * 60 * 60 * 1000
  return {
    nombrePocion: '',
    efectoDeseado: '',
    dificultad: '2',
    fechaFin: aInputFecha(new Date(Date.now() + tresDias)),
  }
}

export default function CrearFormula() {
  const { gremioId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const { valores, errores, handleChange, handleBlur, validarTodo, erroresDelServidor } = useForm(
    valoresIniciales,
    validar,
  )
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarTodo()) return
    setEnviando(true)
    try {
      const res = await api.crearFormula(
        gremioId,
        { ...valores, dificultad: Number(valores.dificultad), fechaFin: new Date(valores.fechaFin).toISOString() },
        token,
      )
      navigate(`/formulas/${res.formula._id}`)
    } catch (err) {
      setError(err.message)
      erroresDelServidor(err.errores)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8">
        <h1 className="font-titulo text-2xl font-bold">Proponer fórmula</h1>
        <p className="mb-6 text-sm text-slate-500">Los miembros del gremio votarán las 3 categorías</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alerta onCerrar={() => setError('')}>{error}</Alerta>
          <Input
            label="Nombre de la poción"
            name="nombrePocion"
            maxLength={50}
            value={valores.nombrePocion}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.nombrePocion}
            ayuda={`${valores.nombrePocion.length}/50`}
          />
          <Input
            label="Efecto deseado"
            name="efectoDeseado"
            como="textarea"
            rows={3}
            maxLength={200}
            value={valores.efectoDeseado}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.efectoDeseado}
            ayuda={`${valores.efectoDeseado.length}/200`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Dificultad" name="dificultad" como="select" value={valores.dificultad} onChange={handleChange}>
              {DIFICULTADES.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.valor} - {d.nombre}
                </option>
              ))}
            </Input>
            <Input
              label="Fecha de fin de votación"
              name="fechaFin"
              type="datetime-local"
              value={valores.fechaFin}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errores.fechaFin}
              ayuda="Máximo 7 días"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
            <p className="mb-2 font-semibold">Categorías que se van a votar</p>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {Object.values(CATEGORIAS).map((c) => (
                <li key={c.titulo}>
                  <b>{c.titulo}:</b> {c.opciones.join(' vs ')}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="button" variante="secundario" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" cargando={enviando} className="flex-1">
              Proponer fórmula
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
