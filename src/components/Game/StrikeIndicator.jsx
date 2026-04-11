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
            <span className="material-symbols-outlined strike-icon-active">
              close
            </span>
          ) : (
            <span className="strike-icon-inactive">
              X
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default StrikeIndicator;
