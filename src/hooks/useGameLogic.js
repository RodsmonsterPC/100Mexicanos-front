import { useState, useCallback, useRef } from 'react';

const WIN_SCORE = 500;
const MAX_STRIKES = 3;

// Normalize text for comparison (remove accents, lowercase, trim)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Check if two strings match (with some fuzzy tolerance)
const isMatch = (input, target) => {
  const normalInput = normalizeText(input);
  const normalTarget = normalizeText(target);
  
  if (normalInput === normalTarget) return true;
  
  // Check if input is contained in target or vice versa (partial match for long answers)
  if (normalTarget.length > 5 && normalInput.length > 3) {
    if (normalTarget.includes(normalInput)) return true;
    if (normalInput.includes(normalTarget)) return true;
  }
  
  // Levenshtein distance for typo tolerance
  const distance = levenshtein(normalInput, normalTarget);
  const threshold = Math.max(1, Math.floor(normalTarget.length * 0.25));
  return distance <= threshold;
};

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

const useGameLogic = ({ question, teams, onGameEnd, onTurnChange }) => {
  const [scores, setScores] = useState([0, 0]); // [teamA, teamB]
  const [strikes, setStrikes] = useState([0, 0]); // [teamA, teamB]
  const [revealedAnswers, setRevealedAnswers] = useState(
    question ? question.answers.map(() => false) : []
  );
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0); // 0 = A, 1 = B
  const [phase, setPhase] = useState('playing'); // 'playing' | 'stealing' | 'ended'
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', message: string }
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2000);
  }, []);

  const checkAnswer = useCallback((input) => {
    if (!question || isInputDisabled) return;

    setIsInputDisabled(true);
    setIsTimerRunning(false);

    // Wait 2 seconds before validating (per AGENTS.md requirement)
    setTimeout(() => {
      const matchedIndex = question.answers.findIndex(
        (answer, idx) => !revealedAnswers[idx] && isMatch(input, answer.text)
      );

      if (matchedIndex !== -1) {
        // Correct answer
        const points = question.answers[matchedIndex].points;

        setRevealedAnswers((prev) => {
          const next = [...prev];
          next[matchedIndex] = true;
          return next;
        });

        setScores((prev) => {
          const next = [...prev];
          next[currentTeamIndex] += points;
          return next;
        });

        showFeedback('correct', `+${points} puntos!`);

        // Check if all answers revealed
        const newRevealed = revealedAnswers.map((r, i) => (i === matchedIndex ? true : r));
        const allRevealed = newRevealed.every(Boolean);

        setTimeout(() => {
          setIsInputDisabled(false);
          if (allRevealed) {
            // Check win condition
            setScores((prev) => {
              const totalA = prev[0];
              const totalB = prev[1];
              if (totalA >= WIN_SCORE || totalB >= WIN_SCORE) {
                const winnerIndex = totalA >= WIN_SCORE ? 0 : 1;
                onGameEnd({ winnerIndex, scores: prev, teams });
                setPhase('ended');
                setIsTimerRunning(false);
              }
              return prev;
            });
          } else {
            setIsTimerRunning(true);
          }
        }, 1500);
      } else {
        // Wrong answer
        showFeedback('wrong', '¡Incorrecto!');

        setStrikes((prev) => {
          const next = [...prev];
          next[currentTeamIndex] += 1;

          if (next[currentTeamIndex] >= MAX_STRIKES) {
            // Switch turn
            setTimeout(() => {
              if (phase === 'playing') {
                // Other team gets to steal
                const nextTeam = currentTeamIndex === 0 ? 1 : 0;
                setCurrentTeamIndex(nextTeam);
                next[nextTeam] = 0; // reset steal team strikes
                setPhase('stealing');
                onTurnChange && onTurnChange(nextTeam, true);
              } else if (phase === 'stealing') {
                // Steal failed, move on
                // In steal mode: if they got it wrong once, they lose
                const nextTeam = currentTeamIndex === 0 ? 1 : 0;
                setCurrentTeamIndex(nextTeam);
                setStrikes([0, 0]);
                setPhase('playing');
                onTurnChange && onTurnChange(nextTeam, false);
              }
            }, 1500);
          }

          return next;
        });

        setTimeout(() => {
          setIsInputDisabled(false);
          setIsTimerRunning(true);
        }, 1500);
      }
    }, 2000);
  }, [question, revealedAnswers, currentTeamIndex, isInputDisabled, phase, onGameEnd, onTurnChange, showFeedback, teams]);

  const handleTimerExpire = useCallback(() => {
    setIsTimerRunning(false);
    if (phase === 'playing') {
      const nextTeam = currentTeamIndex === 0 ? 1 : 0;
      setTimeout(() => {
        setCurrentTeamIndex(nextTeam);
        setStrikes([0, 0]);
        setPhase('stealing');
        onTurnChange && onTurnChange(nextTeam, true);
      }, 500);
    } else if (phase === 'stealing') {
      // Time expired on steal - move to next question or end turn
      const nextTeam = currentTeamIndex === 0 ? 1 : 0;
      setTimeout(() => {
        setCurrentTeamIndex(nextTeam);
        setStrikes([0, 0]);
        setPhase('playing');
        onTurnChange && onTurnChange(nextTeam, false);
      }, 500);
    }
  }, [currentTeamIndex, phase, onTurnChange]);

  // Check win condition after each score update
  const checkWinCondition = useCallback((newScores) => {
    const winnerIndex = newScores.findIndex((s) => s >= WIN_SCORE);
    if (winnerIndex !== -1) {
      setPhase('ended');
      setIsTimerRunning(false);
      onGameEnd({ winnerIndex, scores: newScores, teams });
    }
  }, [onGameEnd, teams]);

  return {
    scores,
    strikes,
    revealedAnswers,
    currentTeamIndex,
    phase,
    feedback,
    isInputDisabled,
    isTimerRunning,
    checkAnswer,
    handleTimerExpire,
    setIsTimerRunning,
  };
};

export default useGameLogic;
