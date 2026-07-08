import { useTaskContext } from '../context/TaskContext';

export const StreakGraph = () => {
  const { timeLogs } = useTaskContext();
  
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const goalMetPerDay = {};
  days.forEach(date => {
    let met = false;
    const logs = timeLogs.filter(l => l.date === date);
    if (logs.length > 0) met = true; // Qualquer trabalho conta como consistência (pode ser refinado depois)
    goalMetPerDay[date] = met;
  });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem' }}>Consistência (Últimos 30 dias)</h3>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Mais verde = Mais foco</span>
      </div>
      
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '0.5rem', alignItems: 'center' }}>
        {days.map(date => {
          const met = goalMetPerDay[date];
          return (
            <div 
              key={date}
              title={date}
              style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: met ? 'var(--success)' : 'var(--glass-border)',
                boxShadow: met ? '0 0 8px var(--success)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
