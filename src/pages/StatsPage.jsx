import { useTaskContext } from '../context/TaskContext';
import { BarChart2, Flame, Clock, Trophy, Target, CheckCircle } from 'lucide-react';

export const StatsPage = () => {
  const { timeLogs, projects, goals } = useTaskContext();
  
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Agrupa logs por data
  const logsByDate = timeLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = 0;
    acc[log.date] += log.durationInMinutes;
    return acc;
  }, {});

  // KPI: Horas totais no ano
  const logsThisYear = timeLogs.filter(l => l.date.startsWith(currentYear.toString()));
  const totalMinutesThisYear = logsThisYear.reduce((acc, l) => acc + l.durationInMinutes, 0);
  const totalHoursThisYear = Math.floor(totalMinutesThisYear / 60);

  // KPI: Maior sequência (Streak Geral)
  // Conta dias que atingiram pelo menos o nível OK de qualquer projeto
  // Simplificação: vamos apenas ver dias com log
  let currentStreak = 0;
  let maxStreak = 0;
  const sortedDates = Object.keys(logsByDate).sort();
  if (sortedDates.length > 0) {
    let prevDate = new Date(sortedDates[0]);
    currentStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currDate = new Date(sortedDates[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
      prevDate = currDate;
    }
  }

  // Gráfico Mensal
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData = Array(12).fill(0);
  logsThisYear.forEach(l => {
    const monthIndex = parseInt(l.date.split('-')[1]) - 1;
    monthlyData[monthIndex] += l.durationInMinutes;
  });
  const maxMonthlyMinutes = Math.max(...monthlyData, 1); // evita divisão por zero

  // Mapa de Calor (Estilo GitHub)
  const heatmapData = [];
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  
  for (let d = new Date(startOfYear); d <= endOfYear; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const minutes = logsByDate[dateStr] || 0;
    heatmapData.push({ date: dateStr, minutes });
  }

  // Quebrar em semanas para o grid do heatmap
  const weeks = [];
  let currentWeek = [];
  // preencher os primeiros dias da semana vazios
  const firstDayOfWeek = startOfYear.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);
  
  heatmapData.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const getHeatmapColor = (minutes) => {
    if (minutes === 0) return 'rgba(255,255,255,0.05)';
    if (minutes < 30) return 'rgba(0, 230, 118, 0.3)';
    if (minutes < 60) return 'rgba(0, 230, 118, 0.6)';
    if (minutes < 120) return 'rgba(0, 230, 118, 0.8)';
    return 'rgba(0, 230, 118, 1)'; // super produtivo
  };

  // Ranking de Projetos (Tempo Investido)
  const projectTimeMap = {};
  logsThisYear.forEach(l => {
    if (!projectTimeMap[l.projectId]) projectTimeMap[l.projectId] = 0;
    projectTimeMap[l.projectId] += l.durationInMinutes;
  });
  const projectLeaderboard = Object.entries(projectTimeMap)
    .map(([id, mins]) => {
      const p = projects.find(proj => proj.id === id);
      return { id, name: p ? p.name : 'Projeto Desconhecido', minutes: mins };
    })
    .sort((a, b) => b.minutes - a.minutes);
  const maxProjectMins = projectLeaderboard.length > 0 ? projectLeaderboard[0].minutes : 1;

  // Metas Cumpridas
  const completedGoals = goals.filter(g => g.isCompleted || g.current >= g.target);

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="header glass-panel">
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <BarChart2 size={32} /> Estatísticas e Insights
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Visão global do seu desempenho em {currentYear}</p>
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px' }}>
              <Clock size={32} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', margin: '0' }}>{totalHoursThisYear}h</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '0.9rem' }}>Trabalhadas no ano</p>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '1rem', borderRadius: '12px' }}>
              <Flame size={32} color="gold" />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', margin: '0', color: "gold" }}>{maxStreak}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '0.9rem' }}>Dias de Constância (Recorde)</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '1rem', borderRadius: '12px' }}>
              <Trophy size={32} color="var(--success)" />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', margin: '0', color: 'var(--success)' }}>{Object.keys(logsByDate).length}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '0.9rem' }}>Dias Ativos no Total</p>
            </div>
          </div>
        </div>

        {/* Heatmap Anual */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Mapa de Constância ({currentYear})
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((day, dIdx) => (
                  <div 
                    key={dIdx} 
                    title={day ? `${day.date}: ${Math.floor(day.minutes/60)}h ${day.minutes%60}m` : ''}
                    style={{ 
                      width: '14px', height: '14px', borderRadius: '3px',
                      background: day ? getHeatmapColor(day.minutes) : 'transparent',
                      border: day && day.minutes === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      opacity: day ? 1 : 0
                    }} 
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Menos</span>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(0, 230, 118, 0.3)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(0, 230, 118, 0.6)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(0, 230, 118, 0.8)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(0, 230, 118, 1)' }} />
            <span>Mais</span>
          </div>
        </div>

        {/* Gráfico Mensal */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.3rem' }}>Horas por Mês</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingTop: '20px' }}>
            {monthlyData.map((minutes, idx) => {
              const heightPct = Math.max(5, (minutes / maxMonthlyMinutes) * 100);
              const hours = Math.floor(minutes / 60);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '100%', height: `${heightPct}%`, 
                    background: 'var(--accent-gradient)', 
                    borderRadius: '6px 6px 0 0',
                    position: 'relative',
                    minHeight: '4px'
                  }}>
                    {hours > 0 && <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.85rem', fontWeight: 'bold' }}>{hours}h</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{months[idx]}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Ranking de Projetos */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={24} color="var(--accent-primary)" /> Tempo por Projeto
            </h2>
            {projectLeaderboard.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum projeto trabalhado neste ano.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {projectLeaderboard.map((proj, idx) => {
                  const pct = Math.max(5, Math.round((proj.minutes / maxProjectMins) * 100));
                  const hours = Math.floor(proj.minutes / 60);
                  const mins = proj.minutes % 60;
                  return (
                    <div key={proj.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? 'var(--accent-primary)' : '#fff' }}>
                          {idx + 1}. {proj.name}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</span>
                      </div>
                      <div className="progress-bar" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: idx === 0 ? 'var(--accent-gradient)' : 'var(--glass-border)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mural de Metas Cumpridas */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} color="var(--success)" /> Mural de Metas Concluídas
            </h2>
            {completedGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                <CheckCircle size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '1rem' }} />
                <p>Nenhuma meta numérica concluída ainda.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {completedGoals.map(goal => {
                  const p = projects.find(proj => proj.id === goal.projectId);
                  return (
                    <div key={goal.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0, 230, 118, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid var(--success)' }}>
                      <Trophy size={20} color="var(--success)" />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{goal.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p ? p.name : 'Projeto Desconhecido'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
