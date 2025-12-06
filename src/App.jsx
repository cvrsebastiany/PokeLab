import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PokemonClinic from "./pages/PokemonClinic";
import PokemonTrainer from "./pages/PokemonTrainer";
import PokemonTecnicoLab from "./pages/PokemonTecnicoLab";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/pokelab">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />}/>
        <Route path="/atendimento" element={<PokemonClinic />} />
        <Route path="/treinador" element={<PokemonTrainer />} />
        <Route path="/tecnico" element={<PokemonTecnicoLab />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
