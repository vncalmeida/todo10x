import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { ArrowLeft, Target, Trophy, CheckCircle } from 'lucide-react';

export const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, victories } = useTaskContext();
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return <div style={{ padding: '2rem', color: '#fff' }}>Projeto não encontrado. <button onClick={() => navigate('/')}>Voltar</button></div>;
  }

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

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <button className="btn-small" onClick={() => navigate('/')} style={{ marginBottom: '2rem', background: 'var(--glass-bg)' }}>
        <ArrowLeft size={16} /> Voltar ao Início
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(145deg, rgba(30,30,40,0.8), rgba(15,15,20,0.9))' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{project.name}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Target size={24} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Meta Principal</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>{project.description || "Você ainda não definiu a grande meta deste projeto."}</p>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: '2.5rem', height: '8px', background: 'rgba(0,0,0,0.3)' }}>
          <div className="progress-fill" style={{ width: `${project.progress}%`, background: project.progress === 100 ? 'var(--success)' : 'var(--accent-gradient)' }}></div>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.8rem', textAlign: 'right' }}>Progresso de Tarefas: {project.progress}%</span>
      </div>

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
