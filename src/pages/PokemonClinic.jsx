// PokemonClinic.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import './PokemonClinic.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3004/pokelab-api';
const API_AUTH_ME_URL = `${API_BASE}/auth/me`;
const API_POKEMON_URL = `${API_BASE}/pokemon`;

function PokemonClinic() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [isLoadingPokemons, setIsLoadingPokemons] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(API_AUTH_ME_URL, { credentials: 'include' });
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
      try {
        const response = await fetch(API_POKEMON_URL, { credentials: 'include' });
        if (!response.ok) throw new Error('Falha ao buscar pokémons.');
        const data = await response.json();
        setAllPokemons(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingPokemons(false);
      }
    };
    fetchPokemons();
  }, []);

  const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'healthy':
      return 'status-healthy';
    case 'recovered':
      return 'status-recovered';
    case 'in-treatment':
      return 'status-waiting';
    case 'sick':
      return 'status-sick';
    default:
      return 'status-unknown';
  }
};

  const filteredPokemons = allPokemons.filter((pokemon) =>
    pokemon?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="app">
      <Header user={currentUser} />

      <div className="container">

        <main className="main-content">
          <h2 className="dashboard-title">Dashboard Médico</h2>

          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nome do Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {isLoadingPokemons ? (
            <p>Carregando pokémons...</p>
          ) : filteredPokemons.length === 0 ? (
            <p>{searchTerm ? 'Nenhum pokémon encontrado.' : 'Nenhum pokémon registrado.'}</p>
          ) : (
            <div className="pokemon-cards">
              {filteredPokemons.map((p) => (
                <div key={p.id} className="pokemon-card">
                  {p?.imageUrl && (
                    <div className="card-image">
                      <img src={p.imageUrl} alt={p?.name || 'Pokemon'} />
                    </div>
                  )}
                  <div className="card-header">
                    <h3>{p?.name ?? '-'}</h3>
                    <span className={`status-badge ${getStatusClass(p?.status)}`}>
                      {p?.status ?? 'waiting'}
                    </span>
                  </div>

                  <div className="card-body">
                    <p><strong>Espécie:</strong> {p?.species ?? '-'}</p>
                    <p><strong>Tipo:</strong> {p?.type ?? '-'}</p>
                    <p>
                      <strong>Último Checkup:</strong>{' '}
                      {p?.lastCheckup ? new Date(p.lastCheckup).toLocaleDateString() : '-'}
                    </p>
                    <p><strong>Notas:</strong> {p?.notes ?? '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PokemonClinic;
