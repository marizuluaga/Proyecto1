import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from './Loader'

// si no esta logueado lo manda al login
export default function ProtectedRoute({ children }) {
  const { estaLogueado, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return <Loader texto="Verificando sesión..." />
  if (!estaLogueado) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  return children
}
