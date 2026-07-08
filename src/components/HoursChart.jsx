import { useTaskContext } from '../context/TaskContext';
import { BarChart3 } from 'lucide-react';

export const HoursChart = () => {
  const { timeLogs } = useTaskContext();
  
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const data = days.map(date => {
    const totalMinutes = timeLogs.filter(l => l.date === date).reduce((acc, log) => acc + log.durationInMinutes, 0);
    const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    return { dateLabel, totalMinutes, hours: (totalMinutes / 60).toFixed(1) };
  });

  const maxMinutes = Math.max(...data.map(d => d.totalMinutes), 60);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <BarChart3 color="var(--accent-primary)" size={20} /> Horas Trabalhadas
      </h3>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
        {data.map((d, i) => {
          const heightPct = (d.totalMinutes / maxMinutes) * 100;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.totalMinutes > 0 ? d.hours + 'h' : ''}</span>
              <div style={{
                width: '100%', maxWidth: '30px', height: `${heightPct}%`, minHeight: '4px',
                background: 'var(--accent-gradient)', borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease'
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {d.dateLabel}
          </div>
        ))}
      </div>
    </div>
  );
};
