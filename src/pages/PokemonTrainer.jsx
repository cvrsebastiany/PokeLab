import React, { useState, useEffect } from 'react';
import './PokemonTrainer.css';
import Header from '../components/Header'


const dummyPokemons = [
  
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3004/pokelab-api';
const API_POKEMON_URL = `${API_BASE}/pokemon`;
const API_AUTH_ME_URL = `${API_BASE}/auth/me`;


/**
 * Função REAL para buscar dados do Pokémon na PokeAPI
 * @param {string} name - Nome do Pokémon
 */
const fetchPokemonStatus = async (name) => {
  const lowerName = name.toLowerCase().trim();
  if (!lowerName) return null;

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${lowerName}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pokémon não encontrado. Verifique o nome.');
      }
      throw new Error(`Erro ao buscar dados: ${response.statusText}`);
    }

    const data = await response.json();

    // Extrair os dados relevantes
    const stats = data.stats.reduce((acc, stat) => {
      // Mapeia os nomes das stats
      if (stat.stat.name === 'hp') acc.hp = stat.base_stat;
      if (stat.stat.name === 'attack') acc.attack = stat.base_stat;
      if (stat.stat.name === 'defense') acc.defense = stat.base_stat;
      return acc;
    }, {});
    
    // Pega o primeiro tipo do array de tipos
    const type = data.types.length > 0 
      ? data.types[0].type.name.charAt(0).toUpperCase() + data.types[0].type.name.slice(1) // Capitaliza o tipo
      : 'Unknown';

    return { 
      ...stats, 
      type 
    };
    
  } catch (error) {
    console.error("Erro na PokeAPI:", error);
    // Propaga o erro para ser tratado no useEffect
    throw error; 
  }
};

const PokemonTrainer = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [pokemonName, setPokemonName] = useState('');
  const [species, setSpecies] = useState('');
  const [pokemonStatus, setPokemonStatus] = useState(null);
  const [registeredPokemons, setRegisteredPokemons] = useState(dummyPokemons);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        console.log('Fetching current user from:', API_AUTH_ME_URL);
        const response = await fetch(API_AUTH_ME_URL, {
          credentials: 'include',
        });
        
        console.log('Auth response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setCurrentUser(userData);
        } else {
          console.warn('User not authenticated, login required');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
        console.log('Finished loading user');
      }
    };

    fetchCurrentUser();
  }, []);

  // Efeito para buscar o status do Pokémon (com debounce para não sobrecarregar a API)
  useEffect(() => {
    if (!species.trim()) {
      setPokemonStatus(null);
      setError('');
      return;
    }

    // Limpa qualquer erro anterior ao iniciar uma nova busca
    setError('');

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const status = await fetchPokemonStatus(species);
        setPokemonStatus(status);
        if (status && !status.type) status.type = 'Unknown';
      } catch (e) {
        setError(e.message || 'Erro desconhecido ao buscar o Pokémon.');
        setPokemonStatus(null);
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [species]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    if (!pokemonName.trim() || !species.trim()) {
      setError('Por favor, preencha o nome do seu Pokémon e a espécie.');
      return;
    }
    
    if (isLoading) {
        setError('Aguarde a busca dos dados do Pokémon ser finalizada.');
        return;
    }

    if (isSaving) return;

    if (!pokemonStatus) {
        setError('Não foi possível obter os dados do Pokémon. Verifique o nome e tente novamente.');
        return;
    }

    if (isLoadingUser) {
        console.log('Still loading user, showing loading message');
        setError('Carregando informações do usuário. Aguarde...');
        return;
    }

    console.log('Current user state:', currentUser);
    
    if (!currentUser || !currentUser.id) {
        console.log('User not authenticated');
        setError('Usuário não autenticado. Por favor, faça login novamente.');
        return;
    }

    setError('');
    setIsSaving(true);

    try {
      const trainerId = currentUser.id;

      const payload = {
        name: pokemonName.trim(),
        species: species.trim(),
        type: pokemonStatus.type,
        hp: pokemonStatus.hp,
        attack: pokemonStatus.attack,
        defense: pokemonStatus.defense,
        trainerId,
      };

      const response = await fetch(API_POKEMON_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Erro ao cadastrar Pokémon na API.');
      }

      const saved = await response.json().catch(() => null);

      const newPokemon = {
        id: saved?.id ?? Date.now(),
        name: pokemonName.trim().charAt(0).toUpperCase() + pokemonName.trim().slice(1).toLowerCase(), // Nome capitalizado
        species: species.trim(),
        status: pokemonStatus,
        progress: 'Aguardando triagem',
        diagnosis: 'Aguardando',
      };

      setRegisteredPokemons(prev => [...prev, newPokemon]);
      
      // Resetar formulário
      setPokemonName('');
      setSpecies('');
      setPokemonStatus(null);
      setError('');
      
      alert(`Pokémon ${newPokemon.name} registrado com sucesso!`);
      setActiveTab('list');
    } catch (apiError) {
      setError(apiError.message || 'Erro ao salvar o Pokémon.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusCard = () => (
    <div className="status-card">
        <h3>✨ Status Básico do Pokémon</h3>
        {isLoading ? (
            <p>Carregando dados da PokeAPI...</p>
        ) : pokemonStatus ? (
            <div className="status-details">
                {/* O tipo agora virá da API e terá a primeira letra maiúscula */}
                <p><strong>Tipo:</strong> <span className={`type-tag type-${pokemonStatus.type.toLowerCase()}`}>{pokemonStatus.type}</span></p>
                <p><strong>HP (Vida):</strong> {pokemonStatus.hp}</p>
                <p><strong>Ataque:</strong> {pokemonStatus.attack}</p>
                <p><strong>Defesa:</strong> {pokemonStatus.defense}</p>
            </div>
        ) : (
            <p>Digite um nome de Pokémon válido (em português ou inglês) para buscar os dados.</p>
        )}
    </div>
  );
  
  const renderRegisterTab = () => (
    <form className="register-form" onSubmit={handleRegister}>
      <div className="form-group">
        <label htmlFor="pokemonName">Nome do seu Pokémon</label>
        <input 
          id="pokemonName"
          type="text"
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
          placeholder="Ex: Roberto, Marcos, Muriel..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="species">Espécie do Pokémon</label>
        <input
          id="species"
          type="text"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          placeholder="Ex: Pikachu, Bulbasaur..."
          required
        />
      </div>

      {species && renderStatusCard()}

      {error && <p className="error-message">⚠️ {error}</p>}
      
      <button type="submit" className="register-button" disabled={isLoading || isSaving || !pokemonStatus || isLoadingUser}>
        {isSaving ? 'Salvando...' : isLoading ? 'Aguarde a busca...' : isLoadingUser ? 'Carregando...' : 'Cadastrar Pokémon'}
      </button>
    </form>
  );

  const renderListTab = () => (
    <div className="pokemon-list">
      {registeredPokemons.length === 0 ? (
        <p className="no-pokemons">Nenhum Pokémon cadastrado ainda. Use a aba "Cadastrar" para começar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pokémon</th>
              <th>Tipo</th>
              <th>Espécie</th>
              <th>Progresso</th>
              <th>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {registeredPokemons.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td><span className={`type-tag type-${p.status.type.toLowerCase()}`}>{p.status.type}</span></td> 
                <td>{p.species}</td>
                <td><span className={`progress-tag progress-${p.progress.toLowerCase().split(' ').join('-')}`}>{p.progress}</span></td>
                <td>{p.diagnosis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className="container">
        <div className="main-content">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => setActiveTab('register')}
            >
              ➕ Cadastrar Pokémon
            </button>
            <button 
              className={`tab ${activeTab === 'list' ? 'active' : ''}`} 
              onClick={() => setActiveTab('list')}
            >
              📋 Pokémons Cadastrados
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'register' && renderRegisterTab()}
            {activeTab === 'list' && renderListTab()}
          </div>
        </div>
      </div>
    </>
  );
};

export default PokemonTrainer;