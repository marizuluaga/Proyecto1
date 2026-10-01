import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// hook para no tener que importar useContext + AuthContext en todos lados
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
