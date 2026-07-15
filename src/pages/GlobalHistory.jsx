import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { ArrowLeft, History, Trophy, CheckCircle } from 'lucide-react';

export const GlobalHistory = () => {
  const navigate = useNavigate();
  const { projects, tasks, victories } = useTaskContext();
  
  const allTasks = tasks.filter(t => t.completed).map(t => ({ ...t, type: 'task' }));
  const allVictories = victories.map(v => ({ ...v, type: 'victory' }));
  
  const allEvents = [...allTasks, ...allVictories];
  
  const grouped = allEvents.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <button className="btn-small" onClick={() => navigate('/')} style={{ marginBottom: '2rem', background: 'var(--glass-bg)' }}>
        <ArrowLeft size={16} /> Voltar ao Início
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <History size={36} color="var(--accent-primary)" /> Diário Global
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Histórico completo de tudo que você realizou em todos os projetos.</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum registro encontrado ainda no sistema.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sortedDates.map(date => {
            let dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }}></div>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', textTransform: 'capitalize', fontWeight: 'bold' }}>{dateLabel}</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }}></div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {grouped[date].map(item => {
                    const proj = projects.find(p => p.id === item.projectId);
                    return (
                      <div key={item.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', borderLeft: item.type === 'victory' ? '3px solid gold' : '3px solid var(--success)' }}>
                        {item.type === 'victory' ? <Trophy size={22} color="gold" style={{ flexShrink: 0 }} /> : <CheckCircle size={22} color="var(--success)" style={{ flexShrink: 0 }} />}
                        <div>
                          <span style={{ fontSize: '1rem', color: '#fff' }}>{item.title}</span>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                             {proj && <span className="task-project-badge">{proj.name}</span>}
                             {item.type === 'victory' && <span style={{ fontSize: '0.75rem', color: "gold", textTransform: 'uppercase', letterSpacing: '1px' }}>Vitória</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
