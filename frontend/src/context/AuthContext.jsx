import { createContext, useEffect, useState } from 'react'
import { api } from '../services/api'

// Contexto de autenticacion: guarda el usuario y el token para toda la app
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [usuario, setUsuario] = useState(null)
  // si hay token toca esperar a que llegue el perfil
  const [cargando, setCargando] = useState(() => !!localStorage.getItem('token'))

  // cuando carga la pagina, si hay token pedimos el perfil para saber quien es
  useEffect(() => {
    if (!token) return
    api
      .perfil(token)
      .then((data) => setUsuario(data))
      .catch(() => {
        // token vencido o invalido -> lo borramos
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setCargando(false))
  }, [token])

  function guardarSesion(data) {
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUsuario(data.usuario)
  }

  async function login(email, password) {
    const data = await api.login({ email, password })
    guardarSesion(data)
    return data.usuario
  }

  async function registrar(datos) {
    const data = await api.registrar(datos)
    guardarSesion(data)
    return data.usuario
  }

  async function logout() {
    try {
      await api.logout(token)
    } catch {
      // si falla igual cerramos la sesion en el front
    }
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
  }

  const valor = {
    usuario,
    setUsuario,
    token,
    cargando,
    estaLogueado: !!usuario,
    esAdmin: usuario?.role === 'admin',
    login,
    registrar,
    logout,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
