import { logout } from '../utils/api';
import './Header.css'
import tecnicoAvatar from '../assets/tecnico_foto_perfil-removebg-preview.png';
import professorAvatar from '../assets/professor_icon-removebg-preview.png';

function Header({ user }) {
  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await logout();
    }
  };

  const perfilId = Number(user?.perfilId || user?.perfil?.id);
  const isTecnico = perfilId === 3;
  const isProfessorSaude = perfilId === 2;
  const avatarSrc = isTecnico
    ? tecnicoAvatar
    : isProfessorSaude
      ? professorAvatar
      : user?.avatar || user?.foto || null;

  return (
    <header className="header">
      <div className="header-left">
        <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dffpqjc-645c8699-888a-4f3b-b037-418d4ee0f6be.png/v1/fill/w_1280,h_1280/pokemon_center_logo_by_jormxdos_dffpqjc-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiIvZi9lOGRkYzRkYS0yM2RkLTQ1MDItYjY1Yi0zNzhjOWNmZTVlZmEvZGZmcHFqYy02NDVjODY5OS04ODhhLTRmM2ItYjAzNy00MThkNGVlMGY2YmUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.uBCZnpD-O359RLab8MCpWzJS296c1DXQRabuTLvlOSM" alt="Pokemon Center Logo" className="logo" />
        <h1>PokéLab</h1>
      </div>
      <div className="header-right">
        {user && (
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{user.nome}</span>
              <span className="user-profile">{user.perfil?.nome || 'Usuário'}</span>
            </div>
            <div className="user-avatar">
              {avatarSrc ? <img src={avatarSrc} alt="Avatar" /> : '👤'}
            </div>
          </div>
        )}
        {!user && <div className="user-avatar">👤</div>}
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </div>
    </header>
  )
}

export default Header
