// Servicio para hablar con el backend (Potion Lab API)
// todas las peticiones pasan por aca para no repetir el fetch en cada pagina

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function peticion(ruta, { metodo = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    // el back manda { error, errores: [{campo, mensaje}] }
    const error = new Error(data.error || 'Ocurrió un error inesperado')
    error.status = respuesta.status
    error.errores = data.errores || []
    throw error
  }
  return data
}

export const api = {
  // auth
  login: (datos) => peticion('/auth/login', { metodo: 'POST', body: datos }),
  registrar: (datos) => peticion('/auth/registrar', { metodo: 'POST', body: datos }),
  logout: (token) => peticion('/auth/logout', { metodo: 'POST', token }),
  perfil: (token) => peticion('/auth/perfil', { token }),
  actualizarPerfil: (datos, token) => peticion('/auth/perfil', { metodo: 'PUT', body: datos, token }),

  // gremios
  gremios: (token) => peticion('/gremios', { token }),
  gremio: (id, token) => peticion(`/gremios/${id}`, { token }),
  crearGremio: (datos, token) => peticion('/gremios', { metodo: 'POST', body: datos, token }),
  editarGremio: (id, datos, token) => peticion(`/gremios/${id}`, { metodo: 'PUT', body: datos, token }),
  eliminarGremio: (id, token) => peticion(`/gremios/${id}`, { metodo: 'DELETE', token }),
  unirse: (id, codigo, token) => peticion(`/gremios/${id}/unirse`, { metodo: 'POST', body: { codigo }, token }),
  unirseConCodigo: (codigo, token) => peticion('/gremios/unirse', { metodo: 'POST', body: { codigo }, token }),
  salir: (id, usuarioId, token) => peticion(`/gremios/${id}/miembros/${usuarioId}`, { metodo: 'DELETE', token }),
  miembros: (id, token) => peticion(`/gremios/${id}/miembros`, { token }),
  cambiarRol: (id, usuarioId, rol, token) =>
    peticion(`/gremios/${id}/miembros/${usuarioId}/rol`, { metodo: 'PATCH', body: { rol }, token }),
  nombrarCatador: (id, usuarioId, token) =>
    peticion(`/gremios/${id}/catador`, { metodo: 'POST', body: { usuarioId }, token }),
  ranking: (id, token) => peticion(`/gremios/${id}/ranking`, { token }),
  grimorio: (id, buscar, token) =>
    peticion(`/gremios/${id}/grimorio?buscar=${encodeURIComponent(buscar || '')}`, { token }),

  // formulas
  formulas: (gremioId, token) => peticion(`/gremios/${gremioId}/formulas`, { token }),
  crearFormula: (gremioId, datos, token) =>
    peticion(`/gremios/${gremioId}/formulas`, { metodo: 'POST', body: datos, token }),
  formula: (id, token) => peticion(`/formulas/${id}`, { token }),
  eliminarFormula: (id, token) => peticion(`/formulas/${id}`, { metodo: 'DELETE', token }),
  abrir: (id, token) => peticion(`/formulas/${id}/abrir`, { metodo: 'PATCH', token }),
  cerrar: (id, token) => peticion(`/formulas/${id}/cerrar`, { metodo: 'PATCH', token }),
  votar: (id, categoria, opcion, token) =>
    peticion(`/formulas/${id}/votos`, { metodo: 'POST', body: { categoria, opcion }, token }),
  vetar: (id, categoria, opcion, token) =>
    peticion(`/formulas/${id}/veto`, { metodo: 'POST', body: { categoria, opcion }, token }),
  resultados: (id, token) => peticion(`/formulas/${id}/resultados`, { token }),
}
