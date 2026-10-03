import { useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alerta from '../components/Alerta'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import { ESPECIALIDADES } from '../utils/constantes'

function validar(v) {
  const errores = {}
  if (!v.nombre.trim()) errores.nombre = 'El nombre no puede estar vacío'
  if (v.avatarUrl && !/^https?:\/\/.+/.test(v.avatarUrl)) errores.avatarUrl = 'Debe ser una URL válida'
  return errores
}

export default function Perfil() {
  const { usuario, token, setUsuario } = useAuth()
  const [ahora] = useState(Date.now)
  const { valores, errores, handleChange, handleBlur, validarTodo } = useForm(
    { nombre: usuario.nombre, especialidad: usuario.especialidad, avatarUrl: usuario.avatarUrl || '' },
    validar,
  )
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarTodo()) return
    setEnviando(true)
    try {
      const res = await api.actualizarPerfil({ ...valores, avatarUrl: valores.avatarUrl || null }, token)
      setUsuario(res.usuario)
      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado' })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
      <Card className="text-center">
        <div className="flex justify-center">
          <Avatar nombre={usuario.nombre} url={usuario.avatarUrl} tamaño="h-24 w-24 text-2xl" />
        </div>
        <h1 className="mt-3 text-lg font-bold">{usuario.nombre}</h1>
        <p className="text-sm text-slate-500">{usuario.email}</p>
        <div className="mt-3 flex justify-center gap-2">
          <Badge>{usuario.especialidad}</Badge>
          {usuario.role === 'admin' && <Badge color="bg-amber-100 text-amber-800">Admin</Badge>}
        </div>
        {usuario.bloqueadoCrearHasta && Date.parse(usuario.bloqueadoCrearHasta) > ahora && (
          <p className="mt-4 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
            Penalizado por baja participación hasta {new Date(usuario.bloqueadoCrearHasta).toLocaleDateString()}
          </p>
        )}
      </Card>

      <Card className="md:col-span-2">
        <h2 className="mb-4 text-lg font-bold">Editar perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alerta tipo={mensaje.tipo} onCerrar={() => setMensaje({ tipo: '', texto: '' })}>
            {mensaje.texto}
          </Alerta>
          <Input label="Nombre completo" name="nombre" value={valores.nombre} onChange={handleChange} onBlur={handleBlur} error={errores.nombre} />
          <Input label="Especialidad" name="especialidad" como="select" value={valores.especialidad} onChange={handleChange}>
            {ESPECIALIDADES.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.valor} — {e.descripcion}
              </option>
            ))}
          </Input>
          <Input label="URL del avatar" name="avatarUrl" value={valores.avatarUrl} onChange={handleChange} onBlur={handleBlur} error={errores.avatarUrl} />
          <Button type="submit" cargando={enviando}>
            Guardar cambios
          </Button>
        </form>
      </Card>
    </div>
  )
}
