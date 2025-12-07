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
  const [examFormData, setExamFormData] = useState({});
  const [isSavingExam, setIsSavingExam] = useState(false);

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

  const handleSaveExamResults = async () => {
    if (!exameSelecionado || isSavingExam) return;

    setIsSavingExam(true);
    try {
      let apiUrl = API_EXAMES_URL;
      if (exameSelecionado.tipoExame === 'Urina') {
        apiUrl = API_EXAMES_URINA_URL;
      } else if (exameSelecionado.tipoExame === 'Bioquímica') {
        apiUrl = API_EXAMES_BIOQUIMICA_URL;
      }

      const cleanedData = {};
      Object.keys(examFormData).forEach(key => {
        const value = examFormData[key];
        const inputType = getInputTypeForField(key);
        
        if (inputType === 'number') {
          cleanedData[key] = value === '' || value === null || value === undefined 
            ? null 
            : Number(value);
        } else {
          cleanedData[key] = value === '' ? null : value;
        }
      });

      const payload = {
        ...cleanedData,
        status: 'Concluído',
        dataResultado: new Date().toISOString(),
        tecnicoId: currentUser?.id,
      };

      const response = await fetch(`${apiUrl}/${exameSelecionado.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar resultados do exame');
      }

      if (exameSelecionado.tipoExame === 'Hemograma') {
        setExames(prev => prev.map(e => 
          e.id === exameSelecionado.id ? { ...e, ...payload } : e
        ));
      } else if (exameSelecionado.tipoExame === 'Urina') {
        setExamesUrina(prev => prev.map(e => 
          e.id === exameSelecionado.id ? { ...e, ...payload } : e
        ));
      } else if (exameSelecionado.tipoExame === 'Bioquímica') {
        setExamesBioquimica(prev => prev.map(e => 
          e.id === exameSelecionado.id ? { ...e, ...payload } : e
        ));
      }

      alert('Resultados salvos com sucesso!');
      setExameSelecionado(null);
      setExamFormData({});
    } catch (error) {
      console.error('Erro ao salvar exame:', error);
      alert('Erro ao salvar resultados. Tente novamente.');
    } finally {
      setIsSavingExam(false);
    }
  };

  const handleExamFieldChange = (campo, value) => {
    setExamFormData(prev => ({
      ...prev,
      [campo]: value,
    }));
  };

  const getInputTypeForField = (campo) => {
    const lowerCampo = campo.toLowerCase();
    if (lowerCampo.includes('ph') || 
        lowerCampo.includes('hemoglobina') || 
        lowerCampo.includes('leucocitos') || 
        lowerCampo.includes('plaquetas') ||
        lowerCampo.includes('proteinas') ||
        lowerCampo.includes('glicose') ||
        lowerCampo.includes('ureia') ||
        lowerCampo.includes('creatinina') ||
        lowerCampo.includes('colesterol') ||
        lowerCampo.includes('triglicerideos') ||
        lowerCampo.includes('alt') ||
        lowerCampo.includes('ast') ||
        lowerCampo.includes('fosfatase') ||
        lowerCampo.includes('bilirrubina') ||
        lowerCampo.includes('calcio') ||
        lowerCampo.includes('fosforo') ||
        lowerCampo.includes('magnesio') ||
        lowerCampo.includes('sodio') ||
        lowerCampo.includes('potassio') ||
        lowerCampo.includes('cloro')) {
      return 'number';
    }
    return 'text';
  };

  const getInputPropsForField = (campo) => {
    const lowerCampo = campo.toLowerCase();
    const props = { type: getInputTypeForField(campo) };
    
    if (props.type === 'number') {
      props.step = '0.01';
      props.min = '0';
      
      if (lowerCampo.includes('ph')) {
        props.max = '14';
      } else if (lowerCampo.includes('hemoglobina')) {
        props.max = '25';
      } else if (lowerCampo.includes('leucocitos') || lowerCampo.includes('plaquetas')) {
        props.max = '999999';
      } else if (lowerCampo.includes('proteinas') || lowerCampo.includes('creatinina')) {
        props.max = '999.99';
      } else {
        props.max = '9999.99';
      }
    }
    
    return props;
  };

  const handleOpenExam = (exame) => {
    setExameSelecionado(exame);
    const initialData = {};
    exame.campos.forEach(campo => {
      initialData[campo] = exame[campo] || '';
    });
    setExamFormData(initialData);
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
                  const statusNormalized = (exame.status || "").toString().toLowerCase();
                  const isPendente = statusNormalized === "pendente";
                  const isConcluido = statusNormalized.startsWith("conclu");
                  const examNome = exame.tipoExame || exame.tipo || exame.nome || exame.name || `Exame #${examId}`;
                  const dataConclusao = exame.dataResultado || exame.dataresultado || exame.data_conclusao;
                  const statusClass = isConcluido ? "concluido" : isPendente ? "pendente" : "outro";
                  const metadataKeys = new Set(['id', 'pokemon', 'pokemonId', 'tecnico', 'tecnicoId', 'status', 'observacoes', 'dataColeta', 'dataResultado', 'createdAt', 'updatedAt', 'tipoExame']);
                  const examCampos = Object.keys(exame).filter(key => !metadataKeys.has(key));
                  return (
                    <div
                      key={`${exame.tipoExame || ''}-${examId}`}
                      className={`exam-card ${!isPendente ? "exam-card-disabled" : ""}`}
                      onClick={() => {
                        if (!isPendente) return;
                        handleOpenExam({ ...exame, tipo: examNome, campos: examCampos });
                      }}
                    >
                      <h3>{examNome}</h3>
                      <p className={`exam-status exam-status-${statusClass}`}>{exame.status}</p>
                      {isConcluido && dataConclusao && (
                        <p className="exam-completed-at">
                          {`Concluído em ${new Date(dataConclusao).toLocaleString('pt-BR')}`}
                        </p>
                      )}
                      {isPendente && <p>Clique para preencher resultados</p>}
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
            {(exameSelecionado.campos || []).map((campo) => {
              const inputProps = getInputPropsForField(campo);
              return (
                <div key={campo} className="editor-group">
                  <label>{campo}</label>
                  <input 
                    {...inputProps}
                    placeholder={`Informe ${campo}`}
                    value={examFormData[campo] || ""}
                    onChange={(e) => handleExamFieldChange(campo, e.target.value)}
                  />
                </div>
              );
            })}
            <div className="editor-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setExameSelecionado(null);
                  setExamFormData({});
                }}
                disabled={isSavingExam}
              >
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={handleSaveExamResults}
                disabled={isSavingExam}
              >
                {isSavingExam ? 'Salvando...' : 'Salvar resultados'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonTecnicoLab;
