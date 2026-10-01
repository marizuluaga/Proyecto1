import Badge from './Badge'
import { ESTADOS } from '../utils/constantes'

export default function EstadoBadge({ estado }) {
  const info = ESTADOS[estado] || { nombre: estado }
  return <Badge color={info.color}>{info.nombre}</Badge>
}
