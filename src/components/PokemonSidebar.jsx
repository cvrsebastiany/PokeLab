import './PokemonSidebar.css'

function PokemonSidebar({ pokemon }) {
  return (
    <aside className="sidebar">
      <div className="pokemon-card">
        <div className="pokemon-avatar">
          <img src={pokemon.avatar} alt={pokemon.name} />
        </div>
        <h2 className="pokemon-name">{pokemon.name}</h2>
        <p className="pokemon-id">{pokemon.id}</p>
        <div className="pokemon-type">
          <span className="type-badge electric">⚡ {pokemon.type}</span>
        </div>
        <div className="pokemon-info">
          <div className="info-row">
            <span className="info-label">Species:</span>
            <span className="info-value">{pokemon.species}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Trainer:</span>
            <span className="info-value">{pokemon.trainer}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Level:</span>
            <span className="info-value">{pokemon.level}</span>
          </div>
          <div className="info-row">
            <span className="info-label">HP:</span>
            <span className="info-value">{pokemon.hp}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Nature:</span>
            <span className="info-value">{pokemon.nature}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default PokemonSidebar
