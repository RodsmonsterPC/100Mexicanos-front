import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import { useSocketContext } from '../contexts/SocketContext';
import { useAuthContext } from '../contexts/AuthContext';
import { getCategories } from '../services/api';

const avatarColors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];

const getRandomColor = () => {
   const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
   return colors[Math.floor(Math.random() * colors.length)];
};

const PlayerInput = ({ index, value, onChange, teamColor, isFirst, isLocked, onClaim, canClaim, isMySlot, onRelease }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: isLocked ? 'rgba(0,0,0,0.6)' : 'rgba(26,0,70,0.5)',
      padding: '10px',
      borderRadius: '16px',
      border: `1px solid ${isLocked ? teamColor : 'rgba(81,56,137,0.2)'}`,
      transition: 'border-color 0.2s, background 0.2s',
      opacity: isLocked ? 0.8 : 1,
    }}
    onFocus={(e) => { if(!isLocked) e.currentTarget.style.borderColor = teamColor }}
    onBlur={(e) => { if(!isLocked) e.currentTarget.style.borderColor = 'rgba(81,56,137,0.2)' }}
  >
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: isLocked ? teamColor : avatarColors[index],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: 900,
        color: 'white',
        fontSize: '1rem',
        boxShadow: isLocked ? `0 0 10px ${teamColor}` : 'none'
      }}
    >
      {index + 1}
    </div>
    
    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => { if(!isLocked) onChange(index, e.target.value) }}
        placeholder={isFirst ? 'Capitán / Jugador 1' : `Jugador ${index + 1}`}
        disabled={isLocked}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: isLocked ? 'var(--secondary)' : 'var(--on-surface)',
          fontWeight: 700,
          fontSize: '1rem',
          width: '100%',
          fontFamily: 'Be Vietnam Pro',
          cursor: isLocked ? 'not-allowed' : 'text'
        }}
      />
    </div>

    {canClaim && !isLocked && !value && (
      <button
        onClick={() => onClaim(index)}
        style={{
          background: teamColor,
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '0.8rem',
          boxShadow: `0 4px 10px ${teamColor}80`
        }}
      >
        Ocupar
      </button>
    )}

    {isMySlot && (
      <button
        onClick={() => onRelease(index)}
        style={{
          background: 'transparent',
          color: teamColor,
          border: `1px solid ${teamColor}`,
          padding: '6px 12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '0.8rem',
        }}
      >
        Soltar
      </button>
    )}

    {isLocked && !isMySlot && (
      <span className="material-symbols-outlined" style={{ color: teamColor, fontSize: '1.2rem' }}>lock</span>
    )}

    {isFirst && !isLocked && (
      <span
        className="material-symbols-outlined"
        style={{ color: 'var(--tertiary)', fontVariationSettings: "'FILL' 1", flexShrink: 0, paddingRight: '8px' }}
      >
        star
      </span>
    )}
  </div>
);

const TeamCard = ({ equipo, color, borderColor, teamData, onNameChange, onPlayerChange, onClaimSlot, onReleaseSlot, canClaim, currentUser }) => (
  <section
    className="glass-card"
    style={{
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      borderBottom: `4px solid ${borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      zIndex: 10
    }}
  >
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2
        className="font-headline"
        style={{ fontSize: '1.75rem', fontWeight: 800, color, display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>groups</span>
        {equipo}
      </h2>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
      </div>
    </div>

    {/* Team Name Input */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--on-surface-variant)',
        }}
      >
        Nombre del Equipo
      </label>
      <input
        type="text"
        value={teamData.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={equipo === 'Equipo A' ? 'Ej: Los Guerreros' : 'Ej: Las Estrellas'}
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
          transition: 'box-shadow 0.2s',
        }}
        onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${color}50`}
        onBlur={(e) => e.target.style.boxShadow = 'none'}
      />
    </div>

    {/* Player Inputs */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--on-surface-variant)',
        }}
      >
        Integrantes (5)
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {teamData.players.map((player, index) => {
           // Si empieza con LCK: significa que está bloqueado
           const isLocked = player.startsWith('LCK:');
           const displayValue = isLocked ? player.replace('LCK:', '') : player;

           const isMySlot = !!currentUser && player === `LCK:${currentUser.username}`;

           return (
              <PlayerInput
                key={index}
                index={index}
                value={displayValue}
                onChange={onPlayerChange}
                teamColor={color}
                isFirst={index === 0}
                isLocked={isLocked}
                canClaim={canClaim}
                isMySlot={isMySlot}
                onClaim={(idx) => onClaimSlot(equipo.includes('A') ? 'A' : 'B', idx)}
                onRelease={(idx) => onReleaseSlot(equipo.includes('A') ? 'A' : 'B', idx)}
              />
           );
        })}
      </div>
    </div>
  </section>
);

const RemoteCursor = ({ x, y, color, username }) => (
  <div
    style={{
      position: 'fixed',
      top: y,
      left: x,
      zIndex: 9999,
      pointerEvents: 'none',
      transform: 'translate(-4px, -4px)',
      transition: 'top 0.05s linear, left 0.05s linear',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {/* SVG Pointer */}
    <svg width="24" height="36" viewBox="0 0 24 36" fill="none" style={{ filter: `drop-shadow(0px 2px 4px rgba(0,0,0,0.5))` }}>
      <path
        d="M2.5 2.5L9.5 32.5L14 20L23.5 14L2.5 2.5Z"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
    {username && (
       <div style={{
           background: color,
           color: 'white',
           padding: '4px 8px',
           borderRadius: '8px',
           fontSize: '0.75rem',
           fontWeight: 'bold',
           marginTop: '4px',
           alignSelf: 'flex-start',
           boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
           whiteSpace: 'nowrap'
       }}>
          {username}
       </div>
    )}
  </div>
);

const TeamSetupPage = () => {
  const navigate = useNavigate();
  const { socket, connectedRoom } = useSocketContext();
  const { user } = useAuthContext();

  const [teamA, setTeamA] = useState({ name: '', players: ['', '', '', '', ''] });
  const [teamB, setTeamB] = useState({ name: '', players: ['', '', '', '', ''] });
  const [error, setError] = useState('');
  
  // Categorías
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Sockets - Cursors Tracking
  const [remoteCursors, setRemoteCursors] = useState({});
  const myColorRef = useRef(user?.avatarColor || getRandomColor());
  const lastEmitTime = useRef(0);

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const res = await getCategories();
        if(res.success) {
          setAvailableCategories(res.data);
          // By default, select everything
          setSelectedCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };
    loadCategories();

    if (!socket) return;
    
    const handleMouseMove = (data) => {
      // Ignore if it's our own socket
      if (data.id === socket.id) return;
      setRemoteCursors((prev) => ({
        ...prev,
        [data.id]: { x: data.x, y: data.y, color: data.color, username: data.username, lastSeen: Date.now() }
      }));
    };

    const handleSlotClaimed = (data) => {
      const { team, index, username } = data;
      if (team === 'A') {
         setTeamA(prev => {
            const players = [...prev.players];
            players[index] = `LCK:${username}`;
            return { ...prev, players };
         });
      } else {
         setTeamB(prev => {
            const players = [...prev.players];
            players[index] = `LCK:${username}`;
            return { ...prev, players };
         });
      }
    };

    socket.on('mouse_moved', handleMouseMove);
    socket.on('slot_claimed', handleSlotClaimed);

    const handleSlotUnclaimed = (data) => {
      const { team, index, username } = data;
      if (team === 'A') {
         setTeamA(prev => {
            const players = [...prev.players];
            if (players[index] === `LCK:${username}`) players[index] = '';
            return { ...prev, players };
         });
      } else {
         setTeamB(prev => {
            const players = [...prev.players];
            if (players[index] === `LCK:${username}`) players[index] = '';
            return { ...prev, players };
         });
      }
    };

    socket.on('slot_unclaimed', handleSlotUnclaimed);
    
    // Auto remove cursors that have been idle for 5 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (now - next[id].lastSeen > 5000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      socket.off('mouse_moved', handleMouseMove);
      socket.off('slot_claimed', handleSlotClaimed);
      socket.off('slot_unclaimed', handleSlotUnclaimed);
      clearInterval(interval);
    };
  }, [socket]);

  const handleContainerMouseMove = (e) => {
    if (!socket || !connectedRoom) return;
    const now = Date.now();
    // Throttle emits to avoid spamming the network (~20 fps max)
    if (now - lastEmitTime.current > 50) {
      socket.emit('mouse_move', {
        room: connectedRoom,
        id: socket.id,
        x: e.clientX,
        y: e.clientY,
        color: myColorRef.current,
        username: user ? user.username : null
      });
      lastEmitTime.current = now;
    }
  };
  const handlePlayerChange = (team, index, value) => {
    if (team === 'A') {
      setTeamA((prev) => {
        const players = [...prev.players];
        players[index] = value;
        return { ...prev, players };
      });
    } else {
      setTeamB((prev) => {
        const players = [...prev.players];
        players[index] = value;
        return { ...prev, players };
      });
    }
  };

  const handleClaimSlot = (team, index) => {
    if (!user) return;

    // Remove user if they already claimed a slot somewhere else
    let oldClaim = null;
    const claimedIndexA = teamA.players.findIndex(p => p === `LCK:${user.username}`);
    if (claimedIndexA !== -1) oldClaim = { team: 'A', index: claimedIndexA };
    const claimedIndexB = teamB.players.findIndex(p => p === `LCK:${user.username}`);
    if (claimedIndexB !== -1) oldClaim = { team: 'B', index: claimedIndexB };

    if (oldClaim) {
      if (oldClaim.team === 'A') {
        setTeamA(prev => {
          const players = [...prev.players];
          players[oldClaim.index] = '';
          return { ...prev, players };
        });
      } else {
        setTeamB(prev => {
          const players = [...prev.players];
          players[oldClaim.index] = '';
          return { ...prev, players };
        });
      }
      
      if (socket && connectedRoom) {
        socket.emit('unclaim_slot', {
          room: connectedRoom,
          team: oldClaim.team,
          index: oldClaim.index,
          username: user.username
        });
      }
    }

    // Set local state
    if (team === 'A') {
      setTeamA(prev => {
         const players = [...prev.players];
         players[index] = `LCK:${user.username}`;
         return { ...prev, players };
      });
    } else {
      setTeamB(prev => {
         const players = [...prev.players];
         players[index] = `LCK:${user.username}`;
         return { ...prev, players };
      });
    }

    // Emit event
    if (socket && connectedRoom) {
      socket.emit('claim_slot', {
        room: connectedRoom,
        team,
        index,
        username: user.username
      });
    }
  };

  const handleReleaseSlot = (team, index) => {
    if (!user) return;

    if (team === 'A') {
      setTeamA(prev => {
        const players = [...prev.players];
        players[index] = '';
        return { ...prev, players };
      });
    } else {
      setTeamB(prev => {
        const players = [...prev.players];
        players[index] = '';
        return { ...prev, players };
      });
    }

    if (socket && connectedRoom) {
      socket.emit('unclaim_slot', {
        room: connectedRoom,
        team,
        index,
        username: user.username
      });
    }
  };

  const canClaim = !!user;

  const handleStart = () => {
    // Validation
    if (!teamA.name.trim() || !teamB.name.trim()) {
      setError('Por favor, ingresa el nombre de ambos equipos.');
      return;
    }
    const allPlayersA = teamA.players.every((p) => p.trim());
    const allPlayersB = teamB.players.every((p) => p.trim());
    if (!allPlayersA || !allPlayersB) {
      setError('Por favor, ingresa el nombre de todos los jugadores (5 por equipo).');
      return;
    }
    
    // Check if there are locks, we can remove 'LCK:' before starting the game
    // Check categories
    if (selectedCategories.length === 0) {
      setError('Por favor, selecciona al menos una categoría de preguntas.');
      return;
    }

    const cleanTeamAPlayers = teamA.players.map(p => p.startsWith('LCK:') ? p.replace('LCK:', '') : p);
    const cleanTeamBPlayers = teamB.players.map(p => p.startsWith('LCK:') ? p.replace('LCK:', '') : p);

    setError('');
    navigate('/game', { 
      state: { 
        teamA: { ...teamA, players: cleanTeamAPlayers }, 
        teamB: { ...teamB, players: cleanTeamBPlayers },
        categories: selectedCategories
      } 
    });
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  return (
    <div className="layout-wrapper" onMouseMove={handleContainerMouseMove}>
      <Sidebar activePage="teams" />

      {/* RENDER REMOTE CURSORS */}
      {Object.entries(remoteCursors).map(([id, cur]) => (
        <RemoteCursor key={id} x={cur.x} y={cur.y} color={cur.color} />
      ))}

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
          {/* Decorative icons */}
          <div style={{ position: 'absolute', top: '20%', right: '4%', opacity: 0.15, transform: 'rotate(12deg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '8rem', color: 'var(--tertiary)' }}>star</span>
          </div>
          <div style={{ position: 'absolute', bottom: '20%', left: '4%', opacity: 0.12, transform: 'rotate(-12deg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '6rem', color: 'var(--primary)' }}>celebration</span>
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
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: '48px' }}>
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
              Crear Equipos
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontWeight: 500, marginTop: '8px', fontSize: '1.1rem' }}>
              Define a los contendientes de esta noche
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
              }}
            >
              {error}
            </div>
          )}

          {/* Teams Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '40px',
              width: '100%',
              position: 'relative',
            }}
          >
            <TeamCard
              equipo="Equipo A"
              color="var(--primary)"
              borderColor="rgba(144,171,255,0.3)"
              teamData={teamA}
              onNameChange={(name) => setTeamA((prev) => ({ ...prev, name }))}
              onPlayerChange={(index, value) => handlePlayerChange('A', index, value)}
              onClaimSlot={handleClaimSlot}
              onReleaseSlot={handleReleaseSlot}
              canClaim={canClaim}
              currentUser={user}
            />

            {/* VS Badge */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="hidden-mobile"
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(255,224,131,0.5)',
                  border: '4px solid var(--surface)',
                  transform: 'rotate(12deg)',
                }}
              >
                <span
                  className="font-headline"
                  style={{ fontSize: '1.5rem', fontWeight: 900, fontStyle: 'italic', color: 'var(--on-tertiary-fixed)' }}
                >
                  VS
                </span>
              </div>
            </div>

            <TeamCard
              equipo="Equipo B"
              color="var(--secondary)"
              borderColor="rgba(255,143,6,0.3)"
              teamData={teamB}
              onNameChange={(name) => setTeamB((prev) => ({ ...prev, name }))}
              onPlayerChange={(index, value) => handlePlayerChange('B', index, value)}
              onClaimSlot={handleClaimSlot}
              onReleaseSlot={handleReleaseSlot}
              canClaim={canClaim}
              currentUser={user}
            />
          </div>

          {/* Category Selection */}
          <section style={{ marginTop: '56px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="font-headline" style={{ color: 'white', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 800 }}>Mazo de Preguntas</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px', fontSize: '0.9rem' }}>Selecciona qué categorías de preguntas deseas jugar en esta partida:</p>
            
            {availableCategories.length === 0 ? (
               <div style={{ color: 'var(--primary)' }}>Cargando categorías...</div>
            ) : (
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '800px' }}>
                 {availableCategories.map(cat => {
                   const isSelected = selectedCategories.includes(cat);
                   return (
                     <button
                       key={cat}
                       onClick={() => toggleCategory(cat)}
                       style={{
                         background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                         color: isSelected ? 'black' : 'white',
                         border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
                         padding: '10px 20px',
                         borderRadius: '30px',
                         fontWeight: 700,
                         cursor: 'pointer',
                         transition: 'all 0.2s',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                         boxShadow: isSelected ? '0 0 15px rgba(144,171,255,0.4)' : 'none'
                       }}
                     >
                       {isSelected ? <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', fontVariationSettings: "'FILL' 1" }}>check_circle</span> : null}
                       {cat}
                     </button>
                   );
                 })}
               </div>
            )}
          </section>

          {/* Footer CTA */}
          <footer style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleStart}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '20px',
              }}
            >
              {/* Glow border */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: '20px',
                  filter: 'blur(8px)',
                  opacity: 0.5,
                  transition: 'opacity 0.3s',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'linear-gradient(90deg, var(--primary), var(--primary-dim))',
                  padding: '24px 64px',
                  borderRadius: '16px',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  color: 'var(--on-primary)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  transition: 'transform 0.2s, filter 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Iniciar Partida
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>play_circle</span>
              </div>
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default TeamSetupPage;
