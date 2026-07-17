import { useTaskContext } from '../context/TaskContext';
import { Flame } from 'lucide-react';

export const StreakCalendar = ({ projectId }) => {
  const { timeLogs, projects } = useTaskContext();
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); 
  
  const weeks = [];
  let currentWeek = Array(7).fill(null);
  
  let currentDayOfWeek = startingDayOfWeek;
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateStr = d.toISOString().split('T')[0];
    
    let met = false;
    const evaluateMet = (proj, dStr) => {
       const worked = timeLogs.filter(l => l.date === dStr && l.projectId === proj.id).reduce((a,b) => a+b.durationInMinutes, 0);
       const target = proj.timeTiers?.ok || proj.dailyGoal || 10;
       return worked >= target;
    };

    if (projectId) {
       const p = projects.find(proj => proj.id === projectId);
       if (p && evaluateMet(p, dateStr)) met = true;
    } else {
       const workedGlobal = timeLogs.filter(l => l.date === dateStr).reduce((a,b) => a+b.durationInMinutes, 0);
       if (workedGlobal >= 30) met = true;
    }
    
    currentWeek[currentDayOfWeek] = { date: i, dateStr, met, isToday: dateStr === today.toISOString().split('T')[0] };
    
    currentDayOfWeek++;
    if (currentDayOfWeek > 6) {
      weeks.push(currentWeek);
      currentWeek = Array(7).fill(null);
      currentDayOfWeek = 0;
    }
  }
  if (currentWeek.some(d => d !== null)) {
    weeks.push(currentWeek);
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame color="var(--accent-primary)" size={20} /> Constância {projectId ? 'do Projeto' : 'Geral'}
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>
        {weeks.map((week, wIdx) => (
          <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {week.map((day, dIdx) => {
              if (!day) return <div key={dIdx} />;
              
              const isMet = day.met;
              const isToday = day.isToday;
              
              return (
                <div key={dIdx} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
                  {isMet && day.date < daysInMonth && (() => {
                     const nextD = new Date(year, month, day.date + 1).toISOString().split('T')[0];
                     let nextMet = false;
                     
                     const evaluateMetNext = (proj, dStr) => {
                        const worked = timeLogs.filter(l => l.date === dStr && l.projectId === proj.id).reduce((a,b) => a+b.durationInMinutes, 0);
                        const target = proj.timeTiers?.ok || proj.dailyGoal || 10;
                        return worked >= target;
                     };

                     if (projectId) {
                        const p = projects.find(proj => proj.id === projectId);
                        if (p && evaluateMetNext(p, nextD)) nextMet = true;
                     } else {
                        const workedGlobalNext = timeLogs.filter(l => l.date === nextD).reduce((a,b) => a+b.durationInMinutes, 0);
                        if (workedGlobalNext >= 30) nextMet = true;
                     }
                     if (nextMet && dIdx < 6) {
                        return <div style={{ position: 'absolute', right: '-20%', top: '50%', width: '140%', height: '4px', background: 'var(--success)', zIndex: 1, transform: 'translateY(-50%)' }} />
                     }
                  })()}
                  
                  <div style={{
                    position: 'relative', zIndex: 2,
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: isMet ? 'var(--success)' : 'var(--glass-bg)',
                    border: isToday ? '2px solid #fff' : (isMet ? 'none' : '1px solid var(--glass-border)'),
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontSize: '0.85rem', fontWeight: 'bold',
                    color: isMet ? '#000' : 'var(--text-secondary)',
                    boxShadow: isMet ? '0 0 12px rgba(0, 230, 118, 0.4)' : 'none'
                  }}>
                    {day.date}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
