import React, { useState, useEffect } from 'react';

const TeamRoulette = ({ teams, onComplete, socket, connectedRoom }) => {
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [finalAngle, setFinalAngle] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handleRouletteSpun = (data) => {
      setSpinning(true);
      setWinnerIndex(data.winnerIndex);
      setFinalAngle(1440 + (data.winnerIndex === 0 ? 90 : 270) + (data.offset || 0));
      setShowWinner(false);

      setTimeout(() => {
        setShowWinner(true);
        setTimeout(() => {
          onComplete(data.winnerIndex);
        }, 2000); 
      }, 3000);
    };

    socket.on('roulette_spun', handleRouletteSpun);
    return () => socket.off('roulette_spun', handleRouletteSpun);
  }, [socket, onComplete]);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);

    // Decidir ganador aleatoriamente:
    const selectedIndex = Math.floor(Math.random() * 2);
    const offset = Math.floor(Math.random() * 60) - 30; // Diferencia ligera para que no caiga perfecto
    
    setWinnerIndex(selectedIndex);
    setFinalAngle(1440 + (selectedIndex === 0 ? 90 : 270) + offset);
    setShowWinner(false);

    if (socket && connectedRoom) {
      socket.emit('spin_roulette', { room: connectedRoom, winnerIndex: selectedIndex, offset });
    }

    // Tarda ~3 seg
    setTimeout(() => {
      setShowWinner(true);
      setTimeout(() => {
        onComplete(selectedIndex);
      }, 2000); // 2 segundos extra para mostrar quién ganó
    }, 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h2 className="font-headline" style={{ 
        color: 'white', 
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
        marginBottom: '40px',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(168,85,247,0.8)' 
      }}>
        ¿Quién responde primero?
      </h2>

      <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Marcador puntero */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          zIndex: 10,
          color: 'var(--tertiary)',
          transform: 'rotate(180deg)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}>change_history</span>
        </div>

        {/* Círculo de ruleta */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '8px solid rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: spinning ? `rotate(${finalAngle}deg)` : 'rotate(0deg)',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}>
           {/* Mitad Team A */}
           <div style={{
             position: 'absolute',
             top: 0, left: 0, right: '50%', bottom: 0,
             background: 'var(--primary)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             <span className="font-headline" style={{ color: 'white', transform: 'rotate(-90deg)', fontSize: '1.5rem', fontWeight: 900 }}>
               {teams[0]?.name || 'Equipo A'}
             </span>
           </div>
           
           {/* Mitad Team B */}
           <div style={{
             position: 'absolute',
             top: 0, left: '50%', right: 0, bottom: 0,
             background: 'var(--secondary)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             <span className="font-headline" style={{ color: 'white', transform: 'rotate(90deg)', fontSize: '1.5rem', fontWeight: 900 }}>
               {teams[1]?.name || 'Equipo B'}
             </span>
           </div>
        </div>
      </div>

      {showWinner && winnerIndex !== null && (
        <div style={{
          marginTop: '40px',
          animation: 'bounceIn 0.5s ease',
          textAlign: 'center'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', textTransform: 'uppercase' }}>Inicia la ronda:</p>
          <h3 className="font-headline" style={{ 
            fontSize: '2.5rem', 
            color: winnerIndex === 0 ? 'var(--primary)' : 'var(--secondary)' 
          }}>
            {teams[winnerIndex]?.name}
          </h3>
        </div>
      )}

      {!showWinner && !spinning && (
        <button
          onClick={startSpin}
          disabled={spinning}
          className="btn-primary"
          style={{
            marginTop: '40px',
            padding: '16px 40px',
            fontSize: '1.25rem',
            background: 'linear-gradient(90deg, #a855f7, #6366f1)',
            opacity: spinning ? 0.5 : 1
          }}
        >
          {spinning ? 'Girando...' : 'Girar Ruleta'}
        </button>
      )}
    </div>
  );
};

export default TeamRoulette;
