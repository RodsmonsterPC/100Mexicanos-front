const StrikeIndicator = ({ strikes, max = 3 }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
      {Array.from({ length: max }).map((_, index) => (
        <div
          key={index}
          className={`strike-box ${index < strikes ? 'active' : ''}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {index < strikes ? (
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '2.5rem',
                color: 'var(--error)',
                fontVariationSettings: "'wght' 900",
              }}
            >
              close
            </span>
          ) : (
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'rgba(81, 56, 137, 0.2)',
                fontFamily: 'Plus Jakarta Sans',
              }}
            >
              X
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default StrikeIndicator;
