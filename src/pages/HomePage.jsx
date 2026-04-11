import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

const FloatingStar = ({ style }) => (
  <div style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: "'FILL' 1", color: 'var(--tertiary)', opacity: 0.4 }}
    >
      star
    </span>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="layout-wrapper">
      <Sidebar activePage="home" />

      <div className="main-content stage-bg" style={{ position: 'relative', minHeight: '100vh' }}>
        <Navbar />

        {/* Background Glows */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-5%',
              width: '500px',
              height: '500px',
              background: 'rgba(144,171,255,0.15)',
              borderRadius: '50%',
              filter: 'blur(120px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-5%',
              width: '500px',
              height: '500px',
              background: 'rgba(255,143,6,0.12)',
              borderRadius: '50%',
              filter: 'blur(120px)',
            }}
          />
          {/* Studio light overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              background: 'radial-gradient(circle at 50% 0%, white 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Floating decorations */}
        <FloatingStar style={{ top: '30%', left: '30%', animation: 'float 4s ease-in-out infinite', fontSize: '1.5rem' }} />
        <FloatingStar style={{ bottom: '35%', right: '25%', animation: 'float 3s ease-in-out infinite 1s', fontSize: '2rem' }} />
        <div style={{ position: 'absolute', top: '50%', right: '8%', pointerEvents: 'none', animation: 'float 5s ease-in-out infinite 0.5s' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)', opacity: 0.3, fontVariationSettings: "'FILL' 1" }}>celebration</span>
        </div>

        {/* Confetti pieces */}
        {[
          { top: '8%', right: '18%', bg: 'var(--primary)', rot: '45deg', w: '12px', h: '24px' },
          { top: '35%', left: '8%', bg: 'var(--secondary)', rot: '-12deg', w: '16px', h: '8px' },
          { bottom: '18%', left: '28%', bg: 'var(--tertiary)', rot: '60deg', w: '12px', h: '20px' },
          { top: '55%', right: '38%', bg: 'var(--error)', rot: '45deg', w: '16px', h: '16px', borderRadius: '50%' },
          { bottom: '35%', right: '8%', bg: 'var(--primary)', rot: '12deg', w: '24px', h: '12px' },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              background: c.bg,
              width: c.w,
              height: c.h,
              borderRadius: c.borderRadius || '4px',
              transform: `rotate(${c.rot})`,
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          />
        ))}

        {/* Main Content */}
        <main
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '120px 40px 40px',
          }}
        >
          {/* Hero Section */}
          <section style={{ textAlign: 'center', maxWidth: '900px', width: '100%' }}>
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 24px',
                  borderRadius: '999px',
                  background: 'var(--surface-container-highest)',
                  border: '1px solid var(--outline-variant)',
                  color: 'var(--tertiary)',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Juego de equipos
              </span>
            </div>

            <h1
              className="font-headline glow-text"
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                marginBottom: '48px',
              }}
            >
              100 MEXICANOS <br />
              <span style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>DIJERON</span>
            </h1>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <button
                className="btn-primary animate-bounce-in"
                onClick={() => navigate('/teams')}
                style={{ fontSize: '1.5rem', padding: '24px 64px' }}
              >
                EMPEZAR JUEGO
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                <div className="btn-primary-shadow" />
              </button>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn-ghost">Cargar Partida</button>
                <button className="btn-ghost">Clasificación</button>
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <section className="home-bento-grid">
            {/* Large card - Teams */}
            <div
              className="glass-card"
              style={{
                gridColumn: 'span 2',
                padding: '32px',
                borderBottom: '4px solid rgba(144,171,255,0.3)',
              }}
            >
              <h3
                className="font-headline"
                style={{ fontSize: '1.25rem', fontWeight: 900, color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase' }}
              >
                Equipos del Día
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex' }}>
                  {['A', 'B', 'C'].map((letter, i) => (
                    <div
                      key={i}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        border: '4px solid var(--surface)',
                        background: `hsl(${220 + i * 40}, 70%, 60%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        color: 'white',
                        fontSize: '1.1rem',
                        marginLeft: i > 0 ? '-16px' : 0,
                        fontFamily: 'Plus Jakarta Sans',
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      border: '4px solid var(--surface)',
                      background: 'var(--surface-bright)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      color: 'var(--on-surface)',
                      marginLeft: '-16px',
                    }}
                  >
                    +8
                  </div>
                </div>
                <div>
                  <p style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>10 Jugadores conectados</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(183,156,245,0.5)' }}>Listos para el primer round</p>
                </div>
              </div>
            </div>

            {/* Small card - Timer mode */}
            <div
              className="glass-card"
              style={{
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(255,143,6,0.15), rgba(40,0,101,0.4))',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '12px', display: 'block' }}>timer</span>
                <h4 className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>RÁPIDO Y FURIOSO</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '8px' }}>El modo clásico con límite de tiempo.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '16px', cursor: 'pointer' }}>
                Ver reglas
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
