import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { useAuthContext } from '../contexts/AuthContext';

const YoVs100SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [playerName, setPlayerName] = useState(user?.username || '');

  const handleStart = () => {
    if (!playerName.trim()) {
      alert('Por favor, ingresa tu nombre para jugar.');
      return;
    }
    navigate('/yo-vs-100/game', { state: { playerName: playerName.trim() } });
  };

  return (
    <div className="layout-wrapper">
      <Sidebar activePage="game" />
      
      <div
        className="main-content"
        style={{
          minHeight: '100vh',
          background: 'var(--surface)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Navbar />

        {/* Background glows */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(144,171,255,0.15)', borderRadius: '50%', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'rgba(255,143,6,0.08)', borderRadius: '50%', filter: 'blur(150px)' }} />
          
          <div style={{ position: 'absolute', top: '20%', right: '4%', opacity: 0.15, transform: 'rotate(12deg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '8rem', color: 'var(--tertiary)' }}>psychology</span>
          </div>
          <div style={{ position: 'absolute', bottom: '20%', left: '4%', opacity: 0.12, transform: 'rotate(-12deg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '6rem', color: 'var(--primary)' }}>emoji_events</span>
          </div>
        </div>

        {/* Main Content */}
        <main
          style={{
            position: 'relative',
            zIndex: 10,
            paddingTop: '120px',
            paddingBottom: '80px',
            paddingLeft: 'clamp(16px, 5vw, 48px)',
            paddingRight: 'clamp(16px, 5vw, 48px)',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1
              className="font-headline glow-text"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontWeight: 900,
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
              }}
            >
              Yo vs 100
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontWeight: 500, marginTop: '8px', fontSize: '1.1rem' }}>
              Modo Supervivencia para un jugador
            </p>
          </header>

          <section
            className="glass-card"
            style={{
              padding: 'clamp(20px, 4vw, 40px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              borderBottom: '4px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            <div style={{ display: 'grid', gap: '24px' }}>
              <h2 className="font-headline" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                ¿Cómo jugar?
              </h2>
              <ul style={{ color: 'var(--on-surface)', fontSize: '1rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
                <li>Empiezas con <strong>10 vidas</strong> y sumas puntos indefinidamente respondiendo tarjetas sin parar. Máximo 20 vidas.</li>
                <li>Tienes que completar TODAS las respuestas (5 o menos) de una tarjeta para avanzar de ronda. Fallar una respuesta te resta 1 vida.</li>
                <li>Cuentas con <strong>40 segundos</strong> por respuesta. Si se agota el tiempo pierdes una vida y el temporizador se reinicia.</li>
                <li>Al llegar a 0 vidas, la partida termina.</li>
                <li><strong>Giro Sorpresa:</strong> ¡Cada 5 rondas se gira la ruleta y recibirás un evento de ayuda (o de castigo)! Podrías ganar vidas, comodines o multiplicar tus puntos.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--on-surface-variant)',
                  marginLeft: '4px'
                }}
              >
                Tu Nombre
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej. Juan"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'white',
                  outline: 'none',
                  fontFamily: 'Be Vietnam Pro',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.background = 'rgba(144, 171, 255, 0.05)';
                  e.target.style.boxShadow = '0 0 15px rgba(144,171,255,0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(0,0,0,0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleStart}
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '1.25rem',
                letterSpacing: '0.1em',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              EMPEZAR LA SUPERVIVENCIA
              <span className="material-symbols-outlined">rocket_launch</span>
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default YoVs100SetupPage;
