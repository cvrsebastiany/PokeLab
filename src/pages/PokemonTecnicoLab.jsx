import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import PokemonSidebar from "../components/PokemonSidebar";
import "./PokemonTecnicoLab.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://saudedigital.ufcspa.edu.br/pokelab-api";
const API_AUTH_ME_URL = `${API_BASE}/auth/me`;
const API_POKEMON_URL = `${API_BASE}/pokemon`;
const API_EXAMES_URL = `${API_BASE}/exames`;
const API_EXAMES_URINA_URL = `${API_BASE}/exames-urina`;
const API_EXAMES_BIOQUIMICA_URL = `${API_BASE}/exames-bioquimica`;

function PokemonTecnicoLab() {
  const abas = [
    { id: "resumo", label: "Resumo" },
    { id: "observacoes", label: "Observações" },
  ];
  const [pokemonSelecionado, setPokemonSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("resumo");
  const [exameSelecionado, setExameSelecionado] = useState(null);
  const [observacoes, setObservacoes] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [pokemonsRaw, setPokemonsRaw] = useState([]);
  const [pokemons, setPokemons] = useState([]);
  const [isLoadingPokemons, setIsLoadingPokemons] = useState(true);
  const [isLoadingPokemonDetail, setIsLoadingPokemonDetail] = useState(false);
  const [exames, setExames] = useState([]);
  const [examesUrina, setExamesUrina] = useState([]);
  const [examesBioquimica, setExamesBioquimica] = useState([]);
  const [isLoadingExames, setIsLoadingExames] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(API_AUTH_ME_URL, {
          credentials: "include",
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

  useEffect(() => {
    const fetchPokemons = async () => {
      setIsLoadingPokemons(true);
      setErroCarregamento("");
      try {
        const response = await fetch(API_POKEMON_URL, { credentials: "include" });
        if (!response.ok) throw new Error("Não foi possível carregar os Pokémons.");
        const data = await response.json();
        const list = Array.isArray(data) ? data : [data];
        console.log("🔍 Pokémons carregados:", list);
        const p37 = list.find(p => p.id === 37 || p.id === "37");
        console.log("🔍 Pokemon 37:", p37);
        console.log("🔍 Pokemon 37 keys:", p37 ? Object.keys(p37) : "not found");
        console.log("🔍 Pokemon 37 examRequests:", p37?.examRequests);
        console.log("🔍 Pokemon 37 examesSolicitados:", p37?.examesSolicitados);
        console.log("🔍 Pokemon 37 exams:", p37?.exams);
        console.log("🔍 Pokemon 37 exames:", p37?.exames);
        setPokemonsRaw(list);
      } catch (error) {
        console.error("Erro ao carregar pokémons:", error);
        setErroCarregamento("Falha ao carregar lista de Pokémons.");
      } finally {
        setIsLoadingPokemons(false);
      }
    };

    fetchPokemons();
  }, []);

  useEffect(() => {
    const fetchExames = async () => {
      setIsLoadingExames(true);
      try {
        const [responseHemograma, responseUrina, responseBioquimica] = await Promise.all([
          fetch(API_EXAMES_URL, { credentials: "include" }),
          fetch(API_EXAMES_URINA_URL, { credentials: "include" }),
          fetch(API_EXAMES_BIOQUIMICA_URL, { credentials: "include" })
        ]);

        const dataHemograma = responseHemograma.ok ? await responseHemograma.json() : [];
        const dataUrina = responseUrina.ok ? await responseUrina.json() : [];
        const dataBioquimica = responseBioquimica.ok ? await responseBioquimica.json() : [];

        const hemogramaList = Array.isArray(dataHemograma) ? dataHemograma : [dataHemograma];
        const urinaList = Array.isArray(dataUrina) ? dataUrina : [dataUrina];
        const bioquimicaList = Array.isArray(dataBioquimica) ? dataBioquimica : [dataBioquimica];

        console.log("🔍 Exames Hemograma carregados:", hemogramaList);
        console.log("🔍 Exames Urina carregados:", urinaList);
        console.log("🔍 Exames Bioquímica carregados:", bioquimicaList);

        setExames(hemogramaList);
        setExamesUrina(urinaList);
        setExamesBioquimica(bioquimicaList);
      } catch (error) {
        console.error("Erro ao carregar exames:", error);
      } finally {
        setIsLoadingExames(false);
      }
    };

    fetchExames();
  }, []);

  const pokemonIdsWithPendingExams = useMemo(() => {
    const allExames = [...(exames || []), ...(examesUrina || []), ...(examesBioquimica || [])];
    const ids = allExames
      .filter((exame) => exame.status === "Pendente" || exame.status === "pendente")
      .map((exame) => exame.pokemonId ?? exame.pokemon_id)
      .filter(Boolean)
      .map((id) => id.toString());

    console.log("🔍 Pokémon IDs com exames pendentes:", ids);
    return new Set(ids);
  }, [exames, examesUrina, examesBioquimica]);

  useEffect(() => {
    // Filter pokémons to show only those with pending exams
    const filtered = pokemonsRaw.filter((pokemon) => {
      const pokemonId = pokemon.id?.toString();
      return pokemonId && pokemonIdsWithPendingExams.has(pokemonId);
    });
    console.log("🔍 Pokémons filtrados:", filtered);
    setPokemons(filtered);
  }, [pokemonsRaw, pokemonIdsWithPendingExams]);

  const examesDosPokemonSelecionado = useMemo(() => {
    if (!pokemonSelecionado) return [];
    const pokemonId = pokemonSelecionado.id?.toString();
    
    const hemogramas = (exames || []).filter((exame) => {
      const examPokemonId = (exame.pokemonId ?? exame.pokemon_id)?.toString();
      return examPokemonId === pokemonId;
    }).map(e => ({ ...e, tipoExame: 'Hemograma' }));

    const urinas = (examesUrina || []).filter((exame) => {
      const examPokemonId = (exame.pokemonId ?? exame.pokemon_id)?.toString();
      return examPokemonId === pokemonId;
    }).map(e => ({ ...e, tipoExame: 'Urina' }));

    const bioquimicas = (examesBioquimica || []).filter((exame) => {
      const examPokemonId = (exame.pokemonId ?? exame.pokemon_id)?.toString();
      return examPokemonId === pokemonId;
    }).map(e => ({ ...e, tipoExame: 'Bioquímica' }));

    return [...hemogramas, ...urinas, ...bioquimicas];
  }, [pokemonSelecionado, exames, examesUrina, examesBioquimica]);

  const safeText = (value, fallback = "-") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object") {
      const candidate = value.nome || value.name || value.email || value.id;
      return candidate || fallback;
    }
    return fallback;
  };

  const normalizeSidebarData = (pokemon) => {
    if (!pokemon) {
      return {
        name: "Nenhum Pokémon selecionado",
        id: "-",
        type: "-",
        species: "-",
        trainer: "-",
        nature: "-",
        avatar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/494.svg",
      };
    }

    return {
      name: safeText(pokemon.name || pokemon.nome, "Pokémon"),
      id: `#${pokemon.id || "-"}`,
      type: safeText(pokemon.type || pokemon.tipo, "-"),
      species: safeText(pokemon.species || pokemon.especie || pokemon.specie, "-"),
      trainer: safeText(pokemon.trainer || pokemon.treinador || pokemon.owner || pokemon.usuario, "-"),
      nature: safeText(pokemon.nature || pokemon.natureza, "-"),
      avatar: pokemon.imageUrl || pokemon.avatar || pokemon.image || "",
    };
  };

  const pokemonSidebarData = normalizeSidebarData(pokemonSelecionado);

  const handleSelectPokemon = async (selectedId) => {
    if (!selectedId) {
      setPokemonSelecionado(null);
      setExameSelecionado(null);
      return;
    }

    setIsLoadingPokemonDetail(true);
    setErroCarregamento("");
    try {
      const response = await fetch(`${API_POKEMON_URL}/${selectedId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Não foi possível carregar o Pokémon.");
      const data = await response.json();
      setPokemonSelecionado(data);
      setAbaAtiva("resumo");
    } catch (error) {
      console.error("Erro ao carregar Pokémon:", error);
      setErroCarregamento("Falha ao carregar dados do Pokémon selecionado.");
    } finally {
      setIsLoadingPokemonDetail(false);
    }
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
              onChange={(e) => handleSelectPokemon(e.target.value)}
              disabled={isLoadingPokemons}
            >
              <option value="">Selecione</option>
              {pokemons.map((pokemon) => (
                <option key={pokemon.id} value={pokemon.id}>
                  {pokemon.name || pokemon.nome || pokemon.id}
                </option>
              ))}
            </select>
            {isLoadingPokemons && <span>Carregando pokémons...</span>}
            {erroCarregamento && <span className="erro-texto">{erroCarregamento}</span>}
            {!isLoadingPokemons && !isLoadingExames && pokemons.length === 0 && !erroCarregamento && (
              <span className="erro-texto">Nenhum Pokémon com exames pendentes.</span>
            )}
            {isLoadingPokemonDetail && <span>Carregando detalhes...</span>}
          </div>

          <div className="tabs">
            {!isLoadingExames && (
              examesDosPokemonSelecionado.length > 0 ? (
                examesDosPokemonSelecionado.map((exame) => {
                  const examId = exame.id ?? exame.exameId ?? exame.codigo;
                  const isPendente = exame.status === "Pendente" || exame.status === "pendente";
                  const examNome = exame.tipoExame || exame.tipo || exame.nome || exame.name || `Exame #${examId}`;
                  // Extract field names from the exam object (exclude metadata)
                  const metadataKeys = new Set(['id', 'pokemon', 'pokemonId', 'tecnico', 'tecnicoId', 'status', 'observacoes', 'dataColeta', 'dataResultado', 'createdAt', 'updatedAt', 'tipoExame']);
                  const examCampos = Object.keys(exame).filter(key => !metadataKeys.has(key));
                  return (
                    <div
                      key={`${exame.tipoExame || ''}-${examId}`}
                      className={`exam-card ${!isPendente ? "exam-card-disabled" : ""}`}
                      onClick={() => {
                        if (!isPendente) return;
                        setExameSelecionado({ ...exame, tipo: examNome, campos: examCampos });
                      }}
                    >
                      <h3>{examNome}</h3>
                      <p className="exam-status">{exame.status}</p>
                      <p>{isPendente ? "Clique para preencher resultados" : "Exame já finalizado"}</p>
                    </div>
                  );
                })
              ) : (
                <p>Nenhum exame encontrado para este Pokémon.</p>
              )
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
            {(exameSelecionado.campos || []).map((campo) => (
              <div key={campo} className="editor-group">
                <label>{campo}</label>
                <input 
                  type="text" 
                  placeholder={`Informe ${campo}`}
                  defaultValue={exameSelecionado[campo] || ""}
                />
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
