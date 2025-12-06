import React, { useState, useEffect } from 'react';
import './PokemonTrainer.css';

const dummyPokemons = [
  
];

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
  const [symptoms, setSymptoms] = useState('');
  const [pokemonStatus, setPokemonStatus] = useState(null);
  const [registeredPokemons, setRegisteredPokemons] = useState(dummyPokemons);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Efeito para buscar o status do Pokémon (com debounce para não sobrecarregar a API)
  useEffect(() => {
    if (!pokemonName.trim()) {
      setPokemonStatus(null);
      setError('');
      return;
    }

    // Limpa qualquer erro anterior ao iniciar uma nova busca
    setError('');

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const status = await fetchPokemonStatus(pokemonName);
        setPokemonStatus(status);
        // Garante que o tipo é setado para facilitar a validação posterior
        if (status && !status.type) status.type = 'Unknown'; 
      } catch (e) {
        // Exibe o erro retornado pela função de busca
        setError(e.message || 'Erro desconhecido ao buscar o Pokémon.');
        setPokemonStatus(null);
      } finally {
        setIsLoading(false);
      }
    }, 800); // 800ms de atraso após a digitação parar

    // Função de limpeza: cancela o timer se o nome mudar ou o componente for desmontado
    return () => clearTimeout(delayDebounceFn);
  }, [pokemonName]);

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!pokemonName.trim() || !symptoms.trim()) {
        setError('Por favor, preencha o nome do Pokémon e os sintomas.');
        return;
    }
    
    if (isLoading) {
        setError('Aguarde a busca dos dados do Pokémon ser finalizada.');
        return;
    }

    if (!pokemonStatus) {
        setError('Não foi possível obter os dados do Pokémon. Verifique o nome e tente novamente.');
        return;
    }

    const newPokemon = {
      id: Date.now(),
      name: pokemonName.trim().charAt(0).toUpperCase() + pokemonName.trim().slice(1).toLowerCase(), // Nome capitalizado
      symptoms: symptoms.trim(),
      status: pokemonStatus,
      progress: 'Aguardando triagem',
      diagnosis: 'Aguardando',
    };

    setRegisteredPokemons(prev => [...prev, newPokemon]);
    
    // Resetar formulário
    setPokemonName('');
    setSymptoms('');
    setPokemonStatus(null);
    setError('');
    
    alert(`Pokémon ${newPokemon.name} registrado com sucesso!`);
    setActiveTab('list');
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
        <label htmlFor="pokemonName">Nome do Pokémon</label>
        <input 
          id="pokemonName"
          type="text"
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
          placeholder="Ex: Pikachu, Bulbasaur..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="symptoms">Sintomas</label>
        <textarea
          id="symptoms"
          rows="4"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Descreva os sintomas do seu Pokémon (Ex: Não quer comer, está com febre, tosse, etc.)"
          required
        />
      </div>

      {pokemonName && renderStatusCard()}

      {error && <p className="error-message">⚠️ {error}</p>}
      
      <button type="submit" className="register-button" disabled={isLoading || !pokemonStatus}>
        {isLoading ? 'Aguarde a busca...' : 'Cadastrar Pokémon'}
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
              <th>Sintomas</th>
              <th>Progresso</th>
              <th>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {registeredPokemons.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                {/* O tipo é convertido para minúsculo para a classe CSS */}
                <td><span className={`type-tag type-${p.status.type.toLowerCase()}`}>{p.status.type}</span></td> 
                <td>{p.symptoms}</td>
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
  );
};

export default PokemonTrainer;