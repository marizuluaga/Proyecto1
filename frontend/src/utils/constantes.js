// Constantes del dominio (las mismas del backend)

export const ESPECIALIDADES = [
  { valor: 'Herbalist', nombre: 'Herbolario', descripcion: 'Su voto pesa más en el ingrediente' },
  { valor: 'Runist', nombre: 'Runista', descripcion: 'Su voto pesa más en el método' },
  { valor: 'Taster', nombre: 'Catador', descripcion: 'Su voto pesa más en el frasco' },
  { valor: 'Brewmaster', nombre: 'Maestro Cervecero', descripcion: 'x1.2 en todas las categorías' },
]

export const CATEGORIAS = {
  ingrediente: { titulo: 'Ingrediente base', opciones: ['Mandrake Root', 'Stardust Powder'] },
  metodo: { titulo: 'Método de calentamiento', opciones: ['Blue Flame', 'Arcane Water Bath'] },
  frasco: { titulo: 'Tipo de frasco', opciones: ['Moon Crystal', 'Silver Skull'] },
}

export const DIFICULTADES = [
  { valor: 1, nombre: 'Easy' },
  { valor: 2, nombre: 'Medium' },
  { valor: 3, nombre: 'Hard' },
  { valor: 4, nombre: 'Arcane' },
]

export const ESTADOS = {
  Proposal: { nombre: 'Propuesta', color: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  VotingOpen: { nombre: 'Votación abierta', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  Closed: { nombre: 'Cerrada', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  Distilled: { nombre: 'Destilada', color: 'bg-pocion-100 text-pocion-700 dark:bg-pocion-900 dark:text-pocion-100' },
}

export const ROLES = {
  Grandmaster: 'Gran Maestro',
  SeniorAlchemist: 'Alquimista Senior',
  Taster: 'Catador Oficial',
  Apprentice: 'Aprendiz',
}

// formatea una fecha bonito en español
export function formatearFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}
