import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alerta from '../components/Alerta'
import { ESPECIALIDADES } from '../utils/constantes'

function validar(v) {
  const errores = {}
  if (!v.nombre.trim()) errores.nombre = 'El nombre completo es obligatorio'
  else if (v.nombre.trim().split(' ').length < 2) errores.nombre = 'Escribe nombre y apellido'
  if (!/^\S+@\S+\.\S+$/.test(v.email)) errores.email = 'El correo no es válido'
  if (v.password.length < 6) errores.password = 'Mínimo 6 caracteres'
  if (v.confirmar !== v.password) errores.confirmar = 'Las contraseñas no coinciden'
  if (!v.especialidad) errores.especialidad = 'Escoge tu especialidad alquímica'
  if (v.avatarUrl && !/^https?:\/\/.+/.test(v.avatarUrl)) errores.avatarUrl = 'Debe ser una URL (http...)'
  return errores
}

const iniciales = { nombre: '', email: '', password: '', confirmar: '', especialidad: '', avatarUrl: '' }

export default function Registro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const { valores, errores, handleChange, handleBlur, validarTodo, erroresDelServidor, setValores } = useForm(iniciales, validar)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarTodo()) return
    setEnviando(true)
    setError('')
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmar, ...datos } = valores
      if (!datos.avatarUrl) delete datos.avatarUrl
      await registrar(datos)
      navigate('/gremios')
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
        <h1 className="font-titulo text-2xl font-bold">Únete al laboratorio</h1>
        <p className="mb-6 text-sm text-slate-500">Crea tu perfil de alquimista</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alerta onCerrar={() => setError('')}>{error}</Alerta>
          <Input label="Nombre completo" name="nombre" value={valores.nombre} onChange={handleChange} onBlur={handleBlur} error={errores.nombre} />
          <Input label="Correo universitario" name="email" type="email" value={valores.email} onChange={handleChange} onBlur={handleBlur} error={errores.email} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Contraseña" name="password" type="password" value={valores.password} onChange={handleChange} onBlur={handleBlur} error={errores.password} />
            <Input label="Confirmar contraseña" name="confirmar" type="password" value={valores.confirmar} onChange={handleChange} onBlur={handleBlur} error={errores.confirmar} />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Especialidad alquímica</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {ESPECIALIDADES.map((esp) => (
                <button
                  type="button"
                  key={esp.valor}
                  onClick={() => setValores({ ...valores, especialidad: esp.valor })}
                  className={`rounded-xl border p-3 text-left transition ${
                    valores.especialidad === esp.valor
                      ? 'border-pocion-500 bg-pocion-50 ring-2 ring-pocion-200 dark:bg-pocion-900 dark:ring-pocion-700'
                      : 'border-slate-200 hover:border-pocion-300 dark:border-slate-700'
                  }`}
                >
                  <p className="text-sm font-semibold">{esp.valor}</p>
                  <p className="text-xs text-slate-500">{esp.descripcion}</p>
                </button>
              ))}
            </div>
            {errores.especialidad && <span className="mt-1 block text-xs text-rose-600">{errores.especialidad}</span>}
          </div>

          <Input label="URL del avatar (opcional)" name="avatarUrl" value={valores.avatarUrl} onChange={handleChange} onBlur={handleBlur} error={errores.avatarUrl} placeholder="https://..." />

          <Button type="submit" cargando={enviando} className="w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-pocion-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
