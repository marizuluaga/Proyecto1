import { createContext, useEffect, useState } from 'react'

// Contexto para el tema claro / oscuro
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'claro')

  useEffect(() => {
    // tailwind usa la clase "dark" en el <html>
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    localStorage.setItem('tema', tema)
  }, [tema])

  const cambiarTema = () => setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'))

  return <ThemeContext.Provider value={{ tema, cambiarTema }}>{children}</ThemeContext.Provider>
}
