import { useState } from 'react'

// Hook para formularios controlados con validacion
// validar: funcion que recibe los valores y retorna un objeto { campo: 'mensaje de error' }
export function useForm(valoresIniciales, validar) {
  const crearValoresIniciales = () =>
    typeof valoresIniciales === 'function' ? valoresIniciales() : valoresIniciales

  const [valores, setValores] = useState(crearValoresIniciales)
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    const nuevos = { ...valores, [name]: value }
    setValores(nuevos)
    // validamos mientras escribe, solo si ya toco el campo
    if (tocados[name]) setErrores(validar(nuevos))
  }

  function handleBlur(e) {
    setTocados({ ...tocados, [e.target.name]: true })
    setErrores(validar(valores))
  }

  // retorna true si el formulario esta bien
  function validarTodo() {
    const todos = Object.keys(valores).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTocados(todos)
    const errs = validar(valores)
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  // para poner los errores que manda el backend en cada campo
  function erroresDelServidor(lista = []) {
    const errs = {}
    lista.forEach((e) => (errs[e.campo] = e.mensaje))
    setErrores((prev) => ({ ...prev, ...errs }))
  }

  function reiniciar() {
    setValores(crearValoresIniciales())
    setErrores({})
    setTocados({})
  }

  return { valores, errores, handleChange, handleBlur, validarTodo, erroresDelServidor, reiniciar, setValores }
}
