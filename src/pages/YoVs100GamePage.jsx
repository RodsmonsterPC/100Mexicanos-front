import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import AnswerBoard from '../components/Game/AnswerBoard';
import correctSfx from '../assets/sounds/correctSound.mp3';
import incorrectSfx from '../assets/sounds/incorrectSound.mp3';
import { getRandomQuestion, validateAnswerAPI } from '../services/api';

const EVENTS = [
  { id: 'RECUPERA_VIDAS', label: '¡Recupera Vidas!', desc: '2 casillas de la próxima tarjeta te darán +1 vida al acertarlas.', color: '#10b981' },
  { id: 'PUNTOS_x2', label: 'Puntos Dobles', desc: '¡Gana el doble de puntos en esta ronda!', color: '#3b82f6' },
  { id: 'PUNTOS_x3', label: 'Puntos Triples', desc: '¡Gana el triple de puntos en esta ronda!', color: '#8b5cf6' },
  { id: 'COMODIN', label: 'Comodín', desc: 'Ganaste un Comodín para saltar cualquier tarjeta cuando quieras.', color: '#f59e0b' },
  { id: 'PIERDE_1_VIDA', label: '¡Ouch!', desc: 'Pierdes 1 Vida instantáneamente.', color: '#ef4444' }
];

const RouletteOverlay = ({ onEventComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);

  const handleSpin = () => {
    setSpinning(true);
    setHasSpun(true);
    
    // Spin animation for 2.5 seconds
    setTimeout(() => {
      const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setResult(randomEvent);
      setSpinning(false);
      
      // Let it show for 3.5 seconds
      setTimeout(() => {
        onEventComplete(randomEvent.id);
      }, 3500);
      
    }, 2500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
    }}>
      <h2 className="font-headline" style={{ color: 'white', fontSize: '3rem', marginBottom: '40px', textShadow: '0 0 20px rgba(168,85,247,0.8)' }}>
        ¡EVENTO DE LA RONDA!
      </h2>
      
      {!hasSpun && (
        <button 
          className="btn-primary" 
          onClick={handleSpin}
          style={{ fontSize: '2rem', padding: '24px 64px', borderRadius: '40px', animation: 'pulse 2s infinite' }}
        >
          GIRAR RULETA
        </button>
      )}

      {spinning && (
        <div style={{
          width: '200px', height: '200px', borderRadius: '50%',
          border: '10px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      
      {!spinning && result && (
        <div style={{
          background: result.color,
          padding: '40px 60px',
          borderRadius: '30px',
          textAlign: 'center',
          boxShadow: `0 0 50px ${result.color}`,
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <h3 className="font-headline" style={{ color: 'white', fontSize: '2.5rem', margin: 0, textTransform: 'uppercase' }}>
            {result.label}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginTop: '16px', fontWeight: 600 }}>
            {result.desc}
          </p>
        </div>
      )}
    </div>
  );
};

const YoVs100GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerName = location.state?.playerName || 'Jugador';

  const [question, setQuestion] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([false, false, false, false, false]);
  const [seenIds, setSeenIds] = useState([]);
  
  const [lives, setLives] = useState(10);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [wildcards, setWildcards] = useState(3);
  
  const [multiplier, setMultiplier] = useState(1);
  const [recoveryBoxes, setRecoveryBoxes] = useState([]);
  
  const [showRoulette, setShowRoulette] = useState(false);
  const [timer, setTimer] = useState(40);
  const [inputValue, setInputValue] = useState('');
  const [validating, setValidating] = useState(false);
  const [showX, setShowX] = useState(false);
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const sndCorrect = new Audio(correctSfx);
  const sndIncorrect = new Audio(incorrectSfx);

  const fetchQuestion = async (excludeIds, isPendingRecovery = false) => {
    try {
      const data = await getRandomQuestion([], excludeIds);
      if (data.success) {
        setQuestion(data.data);
        setRevealedAnswers(new Array(data.data.answers.length).fill(false));
        if (data.resetExclude) {
          setSeenIds([data.data._id]); 
        } else {
          setSeenIds(prev => [...prev, data.data._id]);
        }
        setTimer(40); // Reset timer automatically on new question
        
        // Handle recovery event using the passed parameter to avoid closure state issues
        if (isPendingRecovery) {
           const indices = [];
           const amt = Math.min(2, data.data.answers.length);
           while(indices.length < amt) {
              let r = Math.floor(Math.random() * data.data.answers.length);
              if(!indices.includes(r)) indices.push(r);
           }
           setRecoveryBoxes(indices);
        } else {
           setRecoveryBoxes([]);
        }

      } else {
        alert('No hay tarjetas disponibles.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Initial load
    fetchQuestion([]);
  }, []);

  useEffect(() => {
    // Timer interval
    if (showRoulette) return; // Pausa el timer si hay ruleta
    if (!question) return;

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 40;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [showRoulette, question]);

  const handleTimeout = () => {
    sndIncorrect.currentTime = 0;
    sndIncorrect.play().catch(()=>{});
    
    // Show visual X for 1.5 seconds
    setShowX(true);
    setTimeout(() => setShowX(false), 1500);
    
    setLives(prev => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        endGame(score, round);
      }
      return Math.max(0, nextLives);
    });
  };

  const endGame = (finalScore, finalRound) => {
    navigate('/yo-vs-100/gameover', { state: { score: finalScore, rounds: finalRound - 1, playerName } });
  };

  const handleValidation = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || validating || showRoulette) return;
    
    setValidating(true);
    const typed = inputValue.trim();
    setInputValue('');
    setTimer(40); // reinicio al enviar un intento
    
    try {
      const data = await validateAnswerAPI(question._id, typed, revealedAnswers);
      
      if (data.success && data.isCorrect && !revealedAnswers[data.matchedIndex]) {
        // Correct guess
        sndCorrect.currentTime = 0;
        sndCorrect.play().catch(()=>{});
        
        setRevealedAnswers(prev => {
          const newRevealed = [...prev];
          newRevealed[data.matchedIndex] = true;
          
          let wonLife = false;
          if (recoveryBoxes.includes(data.matchedIndex)) {
             wonLife = true;
             setLives(l => Math.min(20, l + 1));
          }
          
          // Check if all revealed
          if (newRevealed.every(val => val === true)) {
             handleRoundComplete(data.points * multiplier);
          } else {
             setScore(s => s + (data.points * multiplier));
          }
          return newRevealed;
        });

      } else {
        // Incorrect guess
        handleTimeout(); // Aprovechamos la función de restar vida
      }
    } catch (err) {
      console.error(err);
    }
    setValidating(false);
  };
  
  const handleRoundComplete = (lastPoints) => {
     setScore(s => s + lastPoints);
     
     const nextRound = round + 1;
     setRound(nextRound);
     
     if (nextRound % 5 === 0) {
        setShowRoulette(true);
     } else {
        // Normal transition
        setMultiplier(1);
        setRecoveryBoxes([]);
        fetchQuestion(seenIds);
     }
  };
  
  const handleUseWildcard = () => {
     if (wildcards <= 0) return;
     setWildcards(w => w - 1);
     
     const nextRound = round + 1;
     setRound(nextRound);
     
     if (nextRound % 5 === 0) {
        setShowRoulette(true);
     } else {
        setMultiplier(1);
        setRecoveryBoxes([]);
        fetchQuestion(seenIds);
     }
  };

  const handleRouletteComplete = (eventId) => {
    setShowRoulette(false);
    
    // Apply event
    let isPendingRecovery = false;
    
    if (eventId === 'RECUPERA_VIDAS') {
      isPendingRecovery = true;
    } else if (eventId === 'PUNTOS_x2') {
      setMultiplier(2);
    } else if (eventId === 'PUNTOS_x3') {
      setMultiplier(3);
    } else if (eventId === 'COMODIN') {
      setWildcards(w => w + 1);
    } else if (eventId === 'PIERDE_1_VIDA') {
      setLives(l => {
         const nx = l - 1;
         if (nx <= 0) endGame(score, round);
         return Math.max(0, nx);
      });
    }
    
    // Transition to new round question with the exact recovery state
    fetchQuestion(seenIds, isPendingRecovery);
  };

  if (!question) {
    return (
       <div className="layout-wrapper" style={{ background: 'var(--surface)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <h1 style={{ color: 'white' }}>Cargando...</h1>
       </div>
    );
  }

  return (
    <div className="layout-wrapper">
       {showRoulette && <RouletteOverlay onEventComplete={handleRouletteComplete} />}

       <Navbar />
      
       {/* Background ambient */}
       <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
         <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(144,171,255,0.08)', borderRadius: '50%', filter: 'blur(100px)' }} />
       </div>

       {/* Ouch X Overlay */}
       {showX && (
         <div style={{ 
            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(4px)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
         }}>
           <span className="font-headline" style={{ fontSize: '15rem', color: '#ef4444', fontWeight: 900, textShadow: '0 0 50px rgba(239,68,68,0.8)' }}>
             X
           </span>
         </div>
       )}

       <div style={{ position: 'relative', zIndex: 10, padding: '100px 24px 40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '32px' }}>
         
         {/* LEFT PANEL: Stats */}
         <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
               <h2 className="font-headline" style={{ color: 'var(--primary)', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase' }}>Supervivencia</h2>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginTop: '8px' }}>Ronda {round}</div>
            </div>
            
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
               <h3 style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Puntos</h3>
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--tertiary)' }}>{score}</div>
               {multiplier > 1 && (
                  <div style={{ background: 'var(--tertiary)', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '8px' }}>
                     x{multiplier} ACTIVO
                  </div>
               )}
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
               <h3 style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  Vidas
               </h3>
               <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ef4444', marginTop: '8px' }}>
                  {lives} <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)'}}>/ 20</span>
               </div>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
               <h3 style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>star</span>
                  Comodines
               </h3>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', marginTop: '8px' }}>{wildcards}</div>
               <button 
                 onClick={handleUseWildcard}
                 disabled={wildcards <= 0}
                 className="btn-primary"
                 style={{ width: '100%', marginTop: '16px', padding: '12px', background: wildcards > 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)', cursor: wildcards > 0 ? 'pointer' : 'not-allowed', color: wildcards > 0 ? 'white' : 'rgba(255,255,255,0.3)', border: 'none' }}
               >
                 Usar Comodín
               </button>
             </div>

             {/* Terminar Partida Button */}
             <div style={{ marginTop: 'auto' }}>
               <button 
                 onClick={() => endGame(score, round)}
                 className="btn-secondary"
                 style={{ width: '100%', padding: '16px', border: '1px solid #ef4444', color: '#ef4444' }}
               >
                 Terminar Partida
               </button>
             </div>
         </div>
         
         {/* RIGHT PANEL: Game Board */}
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '800px' }}>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <h2 className="font-headline" style={{ color: 'white', fontSize: '2.5rem', margin: 0, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                  {question.question}
               </h2>
               <div style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {playerName}
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
               <div style={{ flex: 1 }}>
                  {/* MODIFICACIÓN DE ANSWERBOARD PARA MOSTRAR CASILLAS DE VIDA */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {question.answers.map((answer, index) => {
                       const isRevealed = revealedAnswers[index];
                       const isLifeBox = recoveryBoxes.includes(index);
                       
                       if (isRevealed) {
                         return (
                           <div key={index} className="answer-tile answer-tile-revealed" style={isLifeBox ? { boxShadow: '0 0 30px #10b981', border: '3px solid #10b981' } : {}}>
                             <span className="answer-text">
                               {index + 1}. {answer.text}
                             </span>
                             <span className="answer-points">
                               {answer.points} 
                               {isLifeBox && <span className="material-symbols-outlined" style={{color: '#10b981', fontVariationSettings: "'FILL' 1", marginLeft: '8px', verticalAlign: 'middle', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>favorite</span>}
                             </span>
                           </div>
                         );
                       }
                       return (
                         <div key={index} className="answer-tile answer-tile-hidden" style={isLifeBox ? { border: '4px solid #10b981', background: 'rgba(16,185,129,0.3)', boxShadow: '0 0 20px rgba(16,185,129,0.5)' } : {}}>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', width: '100%', position: 'relative' }}>
                             <span>{index + 1}</span>
                             {isLifeBox && <span className="material-symbols-outlined" style={{ position: 'absolute', right: '20px', color: '#10b981', fontVariationSettings: "'FILL' 1", fontSize: '2.5rem', animation: 'pulse 1.5s infinite', textShadow: '0 0 10px rgba(16,185,129,0.8)' }}>favorite</span>}
                           </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
               <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', background: timer <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  border: `4px solid ${timer <= 10 ? '#ef4444' : 'var(--primary)'}` 
               }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: timer <= 10 ? '#ef4444' : 'white' }}>{timer}</span>
               </div>
               
               <form onSubmit={handleValidation} style={{ flex: 1, display: 'flex', gap: '16px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    autoFocus
                    disabled={validating || showRoulette}
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.5)',
                      border: '2px solid rgba(255,255,255,0.15)',
                      borderRadius: '20px',
                      padding: '24px 32px',
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'white',
                      fontFamily: 'Be Vietnam Pro',
                      outline: 'none',
                      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
                    }}
                  />
                  <button type="submit" disabled={validating || showRoulette || !inputValue.trim()} className="btn-primary" style={{ padding: '0 40px', fontSize: '1.5rem', borderRadius: '20px' }}>
                     ENVIAR
                  </button>
               </form>
            </div>
         </div>
         
       </div>
    </div>
  );
};

export default YoVs100GamePage;
