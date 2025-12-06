import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import PokemonSidebar from '../components/PokemonSidebar'
import TestTable from '../components/TestTable'
import { pokemonData, bloodTestResults, urineAnalysis } from '../data/mockData'
import './PokemonClinic.css'

function PokemonClinic() {
  const [activeTab, setActiveTab] = useState('clinical')

  const tabs = [
    { id: 'clinical', label: 'Clinical Analysis' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'treatment', label: 'Treatment' }
  ]

  return (
    <div className="app">
      <Header />
      
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
