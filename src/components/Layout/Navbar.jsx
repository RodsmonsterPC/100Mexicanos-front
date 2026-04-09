import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuthContext();

  const getLinkStyle = (path) => {
    const isActive = pathname === path;
    return {
      color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.6)',
      fontSize: '0.875rem',
      fontWeight: 700,
      textDecoration: 'none',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      textShadow: isActive ? '0 0 8px rgba(96,165,250,0.6)' : 'none',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <nav className="topnav">
      {/* Logo */}
      <div
        className="font-headline"
        style={{
          fontSize: '1.75rem',
          fontWeight: 900,
          color: 'white',
          textShadow: '0 0 10px rgba(144,171,255,0.8)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        100 MEXICANOS DIJERON
      </div>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="desktop-nav">
        <Link to="/" className="font-headline" style={getLinkStyle('/')}>
          Tablero
        </Link>
        <Link to="/teams" className="font-headline" style={getLinkStyle('/teams')}>
          Equipos
        </Link>
        <Link to="/rules" className="font-headline" style={getLinkStyle('/rules')}>
          Reglas
        </Link>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
         {user ? (
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '24px', transition: 'background 0.2s' }}>
                <span style={{ color: 'white', fontWeight: 600 }}>{user.username}</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: user.avatarColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99,102,241,0.5)', color: 'white', fontWeight: 'bold' }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </Link>
        ) : (
            <>
               <Link to="/register" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, transition: 'color 0.2s' }}>
                     Registrarse
                  </div>
               </Link>
               <Link to="/login" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', padding: '8px 20px', borderRadius: '24px', color: 'white', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                     Inicia Sesión <span className="material-symbols-outlined" style={{fontSize: '1.2rem'}}>login</span>
                  </div>
               </Link>
            </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
