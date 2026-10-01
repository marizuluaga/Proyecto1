import { useCallback, useEffect, useState } from 'react'

// Hook para pedir datos a la API y manejar cargando / error
// funcionPeticion debe ser una funcion que retorna una promesa
// intervalo (opcional): cada cuantos ms volver a pedir los datos (polling)
export function useFetch(funcionPeticion, dependencias = [], intervalo = null) {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pedir = useCallback(funcionPeticion, dependencias)

  const recargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true)
    try {
      const resultado = await pedir()
      setData(resultado)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [pedir])

  useEffect(() => {
    recargar()
    if (!intervalo) return
    // polling: actualiza sin mostrar el loader cada vez
    const id = setInterval(() => recargar(true), intervalo)
    return () => clearInterval(id)
  }, [recargar, intervalo])

  return { data, cargando, error, recargar, setData }
}
