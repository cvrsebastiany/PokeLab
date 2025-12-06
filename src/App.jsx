import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PokemonClinic from './pages/PokemonClinic'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pokelab" element={<PokemonClinic />} />
        <Route path="/" element={<Navigate to="/pokelab" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
