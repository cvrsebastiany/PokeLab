import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">⚡</div>
        <h1>PokéLab</h1>
      </div>
      <div className="header-right">
        <button className="btn-primary">Save Record</button>
        <button className="btn-secondary">Print Record</button>
        <div className="user-avatar">👤</div>
      </div>
    </header>
  )
}

export default Header
