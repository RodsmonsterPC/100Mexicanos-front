import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { useSocketContext } from '../contexts/SocketContext';

const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MESA-';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const RoomsPage = () => {
  const navigate = useNavigate();
  const { socket, connectedRoom, setConnectedRoom } = useSocketContext();
  
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinOrCreate = (code = null) => {
    const finalCode = (code || roomCode).trim().toUpperCase();
    if (!finalCode) {
      setError('Por favor, ingresa un código para la sala.');
      return;
    }
    
    if (socket) {
      socket.emit('join_room', finalCode);
      setConnectedRoom(finalCode);
      setError('');
    } else {
      setError('Error de conexión. Intentando reconectar...');
    }
  };

  const handleCreateNewRoom = () => {
    const newCode = generateRoomCode();
    handleJoinOrCreate(newCode);
  };

  const handleLeaveRoom = () => {
    setConnectedRoom(null);
    setRoomCode('');
    // TODO: emit leave_room when needed
  };

  return (
    <div className="layout-wrapper">
      <Sidebar activePage="rooms" />

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
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(168,85,247,0.15)', borderRadius: '50%', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(150px)' }} />
          <div style={{ position: 'absolute', top: '20%', right: '4%', opacity: 0.15, transform: 'rotate(12deg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '8rem', color: '#a855f7' }}>router</span>
          </div>
        </div>

        {/* Main Content */}
        <main
          style={{
            position: 'relative',
            zIndex: 10,
            paddingTop: '120px',
            paddingBottom: '80px',
            paddingLeft: '48px',
            paddingRight: '48px',
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <header style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1
              className="font-headline glow-text"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
              }}
            >
              Mesas Multijugador
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontWeight: 500, marginTop: '8px', fontSize: '1.1rem' }}>
              Interactúa y compite en tiempo real
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: 'rgba(167,1,56,0.3)',
                border: '1px solid var(--error)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: 'var(--error)',
                textAlign: 'center',
                fontWeight: 700,
                marginBottom: '24px',
                width: '100%',
                maxWidth: '500px',
              }}
            >
              {error}
            </div>
          )}

          {!connectedRoom ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '500px' }}>
               <section
                 className="glass-card"
                 style={{
                   padding: '40px',
                   boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                   borderBottom: `4px solid rgba(168,85,247,0.5)`,
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '24px',
                 }}
               >
                 <div style={{ textAlign: 'center' }}>
                   <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#a855f7', marginBottom: '16px' }}>passkey</span>
                   <h2 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Unirse a Sala</h2>
                 </div>
     
                 <input
                   type="text"
                   value={roomCode}
                   onChange={(e) => setRoomCode(e.target.value)}
                   placeholder="Ej: MESA-SECRETA"
                   style={{
                     width: '100%',
                     background: 'var(--surface-container-highest)',
                     border: 'none',
                     borderRadius: '12px',
                     padding: '16px 24px',
                     fontSize: '1.25rem',
                     fontWeight: 700,
                     color: 'white',
                     outline: 'none',
                     fontFamily: 'Be Vietnam Pro',
                     textAlign: 'center',
                     textTransform: 'uppercase',
                     transition: 'box-shadow 0.2s',
                     letterSpacing: '0.1em'
                   }}
                   onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px rgba(168,85,247,0.5)`}
                   onBlur={(e) => e.target.style.boxShadow = 'none'}
                 />
     
                 <button
                   onClick={() => handleJoinOrCreate()}
                   className="btn-primary"
                   style={{
                     width: '100%',
                     padding: '16px',
                     fontSize: '1.1rem',
                     fontWeight: 800,
                     letterSpacing: '0.05em',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '8px',
                     background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                     border: 'none'
                   }}
                 >
                   ENTRAR
                   <span className="material-symbols-outlined">login</span>
                 </button>
               </section>

               {/* O Crear Mesa */}
               <div style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                  <span style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', padding: '0 16px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.875rem' }}>O TAMBIÉN</span>
               </div>

               <button
                  onClick={handleCreateNewRoom}
                  style={{
                    width: '100%',
                    padding: '24px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--surface-container-highest)',
                    color: 'white',
                    border: '2px dashed rgba(99,102,241,0.4)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'var(--surface-container-highest)'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#6366f1' }}>add_circle</span>
                  CREAR NUEVA SALA
                </button>
             </div>
          ) : (
             <section
             className="glass-card"
             style={{
               width: '100%',
               maxWidth: '600px',
               padding: '40px',
               boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
               borderBottom: `4px solid rgba(99,102,241,0.5)`,
               display: 'flex',
               flexDirection: 'column',
               gap: '32px',
               alignItems: 'center'
             }}
           >
             <div style={{ textAlign: 'center' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#6366f1', marginBottom: '16px' }}>dns</span>
               <h2 className="font-headline" style={{ fontSize: '2rem', fontWeight: 900, color: '#6366f1' }}>Conectado</h2>
               <p style={{ fontSize: '1rem', color: 'white', marginTop: '8px', fontWeight: 700 }}>
                  Estás en la sala: <span style={{ color: '#a855f7', textTransform: 'uppercase' }}>{connectedRoom}</span>
               </p>
               <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>Conexión estable</span>
               </div>
             </div>

             <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                <button
                  onClick={() => navigate('/teams')}
                  className="btn-primary"
                  style={{ flex: 1, padding: '16px', fontSize: '1rem', background: 'linear-gradient(90deg, #6366f1, #3b82f6)' }}
                >
                  Configurar Equipos
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '16px', fontSize: '1rem' }}
                >
                  Desconectar
                </button>
             </div>
           </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default RoomsPage;
