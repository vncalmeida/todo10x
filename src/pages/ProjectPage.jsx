import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { ArrowLeft, Target, Trophy, CheckCircle, Clock, Edit2, Save, Flag } from 'lucide-react';
import { useState } from 'react';

export const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, victories, timeLogs, goals, updateProject } = useTaskContext();
  const [isEditingTiers, setIsEditingTiers] = useState(false);
  const [tiers, setTiers] = useState({ ok: 10, good: 30, excellent: 60 });
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return <div style={{ padding: '2rem', color: '#fff' }}>Projeto não encontrado. <button onClick={() => navigate('/')}>Voltar</button></div>;
  }

  const projectGoals = goals.filter(g => g.projectId === id);

  const handleSaveTiers = () => {
    updateProject(id, { timeTiers: tiers });
    setIsEditingTiers(false);
  };

  const currentTiers = project.timeTiers || { ok: 10, good: 30, excellent: 60 };

  // Combina tarefas concluídas e vitórias diárias
  const projectTasks = tasks.filter(t => t.projectId === id && t.completed).map(t => ({ ...t, type: 'task' }));
  const projectVictories = victories.filter(v => v.projectId === id).map(v => ({ ...v, type: 'victory' }));
  
  const allEvents = [...projectTasks, ...projectVictories];
  
  const grouped = allEvents.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const projectLogs = timeLogs.filter(log => log.projectId === id);
  const totalMinutes = projectLogs.reduce((acc, log) => acc + log.durationInMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const timeString = totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`;

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <button className="btn-small" onClick={() => navigate('/')} style={{ marginBottom: '2rem', background: 'var(--glass-bg)' }}>
        <ArrowLeft size={16} /> Voltar ao Início
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(145deg, rgba(30,30,40,0.8), rgba(15,15,20,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>{project.name}</h1>
          <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Tempo Total</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: 0 }}>{timeString}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '2rem' }}>
          <Target size={24} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Meta Principal</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>{project.description || "Você ainda não definiu a grande meta deste projeto."}</p>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><Clock size={20} color="var(--accent-primary)" /> Níveis de Tempo (Confetes)</h3>
            {!isEditingTiers ? (
              <button onClick={() => { setTiers(currentTiers); setIsEditingTiers(true); }} className="btn-icon" style={{ width: '32px', height: '32px' }}><Edit2 size={16} /></button>
            ) : (
              <button onClick={handleSaveTiers} className="btn-icon" style={{ background: 'var(--accent-gradient)', width: '32px', height: '32px' }}><Save size={16} /></button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>OK</span>
              {isEditingTiers ? (
                <input type="number" value={tiers.ok} onChange={e => setTiers({...tiers, ok: parseInt(e.target.value) || 0})} className="time-input" style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }} />
              ) : (
                <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem' }}>{currentTiers.ok}m</h4>
              )}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Bom</span>
              {isEditingTiers ? (
                <input type="number" value={tiers.good} onChange={e => setTiers({...tiers, good: parseInt(e.target.value) || 0})} className="time-input" style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }} />
              ) : (
                <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{currentTiers.good}m</h4>
              )}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: 'gold', textTransform: 'uppercase' }}>Excelente</span>
              {isEditingTiers ? (
                <input type="number" value={tiers.excellent} onChange={e => setTiers({...tiers, excellent: parseInt(e.target.value) || 0})} className="time-input" style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }} />
              ) : (
                <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', color: 'gold' }}>{currentTiers.excellent}m</h4>
              )}
            </div>
          </div>
        </div>
      </div>

      {projectGoals.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem' }}>
            <Flag size={24} color="var(--accent-primary)" /> Metas Numéricas
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {projectGoals.map(goal => {
              const progressPct = Math.min(100, Math.round((goal.current / goal.target) * 100)) || 0;
              return (
                <div key={goal.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: goal.isCompleted ? '4px solid var(--success)' : '4px solid var(--accent-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: goal.isCompleted ? 'var(--success)' : '#fff' }}>{goal.title}</h3>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{goal.current} / {goal.target}</span>
                  </div>
                  {goal.deadline && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <div className="progress-bar" style={{ height: '12px', background: 'rgba(0,0,0,0.3)' }}>
                    <div className="progress-fill" style={{ width: `${progressPct}%`, background: goal.isCompleted ? 'var(--success)' : 'var(--accent-gradient)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem' }}>
        <Trophy size={24} color="gold" /> Linha do Tempo (Timeline)
      </h2>

      {sortedDates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Trophy size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '1rem' }} />
          <p>Nenhum registro encontrado.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Volte ao início, ligue o foco e reporte sua primeira vitória!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sortedDates.map(date => {
            let dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
            return (
              <div key={date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }}></div>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', textTransform: 'capitalize', fontWeight: 'bold' }}>{dateLabel}</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }}></div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {grouped[date].map(item => (
                    <div key={item.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', transition: 'transform 0.2s', borderLeft: item.type === 'victory' ? '3px solid gold' : '3px solid var(--success)' }}>
                      {item.type === 'victory' ? (
                        <Trophy size={22} color="gold" style={{ flexShrink: 0 }} />
                      ) : (
                        <CheckCircle size={22} color="var(--success)" style={{ flexShrink: 0 }} />
                      )}
                      <div>
                        <span style={{ fontSize: '1rem', color: '#fff', lineHeight: '1.4' }}>{item.title}</span>
                        {item.type === 'victory' && <span style={{ display: 'block', fontSize: '0.75rem', color: 'gold', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Relato de Vitória</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
