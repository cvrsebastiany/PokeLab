import { useState, useEffect } from "react";
import Header from "../components/Header";
import PokemonSidebar from "../components/PokemonSidebar";
import "./PokemonTecnicoLab.css";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3004/pokelab-api';
const API_AUTH_ME_URL = `${API_BASE}/auth/me`;

function PokemonTecnicoLab() {
  const pokemons = [
    { id: 1, nome: "Pikachu", tipo: "Elétrico", nivel: 25 },
    { id: 2, nome: "Bulbasaur", tipo: "Planta", nivel: 18 },
    { id: 3, nome: "Charmander", tipo: "Fogo", nivel: 20 },
  ];

  const abas = [
    { id: "resumo", label: "Resumo" },
    { id: "observacoes", label: "Observações" },
  ];

  const examesSolicitadosMock = [
    {
      id: 1,
      tipo: "Hemograma",
      status: "Pendente",
      campos: ["Hemoglobina", "Leucócitos", "Plaquetas"],
    },
    {
      id: 2,
      tipo: "Urina",
      status: "Pendente",
      campos: ["Cor", "pH", "Proteínas"],
    },
    {
      id: 3,
      tipo: "Bioquímica",
      status: "Pendente",
      campos: ["Glicose", "Ureia", "Creatinina"],
    },
  ];

  const [pokemonSelecionado, setPokemonSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("resumo");
  const [exameSelecionado, setExameSelecionado] = useState(null);
  const [observacoes, setObservacoes] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(API_AUTH_ME_URL, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const pokemonSidebarData = pokemonSelecionado || {
    nome: "Nenhum Pokémon selecionado",
    tipo: "-",
    nivel: "-",
  };

  return (
    <div className="app">
      <Header user={currentUser} />

      <div className="container">
        <PokemonSidebar pokemon={pokemonSidebarData} />

        <main className="main-content">
          <div className="pokemon-selector">
            <label>Selecione um Pokémon para acompanhar:</label>
            <select
              value={pokemonSelecionado?.id || ""}
              onChange={(e) => {
                const selecionado =
                  pokemons.find((p) => p.id === Number(e.target.value)) || null;

                setPokemonSelecionado(selecionado);
                setAbaAtiva("resumo");
              }}
            >
              <option value="">Selecione</option>
              {pokemons.map((pokemon) => (
                <option key={pokemon.id} value={pokemon.id}>
                  {pokemon.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="tabs">
            {abas.map((aba) => (
              <button
                key={aba.id}
                className={`tab ${abaAtiva === aba.id ? "active" : ""}`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {!pokemonSelecionado && (
              <p>Selecione um Pokémon para visualizar os exames.</p>
            )}

            {pokemonSelecionado && abaAtiva === "resumo" && (
              <>
                <h2 className="section-title">Exames solicitados</h2>

                <div className="exam-cards">
                  {examesSolicitadosMock.map((exame) => (
                    <div
                      key={exame.id}
                      className="exam-card"
                      onClick={() => setExameSelecionado(exame)}
                    >
                      <h3>{exame.tipo}</h3>
                      <span className="status">{exame.status}</span>
                      <p>Clique para preencher resultados</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pokemonSelecionado && abaAtiva === "observacoes" && (
              <div className="observacoes">
                <h2 className="section-title">Observações do técnico</h2>

                <textarea
                  placeholder="Digite observações relevantes sobre os exames..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />

                <button
                  className="btn-save"
                  onClick={() =>
                    alert("Observações salvas (mock)")
                  }
                >
                  Salvar observações
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {exameSelecionado && (
        <div className="exam-editor-overlay">
          <div className="exam-editor">
            <h2>{exameSelecionado.tipo}</h2>

            {exameSelecionado.campos.map((campo) => (
              <div key={campo} className="editor-group">
                <label>{campo}</label>
                <input type="text" placeholder={`Informe ${campo}`} />
              </div>
            ))}

            <div className="editor-actions">
              <button
                className="btn-cancel"
                onClick={() => setExameSelecionado(null)}
              >
                Cancelar
              </button>

              <button
                className="btn-save"
                onClick={() => {
                  alert("Resultados salvos");
                  setExameSelecionado(null);
                }}
              >
                Salvar resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonTecnicoLab;
