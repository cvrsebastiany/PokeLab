import { useState, useEffect } from 'react';
import Header from '../components/Header';
import './PokemonClinic.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3004/pokelab-api';
const API_AUTH_ME_URL = `${API_BASE}/auth/me`;
const API_POKEMON_URL = `${API_BASE}/pokemon`;
const API_EXAMES_URL = `${API_BASE}/exames`;
const API_EXAMES_BIOQUIMICA_URL = `${API_BASE}/exames-bioquimica`;
const API_EXAMES_URINA_URL = `${API_BASE}/exames-urina`;
const API_TREATMENT_UPDATES_URL = `${API_BASE}/treatment-updates`;

function PokemonClinic() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [isLoadingPokemons, setIsLoadingPokemons] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonExams, setPokemonExams] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [examType, setExamType] = useState('hemograma');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [treatmentUpdates, setTreatmentUpdates] = useState([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');

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
      case 'saudável':
        return 'status-healthy';
      case 'curado':
        return 'status-recovered';
      case 'em tratamento':
        return 'status-waiting';
      case 'doente':
        return 'status-sick';
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

  const fetchPokemonExams = async (pokemonId) => {
    setIsLoadingExams(true);
    try {
      const [examesRes, bioquimicaRes, urinaRes] = await Promise.all([
        fetch(`${API_EXAMES_URL}?pokemonId=${pokemonId}`, { credentials: 'include' }),
        fetch(`${API_EXAMES_BIOQUIMICA_URL}?pokemonId=${pokemonId}`, { credentials: 'include' }),
        fetch(`${API_EXAMES_URINA_URL}?pokemonId=${pokemonId}`, { credentials: 'include' })
      ]);

      const exames = examesRes.ok ? await examesRes.json() : [];
      const bioquimica = bioquimicaRes.ok ? await bioquimicaRes.json() : [];
      const urina = urinaRes.ok ? await urinaRes.json() : [];

      const allExams = [
        ...(Array.isArray(exames) ? exames.map(e => ({ ...e, tipo: 'Hemograma' })) : []),
        ...(Array.isArray(bioquimica) ? bioquimica.map(e => ({ ...e, tipo: 'Bioquímica' })) : []),
        ...(Array.isArray(urina) ? urina.map(e => ({ ...e, tipo: 'Urina' })) : [])
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPokemonExams(allExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setPokemonExams([]);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const fetchTreatmentUpdates = async (pokemonId) => {
    setIsLoadingUpdates(true);
    try {
      const response = await fetch(`${API_TREATMENT_UPDATES_URL}?pokemonId=${pokemonId}`, { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        setTreatmentUpdates(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
      } else {
        setTreatmentUpdates([]);
      }
    } catch (error) {
      console.error('Error fetching treatment updates:', error);
      setTreatmentUpdates([]);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setShowExamForm(false);
    setIsEditingStatus(false);
    setNewStatus(pokemon.status || '');
    setShowUpdateForm(false);
    setNewUpdate('');
    fetchPokemonExams(pokemon.id);
    fetchTreatmentUpdates(pokemon.id);
  };

  const handleRequestExam = async () => {
    if (!selectedPokemon) return;

    try {
      const examData = { pokemonId: selectedPokemon.id };
      let url = API_EXAMES_URL;
      
      if (examType === 'bioquimica') {
        url = API_EXAMES_BIOQUIMICA_URL;
      } else if (examType === 'urina') {
        url = API_EXAMES_URINA_URL;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        alert('Exame solicitado com sucesso!');
        setShowExamForm(false);
        fetchPokemonExams(selectedPokemon.id);
      } else {
        alert('Erro ao solicitar exame.');
      }
    } catch (error) {
      console.error('Error requesting exam:', error);
      alert('Erro ao solicitar exame.');
    }
  };

  const closePanel = () => {
    setSelectedPokemon(null);
    setPokemonExams([]);
    setShowExamForm(false);
    setIsEditingStatus(false);
    setTreatmentUpdates([]);
    setShowUpdateForm(false);
    setNewUpdate('');
  };

  const handleAddTreatmentUpdate = async () => {
    if (!selectedPokemon || !newUpdate.trim()) {
      alert('Por favor, escreva uma atualização.');
      return;
    }

    if (!currentUser?.id) {
      alert('Usuário não autenticado.');
      return;
    }

    try {
      const response = await fetch(API_TREATMENT_UPDATES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pokemonId: selectedPokemon.id,
          medicoId: currentUser.id,
          description: newUpdate.trim()
        })
      });

      if (response.ok) {
        alert('Atualização de tratamento adicionada com sucesso!');
        setNewUpdate('');
        setShowUpdateForm(false);
        fetchTreatmentUpdates(selectedPokemon.id);
      } else {
        alert('Erro ao adicionar atualização de tratamento.');
      }
    } catch (error) {
      console.error('Error adding treatment update:', error);
      alert('Erro ao adicionar atualização de tratamento.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPokemon || !newStatus) return;

    try {
      const response = await fetch(`${API_POKEMON_URL}/${selectedPokemon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedPokemon = await response.json();
        setSelectedPokemon(updatedPokemon);
        setAllPokemons(prev => prev.map(p => p.id === updatedPokemon.id ? updatedPokemon : p));
        setIsEditingStatus(false);
        alert('Status atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status.');
    }
  };


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
                <div key={p.id} className="pokemon-card" onClick={() => handleCardClick(p)}>
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

        {selectedPokemon && (
          <div className="detail-panel-overlay" onClick={closePanel}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closePanel}>×</button>
              
              <div className="panel-header">
                {selectedPokemon.imageUrl && (
                  <img src={selectedPokemon.imageUrl} alt={selectedPokemon.name} className="panel-image" />
                )}
                <div>
                  <h2>{selectedPokemon.name}</h2>
                  <div className="status-edit-container">
                    {isEditingStatus ? (
                      <div className="status-edit-form">
                        <select 
                          value={newStatus} 
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="status-select"
                        >
                          <option value="Saudável">Saudável</option>
                          <option value="Doente">Doente</option>
                          <option value="Em tratamento">Em tratamento</option>
                          <option value="Curado">Curado</option>
                        </select>
                        <button onClick={handleUpdateStatus} className="save-status-button">Salvar</button>
                        <button onClick={() => setIsEditingStatus(false)} className="cancel-status-button">Cancelar</button>
                      </div>
                    ) : (
                      <div className="status-display">
                        <span className={`status-badge ${getStatusClass(selectedPokemon.status)}`}>
                          {selectedPokemon.status}
                        </span>
                        <button onClick={() => setIsEditingStatus(true)} className="edit-status-button">✎</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="panel-details">
                <h3>Informações do Pokémon</h3>
                <p><strong>Espécie:</strong> {selectedPokemon.species || '-'}</p>
                <p><strong>Tipo:</strong> {selectedPokemon.type || '-'}</p>
                <p><strong>Treinador:</strong> {selectedPokemon.trainer?.nome || '-'}</p>
                <p><strong>Último Checkup:</strong> {selectedPokemon.lastCheckup ? new Date(selectedPokemon.lastCheckup).toLocaleDateString() : '-'}</p>
                <p><strong>Notas:</strong> {selectedPokemon.notes || '-'}</p>
              </div>

              <div className="panel-treatment-updates">
                <div className="updates-header">
                  <h3>Atualizações de Tratamento</h3>
                  <button 
                    className="add-update-button"
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                  >
                    {showUpdateForm ? 'Cancelar' : '+ Nova Atualização'}
                  </button>
                </div>

                {showUpdateForm && (
                  <div className="update-form">
                    <textarea
                      placeholder="Descreva a atualização do tratamento..."
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      className="update-textarea"
                      rows="4"
                    />
                    <button onClick={handleAddTreatmentUpdate} className="submit-update-button">
                      Adicionar Atualização
                    </button>
                  </div>
                )}

                <div className="updates-list">
                  {isLoadingUpdates ? (
                    <p>Carregando atualizações...</p>
                  ) : treatmentUpdates.length === 0 ? (
                    <p className="no-updates">Nenhuma atualização de tratamento registrada.</p>
                  ) : (
                    treatmentUpdates.map((update) => (
                      <div key={update.id} className="update-card">
                        <div className="update-header">
                          <span className="update-date">
                            {new Date(update.createdAt).toLocaleString('pt-BR')}
                          </span>
                          {update.medico && (
                            <span className="update-author">Dr. {update.medico.nome}</span>
                          )}
                        </div>
                        <p className="update-description">{update.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="panel-exams">
                <div className="exams-header">
                  <h3>Exames</h3>
                  <button 
                    className="request-exam-button"
                    onClick={() => setShowExamForm(!showExamForm)}
                  >
                    {showExamForm ? 'Cancelar' : 'Solicitar Exame'}
                  </button>
                </div>

                {showExamForm && (
                  <div className="exam-form">
                    <label>
                      Tipo de Exame:
                      <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                        <option value="hemograma">Hemograma</option>
                        <option value="bioquimica">Bioquímica</option>
                        <option value="urina">Urina</option>
                      </select>
                    </label>
                    <button onClick={handleRequestExam} className="submit-exam-button">
                      Confirmar Solicitação
                    </button>
                  </div>
                )}

                <div className="exams-list">
                  {isLoadingExams ? (
                    <p>Carregando exames...</p>
                  ) : pokemonExams.length === 0 ? (
                    <p>Nenhum exame registrado.</p>
                  ) : (
                    pokemonExams.map((exam) => (
                      <div key={`${exam.tipo}-${exam.id}`} className="exam-card">
                        <div className="exam-header">
                          <span className="exam-type">{exam.tipo}</span>
                          <span className={`exam-status status-${exam.status.toLowerCase()}`}>
                            {exam.status}
                          </span>
                        </div>
                        <p><strong>Data:</strong> {new Date(exam.createdAt).toLocaleDateString()}</p>
                        {exam.tecnico && <p><strong>Técnico:</strong> {exam.tecnico.nome}</p>}
                        
                        {exam.status === 'Concluído' && (
                          <div className="exam-results">
                            <h4>Resultados:</h4>
                            {exam.tipo === 'Hemograma' && (
                              <>
                                {exam.hemoglobina && <p>Hemoglobina: {exam.hemoglobina} g/dL</p>}
                                {exam.leucocitos && <p>Leucócitos: {exam.leucocitos} células/µL</p>}
                                {exam.plaquetas && <p>Plaquetas: {exam.plaquetas} células/µL</p>}
                                {exam.glicose && <p>Glicose: {exam.glicose} mg/dL</p>}
                                {exam.ureia && <p>Ureia: {exam.ureia} mg/dL</p>}
                                {exam.creatinina && <p>Creatinina: {exam.creatinina} mg/dL</p>}
                                {exam.cor && <p>Cor da Urina: {exam.cor}</p>}
                                {exam.pH && <p>pH: {exam.pH}</p>}
                                {exam.proteinas && <p>Proteínas: {exam.proteinas} mg/dL</p>}
                              </>
                            )}
                            {exam.tipo === 'Bioquímica' && (
                              <>
                                {exam.glicose && <p>Glicose: {exam.glicose} mg/dL</p>}
                                {exam.ureia && <p>Ureia: {exam.ureia} mg/dL</p>}
                                {exam.creatinina && <p>Creatinina: {exam.creatinina} mg/dL</p>}
                                {exam.colesterolTotal && <p>Colesterol Total: {exam.colesterolTotal} mg/dL</p>}
                                {exam.triglicerideos && <p>Triglicerídeos: {exam.triglicerideos} mg/dL</p>}
                                {exam.alt && <p>ALT: {exam.alt} U/L</p>}
                                {exam.ast && <p>AST: {exam.ast} U/L</p>}
                                {exam.fosfataseAlcalina && <p>Fosfatase Alcalina: {exam.fosfataseAlcalina} U/L</p>}
                                {exam.bilirrubinaTotal && <p>Bilirrubina Total: {exam.bilirrubinaTotal} mg/dL</p>}
                              </>
                            )}
                            {exam.tipo === 'Urina' && (
                              <>
                                {exam.cor && <p>Cor: {exam.cor}</p>}
                                {exam.pH && <p>pH: {exam.pH}</p>}
                                {exam.proteinas && <p>Proteínas: {exam.proteinas} mg/dL</p>}
                              </>
                            )}
                            {exam.observacoes && (
                              <p><strong>Observações:</strong> {exam.observacoes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PokemonClinic;
