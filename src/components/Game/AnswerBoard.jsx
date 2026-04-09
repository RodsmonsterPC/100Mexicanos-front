const AnswerBoard = ({ answers, revealedAnswers, forceRevealAll = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {answers.map((answer, index) => {
        const isRevealed = revealedAnswers[index];
        const isForced = !isRevealed && forceRevealAll;

        if (isRevealed) {
          // Answered correctly by a team
          return (
            <div key={index} className="answer-tile answer-tile-revealed">
              <span className="answer-text">
                {index + 1}. {answer.text}
              </span>
              <span className="answer-points">{answer.points}</span>
            </div>
          );
        }

        if (isForced) {
          // Revealed at round end – nobody answered this
          return (
            <div
              key={index}
              className="answer-tile answer-tile-revealed"
              style={{
                opacity: 0.55,
                filter: 'grayscale(0.6)',
                borderColor: 'rgba(183,156,245,0.3)',
                background: 'rgba(55,0,133,0.25)',
              }}
            >
              <span className="answer-text" style={{ color: 'var(--on-surface-variant)' }}>
                {index + 1}. {answer.text}
              </span>
              <span className="answer-points" style={{ color: 'var(--on-surface-variant)' }}>
                {answer.points}
              </span>
            </div>
          );
        }

        // Hidden
        return (
          <div key={index} className="answer-tile answer-tile-hidden">
            {index + 1}
          </div>
        );
      })}
    </div>
  );
};

export default AnswerBoard;
