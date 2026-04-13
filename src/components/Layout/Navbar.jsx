import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { useState } from 'react';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { connectedRoom } = useSocketContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    { icon: 'home', label: 'Inicio', path: '/' },
    { icon: 'sports_esports', label: 'Partida', path: '/teams' },
    { icon: 'group', label: 'Multijugador', path: '/rooms' },
    { icon: 'person', label: 'Yo vs 100', path: '/yo-vs-100' },
  ];

  const renderLogo = () => (
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
  );

  const renderUserActions = () => (
     <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
         {user ? (
            <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '24px', transition: 'background 0.2s' }}>
                <span style={{ color: 'white', fontWeight: 600 }}>{user.username}</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: user.avatarColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99,102,241,0.5)', color: 'white', fontWeight: 'bold' }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </Link>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
               <Link to="/register" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, transition: 'color 0.2s' }}>
                     Registrarse
                  </div>
               </Link>
               <Link to="/login" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', padding: '8px 20px', borderRadius: '24px', color: 'white', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                     Inicia Sesión <span className="material-symbols-outlined" style={{fontSize: '1.2rem'}}>login</span>
                  </div>
               </Link>
            </div>
        )}
      </div>
  );

  return (
    <>
    <nav className="topnav">
      {/* Mobile Hamburger Button */}
      <button 
        className="hamburger-btn" 
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>menu</span>
      </button>

      {/* Logo */}
      <div className="desktop-only">
        {renderLogo()}
      </div>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="desktop-nav desktop-only">
        <Link to="/" className="font-headline" style={getLinkStyle('/')}>
          Tablero
        </Link>
        <Link to="/teams" className="font-headline" style={getLinkStyle('/teams')}>
          Equipos
        </Link>
        <Link to="/yo-vs-100" className="font-headline" style={getLinkStyle('/yo-vs-100')}>
          Yo vs 100
        </Link>
        <Link to="/rules" className="font-headline" style={getLinkStyle('/rules')}>
          Reglas
        </Link>
      </div>

      {/* Right Actions */}
      <div className="desktop-only">
        {renderUserActions()}
      </div>
    </nav>

    {/* Mobile Menu Overlay */}
    <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
      <button 
        className="mobile-menu-close"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>close</span>
      </button>

      <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
        {/* User Account */}
        <div style={{ marginBottom: '16px' }}>
          {renderUserActions()}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            {renderLogo()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: '#93c5fd' }}>lightbulb</span>
            <span className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#93c5fd', textTransform: 'uppercase' }}>Control Central</span>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'rgba(147, 197, 253, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Estudio 5</p>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar-nav-item ${pathname === item.path ? 'active' : ''}`}
              style={{ textDecoration: 'none', marginLeft: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" style={pathname === item.path ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Additional Navbar Links (that disappear on mobile) */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/" className="font-headline" style={getLinkStyle('/')} onClick={() => setIsMobileMenuOpen(false)}>Tablero</Link>
          <Link to="/teams" className="font-headline" style={getLinkStyle('/teams')} onClick={() => setIsMobileMenuOpen(false)}>Equipos</Link>
          <Link to="/yo-vs-100" className="font-headline" style={getLinkStyle('/yo-vs-100')} onClick={() => setIsMobileMenuOpen(false)}>Yo vs 100</Link>
          <Link to="/rules" className="font-headline" style={getLinkStyle('/rules')} onClick={() => setIsMobileMenuOpen(false)}>Reglas</Link>
        </div>
      </div>

      {/* CTA Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px' }}>
        {connectedRoom && !pathname.includes('game') && (
           <button
             className="btn-primary"
             style={{ width: '100%', padding: '16px', fontSize: '0.875rem', letterSpacing: '0.05em', background: 'var(--tertiary)', color: 'var(--on-tertiary)' }}
             onClick={() => { setIsMobileMenuOpen(false); navigate('/game'); }}
           >
             VOLVER A PARTIDA
           </button>
        )}
        <button
          className="btn-secondary"
          style={{ width: '100%', padding: '16px', fontSize: '0.875rem', letterSpacing: '0.05em' }}
          onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}
        >
          NUEVA PARTIDA
        </button>
      </div>
    </div>
    </>
  );
};

export default Navbar;
