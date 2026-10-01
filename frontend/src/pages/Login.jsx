import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alerta from '../components/Alerta'

function validar(v) {
  const errores = {}
  if (!v.email) errores.email = 'El correo es obligatorio'
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) errores.email = 'El correo no es válido'
  if (!v.password) errores.password = 'La contraseña es obligatoria'
  return errores
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { valores, errores, handleChange, handleBlur, validarTodo } = useForm({ email: '', password: '' }, validar)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarTodo()) return
    setEnviando(true)
    setError('')
    try {
      await login(valores.email, valores.password)
      // si venia de una ruta protegida lo devolvemos alla
      navigate(location.state?.desde || '/gremios')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="font-titulo text-2xl font-bold">Bienvenido de vuelta</h1>
        <p className="mb-6 text-sm text-slate-500">Entra al laboratorio con tu correo universitario</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alerta onCerrar={() => setError('')}>{error}</Alerta>
          <Input
            label="Correo"
            name="email"
            type="email"
            placeholder="tu.nombre@eia.edu.co"
            value={valores.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.email}
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={valores.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.password}
          />
          <Button type="submit" cargando={enviando} className="w-full">
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-pocion-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
