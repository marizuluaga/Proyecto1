import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alerta from '../components/Alerta'

function validar(v) {
  const errores = {}
  if (!v.nombre.trim()) errores.nombre = 'El nombre es obligatorio'
  else if (v.nombre.length < 3) errores.nombre = 'Mínimo 3 caracteres'
  if (v.lema.length > 150) errores.lema = 'Máximo 150 caracteres'
  if (v.emblemaUrl && !/^https?:\/\/.+/.test(v.emblemaUrl)) errores.emblemaUrl = 'Debe ser una URL válida'
  return errores
}

export default function CrearGremio() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { valores, errores, handleChange, handleBlur, validarTodo, erroresDelServidor } = useForm(
    { nombre: '', lema: '', emblemaUrl: '', tipo: 'Public' },
    validar,
  )
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarTodo()) return
    setEnviando(true)
    try {
      const datos = { ...valores }
      if (!datos.emblemaUrl) delete datos.emblemaUrl
      const res = await api.crearGremio(datos, token)
      navigate(`/gremios/${res.gremio._id}`)
    } catch (err) {
      setError(err.message)
      erroresDelServidor(err.errores)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8">
        <h1 className="font-titulo text-2xl font-bold">Fundar un gremio</h1>
        <p className="mb-6 text-sm text-slate-500">Serás el Gran Maestro del gremio</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alerta onCerrar={() => setError('')}>{error}</Alerta>
          <Input label="Nombre" name="nombre" value={valores.nombre} onChange={handleChange} onBlur={handleBlur} error={errores.nombre} />
          <Input
            label="Lema"
            name="lema"
            value={valores.lema}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.lema}
            ayuda={`${valores.lema.length}/150`}
          />
          <Input label="URL del emblema (opcional)" name="emblemaUrl" value={valores.emblemaUrl} onChange={handleChange} onBlur={handleBlur} error={errores.emblemaUrl} />
          <Input label="Tipo" name="tipo" como="select" value={valores.tipo} onChange={handleChange}>
            <option value="Public">Público (cualquiera se puede unir)</option>
            <option value="Private">Privado (con código de invitación)</option>
          </Input>
          <div className="flex gap-3">
            <Button type="button" variante="secundario" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" cargando={enviando} className="flex-1">
              Crear gremio
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
