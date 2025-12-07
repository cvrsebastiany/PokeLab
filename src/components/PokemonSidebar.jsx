import './PokemonSidebar.css'

function PokemonSidebar({ pokemon }) {
  const typeLabel = pokemon.type || "-";
  const badgeLabel = typeLabel;
  const badgeTypeClass = (typeLabel || "default").toString().toLowerCase().replace(/\s+/g, "-");

  return (
    <aside className="sidebar">
      <div className="pokemon-card">
        <div className="pokemon-avatar">
          <img src={pokemon.avatar} alt={pokemon.name} />
        </div>
        <h2 className="pokemon-name">{pokemon.name}</h2>
        <p className="pokemon-id">{pokemon.id}</p>
        <div className="pokemon-type">
          <span className={`type-badge ${badgeTypeClass}`}>{badgeLabel}</span>
        </div>
        <div className="pokemon-info">
          <div className="info-row">
            <span className="info-label">Type:</span>
            <span className="info-value">{pokemon.type || "-"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Species:</span>
            <span className="info-value">{pokemon.species}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Trainer:</span>
            <span className="info-value">{pokemon.trainer}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default PokemonSidebar
