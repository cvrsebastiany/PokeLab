import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import PokemonSidebar from '../components/PokemonSidebar'
import TestTable from '../components/TestTable'
import { pokemonData, bloodTestResults, urineAnalysis } from '../data/mockData'
import './PokemonClinic.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3004/pokelab-api';
const API_AUTH_ME_URL = `${API_BASE}/auth/me`;

function PokemonClinic() {
  const [activeTab, setActiveTab] = useState('clinical')
  const [currentUser, setCurrentUser] = useState(null)

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

  const tabs = [
    { id: 'clinical', label: 'Clinical Analysis' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'treatment', label: 'Treatment' }
  ]

  return (
    <div className="app">
      <Header user={currentUser} />
      
      <div className="container">
        <PokemonSidebar pokemon={pokemonData} />

        <main className="main-content">
          <div className="clinic-actions">
            <Link to="/treinador" className="trainer-link-btn">
              Ir para Treinador
            </Link>
          </div>

          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'clinical' && (
            <div className="clinical-analysis">
              <TestTable title="Blood Test Results" data={bloodTestResults} />
              <TestTable title="Urine Analysis" data={urineAnalysis} />
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="tab-content">
              <h3>Symptoms</h3>
              <p>No symptoms recorded yet.</p>
            </div>
          )}

          {activeTab === 'diagnosis' && (
            <div className="tab-content">
              <h3>Diagnosis</h3>
              <p>No diagnosis recorded yet.</p>
            </div>
          )}

          {activeTab === 'treatment' && (
            <div className="tab-content">
              <h3>Treatment</h3>
              <p>No treatment plan recorded yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PokemonClinic
