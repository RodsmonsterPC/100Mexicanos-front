import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

const CONFETTI_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--tertiary)',
  'var(--error)',
  '#a855f7',
  '#22d3ee',
];

const ConfettiPiece = ({ style, delay, duration }) => (
  <div
    className="confetti-piece"
    style={{
      ...style,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    }}
  />
);

const WinnerPage = () => {
  const navigate = useNavigate();
  
  const [winnerState, setWinnerState] = useState(() => {
    let data = location.state;
    if (!data) {
      const stored = sessionStorage.getItem('winnerState');
      if (stored) data = JSON.parse(stored);
    }
    return data || {};
  });

  const { teams, scores, winnerIndex } = winnerState;

  useEffect(() => {
    if (winnerState && Object.keys(winnerState).length > 0) {
      sessionStorage.setItem('winnerState', JSON.stringify(winnerState));
    }
  }, [winnerState]);

  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!teams) {
      navigate('/');
      return;
    }

    // Generate confetti
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      width: `${6 + Math.random() * 10}px`,
      height: `${10 + Math.random() * 20}px`,
      transform: `rotate(${Math.random() * 360}deg)`,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
      borderRadius: Math.random() > 0.5 ? '50%' : '3px',
    }));
    setConfetti(pieces);
  }, [teams, navigate]);

  if (!teams) return null;

  const isTie = winnerIndex === -1;
  const winner = isTie ? null : teams[winnerIndex];
  const loserIndex = isTie ? null : (winnerIndex === 0 ? 1 : 0);
  const loser = isTie ? null : teams[loserIndex];
  const winnerScore = isTie ? scores[0] : scores[winnerIndex];
  const loserScore = isTie ? scores[1] : scores[loserIndex];

  return (
    <div className="layout-wrapper">
      <Sidebar activePage="winner" />

      <div
        className="main-content"
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 0%, #370085, #140039)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Navbar />

        {/* Confetti */}
        {confetti.map((piece) => (
          <ConfettiPiece
            key={piece.id}
            style={{
              left: piece.left,
              background: piece.background,
              width: piece.width,
              height: piece.height,
              transform: piece.transform,
              borderRadius: piece.borderRadius,
            }}
            delay={piece.delay}
            duration={piece.duration}
          />
        ))}

        {/* Background glows */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: '400px', height: '400px', background: 'rgba(144,171,255,0.2)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '400px', height: '400px', background: 'rgba(255,143,6,0.15)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'rgba(255,224,131,0.08)', borderRadius: '50%', filter: 'blur(120px)' }} />
        </div>

        {/* Main Content */}
        <main
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            padding: '120px 40px 60px',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          {/* Winner Badge */}
          <div className="winner-badge animate-bounce-in">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.25rem' }}>{isTie ? 'handshake' : 'emoji_events'}</span>
            {isTie ? '¡EMPATE TÉCNICO!' : '¡TENEMOS GANADOR!'}
          </div>

          {/* Trophy */}
          <div style={{ animation: 'float 3s ease-in-out infinite' }}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '8rem',
                color: isTie ? 'var(--secondary)' : 'var(--tertiary)',
                fontVariationSettings: "'FILL' 1",
                filter: `drop-shadow(0 0 30px ${isTie ? 'rgba(255,143,6,0.6)' : 'rgba(255,224,131,0.6)'})`,
              }}
            >
              {isTie ? 'handshake' : 'emoji_events'}
            </span>
          </div>

          {/* Winner Name */}
          <div>
            <h1
              className="font-headline animate-winner-glow"
              style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 900,
                color: isTie ? 'var(--secondary)' : 'var(--tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {isTie ? '¡Empate!' : winner.name}
            </h1>
            <p
              className="font-headline"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--on-surface-variant)',
                marginTop: '8px',
              }}
            >
              {isTie ? '¡Ambos equipos jugaron increíble!' : '¡Campeones de esta noche!'}
            </p>
          </div>

          {/* Score Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            {/* Winner Score or Team A */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,224,131,0.2), rgba(255,143,6,0.15))',
                border: isTie ? '2px solid var(--primary)' : '2px solid var(--tertiary)',
                borderRadius: '24px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isTie ? '0 0 40px rgba(144,171,255,0.2)' : '0 0 40px rgba(255,208,27,0.2)',
                animation: 'bounceIn 0.6s ease both',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: isTie ? 'var(--primary)' : 'var(--tertiary)', fontVariationSettings: "'FILL' 1" }}>
                {isTie ? 'groups' : 'workspace_premium'}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isTie ? 'var(--primary)' : 'var(--tertiary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {isTie ? teams[0].name : winner.name}
              </span>
              <span
                className="font-headline"
                style={{ fontSize: '4rem', fontWeight: 900, color: isTie ? 'var(--primary)' : 'var(--tertiary)', lineHeight: 1, filter: isTie ? 'none' : 'drop-shadow(0 0 15px rgba(255,224,131,0.6))' }}
              >
                {isTie ? scores[0] : winnerScore}
              </span>
              <span style={{ fontSize: '0.75rem', color: isTie ? 'rgba(144,171,255,0.6)' : 'rgba(255,224,131,0.6)', fontWeight: 600 }}>puntos</span>
            </div>

            {/* Loser Score or Team B */}
            <div
              style={{
                background: isTie ? 'linear-gradient(135deg, rgba(255,224,131,0.2), rgba(255,143,6,0.15))' : 'rgba(33,0,86,0.5)',
                border: isTie ? '2px solid var(--secondary)' : '2px solid var(--outline-variant)',
                borderRadius: '24px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                opacity: isTie ? 1 : 0.8,
                boxShadow: isTie ? '0 0 40px rgba(255,143,6,0.2)' : 'none',
                animation: 'bounceIn 0.6s ease 0.2s both',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: isTie ? 'var(--secondary)' : 'var(--on-surface-variant)', fontVariationSettings: "'FILL' 1" }}>
                groups
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isTie ? 'var(--secondary)' : 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {isTie ? teams[1].name : loser.name}
              </span>
              <span
                className="font-headline"
                style={{ fontSize: '4rem', fontWeight: 900, color: isTie ? 'var(--secondary)' : 'var(--on-surface-variant)', lineHeight: 1 }}
              >
                {isTie ? scores[1] : loserScore}
              </span>
              <span style={{ fontSize: '0.75rem', color: isTie ? 'rgba(255,143,6,0.6)' : 'rgba(183,156,245,0.4)', fontWeight: 600 }}>puntos</span>
            </div>
          </div>

          {/* Players */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(isTie ? [...teams[0].players, ...teams[1].players] : winner.players).map((player, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 16px',
                  background: 'rgba(144,171,255,0.15)',
                  border: '1px solid rgba(144,171,255,0.3)',
                  borderRadius: '999px',
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {player}
              </span>
            ))}
          </div>

          {/* Decorative stars */}
          <div style={{ display: 'flex', gap: '24px', color: 'var(--tertiary)', opacity: 0.6 }}>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined"
                style={{
                  fontSize: '1.5rem',
                  fontVariationSettings: "'FILL' 1",
                  animation: `sparkle ${1 + i * 0.3}s ease-in-out infinite`,
                }}
              >
                star
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ fontSize: '1.1rem', padding: '18px 40px' }}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>replay</span>
              Jugar Nuevamente
              <div className="btn-primary-shadow" />
            </button>
            <button
              className="btn-ghost"
              onClick={() => navigate('/teams')}
              style={{ padding: '18px 32px', fontSize: '1rem' }}
            >
              Cambiar Equipos
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WinnerPage;
