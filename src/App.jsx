import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PokemonClinic from "./pages/PokemonClinic";
import PokemonTrainer from "./pages/PokemonTrainer";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/pokelab">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />}/>
        <Route path="/pokelab" element={<PokemonClinic />} />
        <Route path="/treinador" element={<PokemonTrainer />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
