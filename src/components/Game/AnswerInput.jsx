import { useRef } from 'react';

const AnswerInput = ({ value, onChange, onSubmit, disabled, currentTeam, currentPlayer }) => {
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
        padding: '24px 32px',
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
            placeholder="Escribe tu respuesta aquí..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
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
          className="btn-secondary"
          disabled={disabled || !value.trim()}
          style={{
            padding: '20px 32px',
            fontSize: '1rem',
            opacity: disabled || !value.trim() ? 0.5 : 1,
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          ENVIAR
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
        </button>
      </form>
    </div>
  );
};

export default AnswerInput;
