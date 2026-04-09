import { useState, useEffect, useRef, useCallback } from 'react';

const TOTAL_TIME = 40;

const useTimer = (onExpire, isRunning) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const intervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    setTimeLeft(TOTAL_TIME);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      stopTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [isRunning, onExpire, stopTimer]);

  return { timeLeft, resetTimer, stopTimer };
};

export default useTimer;
