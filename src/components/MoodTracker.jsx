import { useTaskContext } from '../context/TaskContext';
import { getLocalYMD } from '../utils/dateUtils';

export const MoodTracker = () => {
  const { productivityRatings, addProductivityRating } = useTaskContext();
  const todayStr = getLocalYMD();
  
  const todayRating = productivityRatings.find(r => r.date === todayStr);

  const emojis = [
    { score: 1, emoji: '😢' },
    { score: 2, emoji: '😕' },
    { score: 3, emoji: '😐' },
    { score: 4, emoji: '🙂' },
    { score: 5, emoji: '🤩' },
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', animationDelay: '0.5s' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Como você se sentiu produtivo hoje?</h3>
      {todayRating ? (
        <div>
          <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>
            {emojis.find(e => e.score === todayRating.score)?.emoji}
          </span>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Avaliação registrada! Volte amanhã.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
          {emojis.map(e => (
            <button key={e.score} onClick={() => addProductivityRating(e.score)} style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px',
              fontSize: '2rem', cursor: 'pointer', transition: 'all 0.2s', padding: '0.5rem'
            }} 
            onMouseOver={(el) => { el.currentTarget.style.transform = 'scale(1.1)'; el.currentTarget.style.borderColor = 'var(--accent-primary)'; }} 
            onMouseOut={(el) => { el.currentTarget.style.transform = 'scale(1)'; el.currentTarget.style.borderColor = 'var(--glass-border)'; }}>
              {e.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
