import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PokemonClinic from "./pages/PokemonClinic";
import PokemonTrainer from "./pages/PokemonTrainer";
//import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/pokelab">
      <div className="app">
        <div className="app-route-content">
          <Routes>
            <Route path="/" element={<PokemonClinic />} />
            <Route path="/treinador" element={<PokemonTrainer />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;