import { useRef } from 'react';

const AnswerInput = ({ value, onChange, onSubmit, disabled, currentTeam, currentPlayer, typingUser, isLockedByOther, onFocus, onBlur }) => {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !disabled && value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface-container-high)',
        padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 32px)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        borderTop: '2px solid rgba(255,255,255,0.05)',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--on-surface-variant)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '12px',
        }}
      >
        {currentTeam ? (currentPlayer ? `Responde, ${currentTeam} (Jugador: ${currentPlayer}):` : `Responde, ${currentTeam}:`) : 'Tu respuesta:'}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            className="answer-input-field"
            placeholder={typingUser && isLockedByOther ? `👤 ${typingUser} está escribiendo...` : "Escribe tu respuesta aquí..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled || isLockedByOther}
            autoComplete="off"
            autoFocus
          />
          <div
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.2,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>keyboard</span>
          </div>
        </div>
        <button
          type="submit"
          className="btn-secondary mobile-icon-button"
          disabled={disabled || !value.trim()}
          style={{
            padding: '20px 32px',
            fontSize: '1rem',
            opacity: disabled || isLockedByOther || !value.trim() ? 0.5 : 1,
            cursor: disabled || isLockedByOther || !value.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          <span className="hidden-mobile">ENVIAR</span>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
        </button>
      </form>
    </div>
  );
};

export default AnswerInput;
