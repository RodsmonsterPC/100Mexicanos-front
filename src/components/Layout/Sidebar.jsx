import { Link, useNavigate } from 'react-router-dom';
import { useSocketContext } from '../../contexts/SocketContext';

const navItems = [
  { icon: 'home', label: 'Inicio', path: '/' },
  { icon: 'sports_esports', label: 'Partida', path: '/teams' },
  { icon: 'group', label: 'Multijugador', path: '/rooms' },
];

const Sidebar = ({ activePage = 'home' }) => {
  const navigate = useNavigate();
  const { connectedRoom } = useSocketContext();

  const pageMap = {
    home: 'Inicio',
    teams: 'Partida',
    game: 'Partida',
    rooms: 'Multijugador',
  };

  const activeName = pageMap[activePage] || 'Inicio';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span className="material-symbols-outlined" style={{ color: '#93c5fd' }}>lightbulb</span>
          <span
            className="font-headline"
            style={{ fontSize: '1.1rem', fontWeight: 900, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Control Central
          </span>
        </div>
        <p style={{ fontSize: '0.65rem', color: 'rgba(147, 197, 253, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          Estudio 5
        </p>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`sidebar-nav-item ${item.label === activeName ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <span
              className="material-symbols-outlined"
              style={item.label === activeName ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* CTA Button */}
      <div style={{ padding: '0 16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {connectedRoom && activePage !== 'game' && (
           <button
             className="btn-primary"
             style={{ width: '100%', padding: '16px', fontSize: '0.875rem', letterSpacing: '0.05em', background: 'var(--tertiary)' }}
             onClick={() => navigate('/game')}
           >
             VOLVER A PARTIDA
           </button>
        )}
        <button
          className="btn-secondary"
          style={{ width: '100%', padding: '16px', fontSize: '0.875rem', letterSpacing: '0.05em' }}
          onClick={() => navigate('/')}
        >
          NUEVA PARTIDA
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
