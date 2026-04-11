import { useEffect, useRef } from 'react';

const TOTAL_TIME = 40;
const CIRCUMFERENCE = 2 * Math.PI * 58; // r=58

const Timer = ({ timeLeft, isWarning }) => {
  const dashOffset = CIRCUMFERENCE - (timeLeft / TOTAL_TIME) * CIRCUMFERENCE;

  return (
    <div className={`timer-circle ${isWarning ? 'timer-warning' : ''}`}>
      <svg width="100%" height="100%" viewBox="0 0 128 128" style={{ display: 'block' }}>
        {/* Background arc */}
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="transparent"
          stroke="var(--surface-container-high)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="transparent"
          stroke={isWarning ? 'var(--error)' : 'var(--secondary)'}
          strokeWidth="8"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            filter: isWarning
              ? 'drop-shadow(0 0 10px rgba(255, 110, 132, 0.6))'
              : 'drop-shadow(0 0 10px rgba(255, 143, 6, 0.5))',
          }}
        />
      </svg>
      <div className="timer-number">{timeLeft}</div>
    </div>
  );
};

export default Timer;
