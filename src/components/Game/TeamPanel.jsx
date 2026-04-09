const TeamPanel = ({ team, score, isActive, isStealing }) => {
  const colorClass = team === 'A' ? '' : 'orange';

  let panelClass = 'team-panel';
  if (isActive && !isStealing) panelClass += ' active';
  else if (isStealing) panelClass += ' stealing';
  else panelClass += ' inactive';

  return (
    <div className={panelClass} style={{ position: 'relative' }}>
      {/* Turn indicator */}
      {(isActive) && (
        <div className={`turn-badge ${isStealing ? 'steal-badge' : ''}`}>
          {isStealing ? '¡ROBO!' : 'Turno Activo'}
        </div>
      )}

      {/* Team Icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: `4px solid ${team === 'A' ? 'var(--primary)' : 'var(--secondary)'}`,
          background: `${team === 'A' ? 'rgba(144,171,255,0.1)' : 'rgba(255,143,6,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isActive ? `0 0 20px ${team === 'A' ? 'rgba(144,171,255,0.4)' : 'rgba(255,143,6,0.4)'}` : 'none',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '2.5rem',
            color: team === 'A' ? 'var(--primary)' : 'var(--secondary)',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          groups
        </span>
      </div>

      {/* Team Name */}
      <h3
        className="font-headline"
        style={{
          fontSize: '1.125rem',
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
        }}
      >
        {team.name || `EQUIPO ${team}`}
      </h3>

      {/* Score */}
      <div className="team-score">
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--on-surface-variant)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '4px',
          }}
        >
          Puntos
        </span>
        <span className={`team-score-number ${colorClass}`}>{score}</span>
      </div>
    </div>
  );
};

export default TeamPanel;
