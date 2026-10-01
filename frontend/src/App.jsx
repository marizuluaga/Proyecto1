import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Gremios from './pages/Gremios'
import CrearGremio from './pages/CrearGremio'
import GremioDetalle from './pages/GremioDetalle'
import CrearFormula from './pages/CrearFormula'
import FormulaDetalle from './pages/FormulaDetalle'
import Perfil from './pages/Perfil'
import NotFound from './pages/NotFound'

// helper para no repetir <ProtectedRoute> en cada ruta
const privada = (elemento) => <ProtectedRoute>{elemento}</ProtectedRoute>

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/gremios" element={privada(<Gremios />)} />
          <Route path="/gremios/nuevo" element={privada(<CrearGremio />)} />
          <Route path="/gremios/:gremioId" element={privada(<GremioDetalle />)} />
          <Route path="/gremios/:gremioId/formulas/nueva" element={privada(<CrearFormula />)} />
          <Route path="/formulas/:id" element={privada(<FormulaDetalle />)} />
          <Route path="/perfil" element={privada(<Perfil />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
