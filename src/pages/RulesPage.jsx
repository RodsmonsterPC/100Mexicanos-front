import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';

const RulesPage = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar activePage="rules" />

      <div
        className="main-content stage-gradient"
        style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        <Navbar />

        {/* Decorative background blurs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(144,171,255,0.08)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '400px', height: '400px', background: 'rgba(255,143,6,0.07)', borderRadius: '50%', filter: 'blur(100px)' }} />
        </div>

        <main
          style={{
            position: 'relative',
            zIndex: 10,
            paddingTop: '130px',
            paddingBottom: '60px',
            paddingLeft: '40px',
            paddingRight: '40px',
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}
        >
          {/* Header */}
          <header style={{ textAlign: 'center' }}>
            <h1
              className="font-headline"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 900,
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1.1,
                marginBottom: '16px',
              }}
            >
              Reglas del Juego
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
              Conoce las reglas detalladas de 100 Mexicanos Dijeron y prepárate para jugar.
            </p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Rule 1 */}
            <section className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>
                  groups
                </span>
                <h2 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  1. Formación de Equipos
                </h2>
              </div>
              <p style={{ color: 'var(--on-background)', fontSize: '1rem', lineHeight: 1.6 }}>
                El juego requiere la formación de dos equipos competitivos. Es recomendable tener alrededor de 5 jugadores por equipo. En el menú de equipos ingresa el nombre de cada familia o equipo participante antes de iniciar.
              </p>
            </section>

            {/* Rule 2 */}
            <section className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>
                  timer
                </span>
                <h2 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  2. La Dinámica de la Ronda
                </h2>
              </div>
              <p style={{ color: 'var(--on-background)', fontSize: '1rem', lineHeight: 1.6 }}>
                En cada ronda se plantea una pregunta realizada a "100 Mexicanos". Las respuestas más populares otorgan más puntos. El equipo activo en turno tendrá un reloj de <strong>40 segundos</strong> para emitir su respuesta. Si fallan o el reloj llega a cero, acumularán 1 error (strike).
              </p>
            </section>

            {/* Rule 3 */}
            <section className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#ff6e84', fontVariationSettings: "'FILL' 1" }}>
                  cancel
                </span>
                <h2 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  3. Sistema de Errores (Strikes) y Robo
                </h2>
              </div>
              <p style={{ color: 'var(--on-background)', fontSize: '1rem', lineHeight: 1.6 }}>
                Un equipo puede cometer hasta un máximo de <strong>3 errores</strong> en una misma ronda. Al cometer el tercer error, automáticamente pasan a una <strong>fase de robo</strong> y ceden el control a la familia contraria.
                <br /><br />
                El segundo equipo tendrá sólo una oportunidad para intentar adivinar cualquier respuesta restante en el tablero. 
                <br />
                - Si <strong>aciertan</strong> al robar, ganarán todos los puntos no revelados de esa ronda.<br />
                - Si <strong>fallan</strong> en el intento de robar, los puntos serán concedidos a la familia original que controlaba la ronda.
              </p>
            </section>

            {/* Rule 4 */}
            <section className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--tertiary)', fontVariationSettings: "'FILL' 1" }}>
                  emoji_events
                </span>
                <h2 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  4. Condición de Victoria
                </h2>
              </div>
              <p style={{ color: 'var(--on-background)', fontSize: '1rem', lineHeight: 1.6 }}>
                Los puntos adquiridos se irán sumando victoria a victoria. La primera familia en alcanzar un puntaje total de <strong>500 puntos</strong> será declarada la ganadora definitiva del juego.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RulesPage;
