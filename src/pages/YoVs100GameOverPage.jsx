import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const YoVs100GameOverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const score = location.state?.score || 0;
  const rounds = location.state?.rounds || 0;
  const playerName = location.state?.playerName || 'Jugador';

  return (
    <div className="layout-wrapper">
      <Navbar />
      
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '60%', height: '60%', transform: 'translate(-50%, -50%)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', filter: 'blur(150px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <section
          className="glass-card"
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
            borderBottom: '4px solid #ef4444',
            animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: '#ef4444', marginBottom: '24px' }}>
            sentiment_dissatisfied
          </span>
          
          <h1 className="font-headline" style={{ color: 'white', fontSize: '3.5rem', margin: '0 0 8px 0', textTransform: 'uppercase', textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
            Fin del Juego
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', marginBottom: '40px' }}>
            Buen esfuerzo, <strong style={{color: 'white'}}>{playerName}</strong>. Así quedaron tus estadísticas:
          </p>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '40px' }}>
             <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '20px', flex: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0' }}>Rondas Superadas</h3>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>{rounds}</div>
             </div>
             
             <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '20px', flex: 1, border: '1px solid rgba(144,171,255,0.2)' }}>
                <h3 style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0' }}>Puntuación Final</h3>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{score}</div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/yo-vs-100', { state: { playerName } })}
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', letterSpacing: '0.05em' }}
            >
              INTENTAR DE NUEVO
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', letterSpacing: '0.05em' }}
            >
              VOLVER AL TABLERO PRINCIPAL
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default YoVs100GameOverPage;
