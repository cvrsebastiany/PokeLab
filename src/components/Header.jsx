import { logout } from '../utils/api';
import './Header.css'

function Header() {
  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await logout();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">⚡</div>
        <h1>PokéLab</h1>
      </div>
      <div className="header-right">
        <button className="btn-primary">Save Record</button>
        <button className="btn-secondary">Print Record</button>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
        <div className="user-avatar">👤</div>
      </div>
    </header>
  )
}

export default Header
