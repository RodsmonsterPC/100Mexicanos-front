import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import AnswerBoard from '../components/Game/AnswerBoard';
import Timer from '../components/Game/Timer';
import StrikeIndicator from '../components/Game/StrikeIndicator';
import AnswerInput from '../components/Game/AnswerInput';
import TeamRoulette from '../components/Game/TeamRoulette';
import { getRandomQuestion } from '../services/api';
import useTimer from '../hooks/useTimer';
import { useSocketContext } from '../contexts/SocketContext';
import { useAuthContext } from '../contexts/AuthContext';

const WIN_SCORE = 500;
const MAX_STRIKES = 3;

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
    <svg width="24" height="36" viewBox="0 0 24 36" fill="none" style={{ filter: `drop-shadow(0px 2px 4px rgba(0,0,0,0.5))` }}>
      <path d="M2.5 2.5L9.5 32.5L14 20L23.5 14L2.5 2.5Z" fill={color} stroke="white" strokeWidth="2" strokeLinejoin="round" />
    </svg>
    {username && (
       <div style={{ background: color, color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '4px', alignSelf: 'flex-start', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          {username}
       </div>
    )}
  </div>
);

// Normalize text for comparison (remove accents, lowercase, trim)
const normalizeText = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
};

const isMatch = (input, target) => {
  const ni = normalizeText(input);
  const nt = normalizeText(target);
  if (ni === nt) return true;
  if (nt.length > 5 && ni.length > 3) {
    if (nt.includes(ni) || ni.includes(nt)) return true;
  }
  const threshold = Math.max(1, Math.floor(nt.length * 0.25));
  return levenshtein(ni, nt) <= threshold;
};

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, connectedRoom } = useSocketContext();
  const { user } = useAuthContext();
  
  const [matchData, setMatchData] = useState(() => {
    let data = location.state;
    if (!data) {
      const stored = sessionStorage.getItem('matchState');
      if (stored) data = JSON.parse(stored);
    }
    return data || {};
  });

  const { teamA, teamB, categories, initialQuestion } = matchData;

  useEffect(() => {
    if (matchData && Object.keys(matchData).length > 0) {
      sessionStorage.setItem('matchState', JSON.stringify(matchData));
    }
  }, [matchData]);

  const teams = [teamA, teamB];
  const [remoteCursors, setRemoteCursors] = useState({});
  const myColorRef = useRef(user?.avatarColor || '#10b981');
  const lastEmitTime = useRef(0);

  useEffect(() => {
    if (!teamA || !teamB) {
       if (!connectedRoom || !socket) {
          navigate('/teams');
       } else {
          const timeout = setTimeout(() => navigate('/teams'), 4000);
          return () => clearTimeout(timeout);
       }
    }
  }, [teamA, teamB, navigate, connectedRoom, socket]);

  // ─── Game State ───────────────────────────────────────────────────────────
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([0, 0]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [activePlayerIndexes, setActivePlayerIndexes] = useState([0, 0]);
  // Per-turn strikes: only for the active team this turn
  const [currentStrikes, setCurrentStrikes] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  // phase: 'playing' | 'stealing' | 'roundOver'
  const [phase, setPhase] = useState('playing');
  // Which team OWNS the round (earns points if steal fails)
  const [roundOwnerIndex, setRoundOwnerIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimerRef = useRef(null);
  const currentUserIdentifier = user?.username || sessionStorage.getItem('guestUsername');
  // For "roundOver" phase: reveal all answers before loading next question
  const [roundOverRevealed, setRoundOverRevealed] = useState([]);

  // Use a ref for scores so timer callbacks always have fresh value
  const scoresRef = useRef([0, 0]);
  useEffect(() => { scoresRef.current = scores; }, [scores]);

  const broadcastState = useCallback((updates) => {
    if (socket && connectedRoom) {
      socket.emit('sync_game_state', { room: connectedRoom, updates });
    }
  }, [socket, connectedRoom]);

  useEffect(() => {
    if (!socket) return;
    const handleSync = (data) => {
      const u = data.updates;
      if (u.scores !== undefined) setScores(u.scores);
      if (u.currentTeamIndex !== undefined) setCurrentTeamIndex(u.currentTeamIndex);
      if (u.activePlayerIndexes !== undefined) setActivePlayerIndexes(u.activePlayerIndexes);
      if (u.currentStrikes !== undefined) setCurrentStrikes(u.currentStrikes);
      if (u.revealedAnswers !== undefined) setRevealedAnswers(u.revealedAnswers);
      if (u.phase !== undefined) setPhase(u.phase);
      if (u.roundOwnerIndex !== undefined) setRoundOwnerIndex(u.roundOwnerIndex);
      if (u.isInputDisabled !== undefined) setIsInputDisabled(u.isInputDisabled);
      if (u.typingUser !== undefined) {
         setTypingUser(u.typingUser);
         if (u.typingUser === null && typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
         }
      }
      if (u.feedback) showFeedback(u.feedback.type, u.feedback.message);
      if (u.winnerOnDeck !== undefined) setWinnerOnDeck(u.winnerOnDeck);
      
      // Sync timer strictly via flag
      if (u.isTimerRunning !== undefined) {
         if (u.isTimerRunning) {
             if (resetTimerRef.current) resetTimerRef.current();
             setIsTimerRunning(true);
         } else {
             setIsTimerRunning(false);
         }
      }
    };
    
    socket.on('game_state_synced', handleSync);

    const handleRoomState = (data) => {
      if (data.teamA && data.teamB) {
         setMatchData(prev => ({ ...prev, teamA: data.teamA, teamB: data.teamB, ...data.gameState }));
      }
      if (data.gameState) {
         handleSync({ updates: data.gameState });
         if (data.gameState.question) {
             setQuestion(data.gameState.question);
         } else if (data.gameState.initialQuestion) {
             setQuestion(data.gameState.initialQuestion);
         }
         setLoading(false);
      }
    };
    socket.on('sync_room_state', handleRoomState);

    const handleGoToWinner = (data) => {
      navigate('/winner', {
         state: { teams: data.teams || teams, scores: data.scores || scores, winnerIndex: data.winnerIndex }
      });
    };
    socket.on('go_to_winner', handleGoToWinner);

    const handleMouseMove = (data) => {
      setRemoteCursors(prev => ({
        ...prev,
        [data.id]: { x: data.x, y: data.y, color: data.color, username: data.username, lastSeen: Date.now() }
      }));
    };
    socket.on('mouse_moved', handleMouseMove);

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
      socket.off('game_state_synced', handleSync);
      socket.off('sync_room_state', handleRoomState);
      socket.off('go_to_winner', handleGoToWinner);
      socket.off('mouse_moved', handleMouseMove);
      clearInterval(interval);
    };
  }, [socket, teams, scores, navigate]);

  // ─── Load Question ────────────────────────────────────────────────────────
  const loadQuestion = useCallback(async (keepScores = null, useQ = null) => {
    setLoading(true);
    setIsTimerRunning(false);
    try {
      let q = useQ;
      if (!q) {
        const res = await getRandomQuestion(categories);
        q = res.data;
      }
      setQuestion(q);
      setRevealedAnswers(q.answers.map(() => false));
      setCurrentStrikes(0);
      setPhase('roulette');
      setRoundOverRevealed([]);
      setInputValue('');
      if (keepScores) setScores(keepScores);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('obtener pregunta aleatoria')) {
         alert('No hay más preguntas en las categorías seleccionadas. Volviendo a selección de equipos.');
         navigate('/teams');
      }
    } finally {
      setLoading(false);
    }
  }, [categories, navigate]);

  const didInitRef = useRef(false);

  useEffect(() => {
    // Only load initial on first mount, or sync context if returning via refresh
    if (didInitRef.current) return;

    if (location.state) {
         didInitRef.current = true;
         loadQuestion(null, initialQuestion);
    } else if (connectedRoom && socket) {
         didInitRef.current = true;
         // Attempt to request missing real-time variables from back
         socket.emit('request_room_data', { room: connectedRoom });
    }
  }, [loadQuestion, initialQuestion, location.state, connectedRoom, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleNextQ = (data) => loadQuestion(scoresRef.current, data.question);
    socket.on('question_advanced', handleNextQ);
    return () => socket.off('question_advanced', handleNextQ);
  }, [socket, loadQuestion]);

  // Sync roundOwner when currentTeamIndex changes during 'playing' phase
  useEffect(() => {
    if (phase === 'playing') {
      setRoundOwnerIndex(currentTeamIndex);
    }
  }, [currentTeamIndex, phase]);

  // ─── Feedback Helper ──────────────────────────────────────────────────────
  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2000);
  }, []);

  // ─── Round Over: Reveal answers manually advance  ─────────────────────────
  const [winnerOnDeck, setWinnerOnDeck] = useState(null); // Stores winner if game won
  
  const endRound = useCallback((finalScores, winnerIdx = null) => {
    setIsTimerRunning(false);
    setIsInputDisabled(true);
    setPhase('roundOver');
    
    // Reveal all answers
    const allRevealed = question?.answers.map(() => true) || [];
    setRevealedAnswers(allRevealed);
    
    // Save winner if any, do not auto advance
    if (winnerIdx !== null) {
      setWinnerOnDeck(winnerIdx);
    } else {
      setWinnerOnDeck(null);
    }

    broadcastState({
      isTimerRunning: false,
      isInputDisabled: true,
      phase: 'roundOver',
      revealedAnswers: allRevealed,
      winnerOnDeck: winnerIdx !== null ? winnerIdx : null
    });
  }, [question, broadcastState]);

  // Auto-redirect to the Winner Page after 4 seconds of displaying the final answers
  useEffect(() => {
    if (winnerOnDeck !== null) {
      const winnerData = { teams, scores, winnerIndex: winnerOnDeck };
      const timeout = setTimeout(() => {
        if (socket && connectedRoom) socket.emit('end_game_winner', { room: connectedRoom, ...winnerData });
        navigate('/winner', { state: winnerData });
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [winnerOnDeck, teams, scores, navigate, socket, connectedRoom]);

  const handleNextRound = async () => {
    if (winnerOnDeck !== null) {
      const winnerData = { teams, scores, winnerIndex: winnerOnDeck };
      if (socket && connectedRoom) socket.emit('end_game_winner', { room: connectedRoom, ...winnerData });
      navigate('/winner', { state: winnerData });
    } else {
      try {
        const res = await getRandomQuestion(categories);
        if (socket && connectedRoom) socket.emit('next_question', { room: connectedRoom, question: res.data });
        loadQuestion(scoresRef.current, res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ─── Timer Expire ─────────────────────────────────────────────────────────
  const resetTimerRef = useRef(null);

  const handleTimerExpire = useCallback(() => {
    setIsTimerRunning(false);
    setIsInputDisabled(true);

    if (phase === 'playing') {
      showFeedback('wrong', '¡Tiempo agotado!');
      
      const newStrikes = currentStrikes + 1;
      setCurrentStrikes(newStrikes);
      broadcastState({ isTimerRunning: false, isInputDisabled: true, currentStrikes: newStrikes, feedback: { type: 'wrong', message: '¡Tiempo agotado!' } });

      if (newStrikes >= MAX_STRIKES) {
        setTimeout(() => {
          const nextTeamIdx = currentTeamIndex === 0 ? 1 : 0;
          setCurrentTeamIndex(nextTeamIdx);
          setCurrentStrikes(0);
          setPhase('stealing');
          setIsInputDisabled(false);
          setIsTimerRunning(true);
          broadcastState({ currentTeamIndex: nextTeamIdx, currentStrikes: 0, phase: 'stealing', isInputDisabled: false, isTimerRunning: true });
        }, 1500);
      } else {
        setTimeout(() => {
          setIsInputDisabled(false);
          setIsTimerRunning(true);
          broadcastState({ isInputDisabled: false, isTimerRunning: true });
        }, 1500);
      }
    } else if (phase === 'stealing') {
      broadcastState({ isTimerRunning: false, isInputDisabled: true, feedback: { type: 'wrong', message: '¡Tiempo agotado!' } });
      setTimeout(() => {
        const newScores = [...scoresRef.current];
        setCurrentTeamIndex(roundOwnerIndex);
        setCurrentStrikes(0);
        
        broadcastState({ currentTeamIndex: roundOwnerIndex, currentStrikes: 0 });

        if (newScores[roundOwnerIndex] >= WIN_SCORE) {
          endRound(newScores, roundOwnerIndex);
        } else {
          endRound(newScores);
        }
      }, 1500);
    }
  }, [phase, roundOwnerIndex, endRound, currentStrikes, showFeedback, broadcastState, currentTeamIndex]);

  const { timeLeft, resetTimer, stopTimer } = useTimer(handleTimerExpire, isTimerRunning);

  useEffect(() => {
    resetTimerRef.current = resetTimer;
  }, [resetTimer]);

  // ─── Answer Submit ────────────────────────────────────────────────────────
  const handleSubmit = useCallback((input) => {
    if (!question || isInputDisabled || phase === 'roundOver') return;
    setIsInputDisabled(true);
    setIsTimerRunning(false);
    setInputValue('');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    // CRITICAL: Stop timer globally IMMEDIATELY and release typing lock
    broadcastState({ isTimerRunning: false, isInputDisabled: true, typingUser: null });
    setTypingUser(null);

    // Wait 2 seconds before validating (per spec)
    setTimeout(() => {
      // Advance active player for current team
      let nextPlayerIndexes = [...activePlayerIndexes];
      if (teams[currentTeamIndex]?.players?.length) {
         nextPlayerIndexes[currentTeamIndex] = (nextPlayerIndexes[currentTeamIndex] + 1) % teams[currentTeamIndex].players.length;
      }
      setActivePlayerIndexes(nextPlayerIndexes);

      const matchedIndex = question.answers.findIndex(
        (answer, idx) => !revealedAnswers[idx] && isMatch(input, answer.text)
      );

      if (matchedIndex !== -1) {
        // ── CORRECT ─────────────────────────────────────────────────────────
        const points = question.answers[matchedIndex].points;
        const newRevealed = [...revealedAnswers];
        newRevealed[matchedIndex] = true;
        setRevealedAnswers(newRevealed);

        const newScores = [...scoresRef.current];
        let stealMessage = '';

        if (phase === 'stealing') {
          const bankedPoints = question.answers.reduce((sum, ans, idx) => {
            return newRevealed[idx] ? sum + ans.points : sum;
          }, 0) - points; // Calculate existing minus new points to find banked

          // Original team loses banked points
          newScores[roundOwnerIndex] -= bankedPoints;
          if (newScores[roundOwnerIndex] < 0) newScores[roundOwnerIndex] = 0;

          // Stealing team gets banked points + current answer points
          newScores[currentTeamIndex] += (bankedPoints + points);
          stealMessage = `¡ROBO! +${bankedPoints + points} PTS`;
        } else {
          newScores[currentTeamIndex] += points;
        }

        setScores(newScores);
        scoresRef.current = newScores;

        const fbMsg = phase === 'stealing' ? stealMessage : `+${points} puntos!`;
        showFeedback('correct', fbMsg);

        broadcastState({ 
          activePlayerIndexes: nextPlayerIndexes,
          revealedAnswers: newRevealed, 
          scores: newScores, 
          feedback: { type: 'correct', message: fbMsg }
        });

        setTimeout(() => {
          if (newScores[currentTeamIndex] >= WIN_SCORE) {
            endRound(newScores, currentTeamIndex);
            return;
          }

          if (newRevealed.every(Boolean)) {
            setCurrentStrikes(0);
            broadcastState({ currentStrikes: 0 });
            endRound(newScores);
            return;
          }

          if (phase === 'stealing') {
            setCurrentStrikes(0);
            broadcastState({ currentStrikes: 0 });
            if (newScores[currentTeamIndex] >= WIN_SCORE) endRound(newScores, currentTeamIndex);
            else endRound(newScores);
            return;
          }

          setIsInputDisabled(false);
          setIsTimerRunning(true);
          broadcastState({ isInputDisabled: false, isTimerRunning: true });
        }, 1500);
      } else {
        // ── WRONG ───────────────────────────────────────────────────────────
        showFeedback('wrong', '¡Incorrecto!');

        if (phase === 'stealing') {
          const newScores = [...scoresRef.current];
          broadcastState({ 
             activePlayerIndexes: nextPlayerIndexes,
             feedback: { type: 'wrong', message: '¡Incorrecto!' } 
          });

          setTimeout(() => {
            setCurrentTeamIndex(roundOwnerIndex);
            setCurrentStrikes(0);
            broadcastState({ currentTeamIndex: roundOwnerIndex, currentStrikes: 0 });

            if (newScores[roundOwnerIndex] >= WIN_SCORE) endRound(newScores, roundOwnerIndex);
            else endRound(newScores);
          }, 1500);
        } else {
          const newStrikes = currentStrikes + 1;
          setCurrentStrikes(newStrikes);
          broadcastState({ 
             activePlayerIndexes: nextPlayerIndexes,
             currentStrikes: newStrikes, 
             feedback: { type: 'wrong', message: '¡Incorrecto!' } 
          });

          if (newStrikes >= MAX_STRIKES) {
            setTimeout(() => {
              const nextTeamIdx = currentTeamIndex === 0 ? 1 : 0;
              setCurrentTeamIndex(nextTeamIdx);
              setCurrentStrikes(0);
              setPhase('stealing');
              setIsInputDisabled(false);
              setIsTimerRunning(true);
              broadcastState({ currentTeamIndex: nextTeamIdx, currentStrikes: 0, phase: 'stealing', isInputDisabled: false, isTimerRunning: true });
            }, 1500);
          } else {
            setTimeout(() => {
              setIsInputDisabled(false);
              setIsTimerRunning(true);
              broadcastState({ isInputDisabled: false, isTimerRunning: true });
            }, 1500);
          }
        }
      }
    }, 2000);
  }, [
    question, revealedAnswers, currentTeamIndex, isInputDisabled,
    phase, roundOwnerIndex, currentStrikes,
    showFeedback, endRound, resetTimer,
  ]);

  if (!teamA || !teamB) return null;

  const currentTeam = teams[currentTeamIndex];
  const isStealing = phase === 'stealing';
  const isRoundOver = phase === 'roundOver';
  const isWarning = timeLeft <= 10;

  const handleContainerMouseMove = (e) => {
    if (!socket || !connectedRoom) return;
    const now = Date.now();
    if (now - lastEmitTime.current > 50) {
      socket.emit('mouse_move', {
        room: connectedRoom,
        id: socket.id,
        x: e.clientX,
        y: e.clientY,
        color: myColorRef.current,
        username: currentUserIdentifier
      });
      lastEmitTime.current = now;
    }
  };

  if (loading) {
    return (
      <div className="layout-wrapper">
        <Sidebar activePage="game" />
        <div className="main-content stage-gradient" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', animation: 'spin-slow 1s linear infinite', display: 'inline-block' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary)' }}>autorenew</span>
            </div>
            <p className="font-headline" style={{ color: 'var(--on-surface-variant)', marginTop: '16px', fontWeight: 700 }}>
              Cargando pregunta...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-wrapper" onMouseMove={handleContainerMouseMove}>
      <Sidebar activePage="game" />

      {Object.entries(remoteCursors).map(([id, cur]) => (
        <RemoteCursor key={id} x={cur.x} y={cur.y} color={cur.color} username={cur.username} />
      ))}

      {phase === 'roulette' && (
        <TeamRoulette 
          teams={teams} 
          socket={socket}
          connectedRoom={connectedRoom}
          onComplete={(winnerIdx) => {
            setCurrentTeamIndex(winnerIdx);
            setPhase('playing');
            setIsInputDisabled(false);
            setIsTimerRunning(true);
            broadcastState({
              currentTeamIndex: winnerIdx,
              phase: 'playing',
              isInputDisabled: false,
              isTimerRunning: true
            });
          }} 
        />
      )}

      <div
        className="main-content stage-gradient"
        style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        <Navbar />

        {/* Stage lights */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '400px', height: '400px', background: 'rgba(144,171,255,0.08)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '400px', height: '400px', background: 'rgba(255,143,6,0.07)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '160px', background: 'rgba(55,0,133,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
        </div>

        {/* Feedback bubble */}
        {feedback && (
          <div className={`feedback-bubble ${feedback.type}`} style={{ zIndex: 200 }}>
            {feedback.type === 'correct'
              ? <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              : <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
            }
            {feedback.message}
          </div>
        )}

        {/* Phase banner */}
        {isStealing && (
          <div
            style={{
              position: 'fixed',
              top: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              background: 'linear-gradient(90deg, var(--tertiary-fixed), var(--secondary))',
              color: 'var(--on-tertiary-fixed)',
              padding: '8px 32px',
              borderRadius: '999px',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 900,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              boxShadow: '0 4px 20px rgba(255,208,27,0.4)',
              animation: 'bounceIn 0.4s ease both',
            }}
          >
            ⚡ {teams[currentTeamIndex].name} puede robar los puntos!
          </div>
        )}

        {/* Round Over banner */}
        {isRoundOver && (
          <div
            style={{
              position: 'fixed',
              top: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              background: 'linear-gradient(90deg, #1a0050, #370085)',
              color: 'var(--primary)',
              padding: '10px 36px',
              borderRadius: '999px',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 900,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              boxShadow: '0 4px 20px rgba(144,171,255,0.3)',
              border: '1px solid rgba(144,171,255,0.3)',
              animation: 'bounceIn 0.4s ease both',
            }}
          >
            🔍 Revelando respuestas...
          </div>
        )}

        {/* Main Content */}
        <main
          style={{
            position: 'relative',
            zIndex: 10,
            paddingTop: '130px',
            paddingBottom: '48px',
            paddingLeft: '40px',
            paddingRight: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Question & Timer */}
          <section
            style={{
              width: '100%',
              maxWidth: '900px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '280px',
                background: 'var(--surface-container-highest)',
                borderBottom: '4px solid var(--primary-dim)',
                padding: '28px 32px',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--tertiary), transparent)',
                  opacity: 0.5,
                }}
              />
              <h2
                className="font-headline"
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--on-surface-variant)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Pregunta de la Ronda
              </h2>
              <p
                className="font-headline"
                style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.3,
                }}
              >
                {question?.question}
              </p>
            </div>

            <Timer timeLeft={timeLeft} isWarning={isWarning} />
          </section>

          {/* Game Area: Teams + Board */}
          <section
            style={{
              width: '100%',
              maxWidth: '1100px',
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Team A Panel */}
            <div
              className="team-panel"
              style={{
                border: `2px solid ${currentTeamIndex === 0 ? (isStealing ? 'var(--tertiary)' : 'var(--primary)') : 'transparent'}`,
                boxShadow: currentTeamIndex === 0 ? `0 0 40px ${isStealing ? 'rgba(255,224,131,0.3)' : 'rgba(144,171,255,0.4)'}` : 'none',
                opacity: currentTeamIndex !== 0 ? 0.6 : 1,
                filter: currentTeamIndex !== 0 ? 'grayscale(0.4)' : 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {currentTeamIndex === 0 && (
                <div className={`turn-badge ${isStealing ? 'steal-badge' : ''}`}>
                  {isStealing ? '¡ROBO!' : 'Turno Activo'}
                </div>
              )}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--primary)', background: 'rgba(144,171,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: currentTeamIndex === 0 ? '0 0 20px rgba(144,171,255,0.4)' : 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="font-headline" style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: 0 }}>{teams[0].name}</h3>
              {currentTeamIndex === 0 && !isRoundOver && phase !== 'roulette' && (
                 <p style={{ color: 'var(--tertiary)', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', marginBottom: '8px' }}>
                    Jugador: {teams[0].players[activePlayerIndexes[0]]}
                 </p>
              )}
              <div className="team-score">
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Puntos</span>
                <span className="team-score-number">{scores[0]}</span>
              </div>
            </div>

            {/* Board */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnswerBoard answers={question?.answers || []} revealedAnswers={revealedAnswers} forceRevealAll={isRoundOver} />
              <StrikeIndicator strikes={currentStrikes} />
            </div>

            {/* Team B Panel */}
            <div
              className="team-panel"
              style={{
                border: `2px solid ${currentTeamIndex === 1 ? (isStealing ? 'var(--tertiary)' : 'var(--secondary)') : 'transparent'}`,
                boxShadow: currentTeamIndex === 1 ? `0 0 40px ${isStealing ? 'rgba(255,224,131,0.3)' : 'rgba(255,143,6,0.3)'}` : 'none',
                opacity: currentTeamIndex !== 1 ? 0.6 : 1,
                filter: currentTeamIndex !== 1 ? 'grayscale(0.4)' : 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {currentTeamIndex === 1 && (
                <div className={`turn-badge ${isStealing ? 'steal-badge' : ''}`}>
                  {isStealing ? '¡ROBO!' : 'Turno Activo'}
                </div>
              )}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--secondary)', background: 'rgba(255,143,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: currentTeamIndex === 1 ? '0 0 20px rgba(255,143,6,0.4)' : 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="font-headline" style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: 0 }}>{teams[1].name}</h3>
              {currentTeamIndex === 1 && !isRoundOver && phase !== 'roulette' && (
                 <p style={{ color: 'var(--tertiary)', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', marginTop: '4px', marginBottom: '8px' }}>
                    Jugador: {teams[1].players[activePlayerIndexes[1]]}
                 </p>
              )}
              <div className="team-score">
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Puntos</span>
                <span className="team-score-number orange">{scores[1]}</span>
              </div>
            </div>
          </section>

          {/* Input Area */}
          <section style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <AnswerInput
              value={inputValue}
              onChange={(val) => {
                setInputValue(val);
                if (typingUser === currentUserIdentifier) {
                  if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                  typingTimerRef.current = setTimeout(() => {
                    broadcastState({ typingUser: null });
                    setTypingUser(null);
                  }, 8000);
                }
              }}
              onSubmit={handleSubmit}
              disabled={isInputDisabled || isRoundOver || phase === 'roulette'}
              currentTeam={currentTeam?.name}
              currentPlayer={currentTeam?.players?.[activePlayerIndexes[currentTeamIndex]]?.replace('LCK:', '') || ''}
              typingUser={typingUser}
              isLockedByOther={typingUser && typingUser !== currentUserIdentifier}
              onFocus={() => {
                if (!currentUserIdentifier || (typingUser && typingUser !== currentUserIdentifier)) return;
                broadcastState({ typingUser: currentUserIdentifier });
                setTypingUser(currentUserIdentifier);
                if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                typingTimerRef.current = setTimeout(() => {
                  broadcastState({ typingUser: null });
                  setTypingUser(null);
                }, 8000);
              }}
              onBlur={() => {
                if (typingUser === currentUserIdentifier) {
                  broadcastState({ typingUser: null });
                  setTypingUser(null);
                  if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                }
              }}
            />

            {isRoundOver && (
               <button
                 onClick={handleNextRound}
                 className="btn-primary"
                 style={{
                   width: '100%',
                   padding: '24px',
                   fontSize: '1.5rem',
                   fontWeight: 900,
                   background: 'linear-gradient(90deg, #10b981, #059669)',
                   border: 'none',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '12px',
                   boxShadow: '0 10px 25px rgba(16,185,129,0.5)',
                   marginTop: '16px'
                 }}
               >
                 {winnerOnDeck !== null ? 'Ir a Resultados Finales' : 'Siguiente Pregunta'}
                 <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>arrow_forward</span>
               </button>
            )}
          </section>
        </main>

        {/* Terminar Partida Button */}
        <button
          onClick={() => {
            if (window.confirm('¿Seguro que deseas terminar la partida anticipadamente?')) {
               // Calculate current winner or tie
               const winnerIdx = scores[0] >= scores[1] ? 0 : 1;
               navigate('/winner', {
                 state: { teams, scores, winnerIndex: winnerIdx },
               });
            }
          }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--error, #ef4444)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = '#dc2626';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'var(--error, #ef4444)';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>stop_circle</span>
          Terminar Partida
        </button>
      </div>
    </div>
  );
};

export default GamePage;
