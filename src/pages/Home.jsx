import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { BrainCircuit, Plus, Circle, History } from 'lucide-react';
import { StreakCalendar } from '../components/StreakCalendar';
import { HoursChart } from '../components/HoursChart';
import { MoodTracker } from '../components/MoodTracker';
import { ChatPanel } from '../components/ChatPanel';
import { Pomodoro } from '../components/Pomodoro';
import { NewProjectModal } from '../components/NewProjectModal';

export const Home = () => {
  const { projects, tasks, toggleTaskComplete, quotes, clearPendingTasks, addTask } = useTaskContext();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const navigate = useNavigate();

  const handleAddManualTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      addTask(null, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  useEffect(() => {
    if (quotes.length > 0) {
      setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)].text);
    }
  }, [quotes]);

  const activeProjects = projects.filter(p => p.status !== 'archived');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className="app-container animate-fade-in">
      {isCreatingProject && <NewProjectModal onClose={() => setIsCreatingProject(false)} />}
      
      <header className="header glass-panel">
        <div>
          <h1 className="text-gradient">Resumo de Hoje</h1>
          {dailyQuote && <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '0.3rem', fontSize: '0.95rem' }}>"{dailyQuote}"</p>}
        </div>
        <div className="header-stats" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </header>

      <main className="main-content">
        <div className="layout-grid">
          <div className="left-column">
            
            <section className="projects-section" style={{ marginBottom: '2.5rem' }}>
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2>Projetos & Metas</h2>
                  <button className="btn-small" onClick={() => setIsCreatingProject(true)}>
                    <Plus size={14} /> Novo
                  </button>
                </div>
              </div>
              
              <div className="projects-grid">
                {activeProjects.map(project => (
                  <div key={project.id} className="project-card glass-panel clickable" onClick={() => navigate(`/project/${project.id}`)} style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: project.description ? '0.5rem' : '0' }}>{project.name}</h3>
                    {project.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: 'auto', textTransform: 'uppercase', fontWeight: 'bold' }}>Acessar Projeto ➔</span>
                  </div>
                ))}
                {activeProjects.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)' }}>Nenhum projeto ativo. Peça para a IA criar um!</p>
                )}
              </div>

              {archivedProjects.length > 0 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button className="btn-small" style={{ margin: '0 auto', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }} onClick={() => setShowArchived(!showArchived)}>
                    {showArchived ? 'Ocultar Arquivados' : `Ver Arquivados (${archivedProjects.length})`}
                  </button>
                </div>
              )}

              {showArchived && (
                <div className="projects-grid" style={{ marginTop: '1rem', opacity: 0.6 }}>
                  {archivedProjects.map(project => (
                    <div key={project.id} className="project-card glass-panel clickable" onClick={() => navigate(`/project/${project.id}`)} style={{ display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ marginBottom: '0' }}>{project.name} <span style={{ fontSize: '0.7rem', border: '1px solid var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>ARQUIVADO</span></h3>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="clickable-chart" onClick={() => navigate('/stats')} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} title="Ver estatísticas do ano">
                  <StreakCalendar />
                </div>
                <MoodTracker />
              </div>
              <div className="clickable-chart" onClick={() => navigate('/stats')} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} title="Ver estatísticas do ano">
                <HoursChart />
              </div>
            </div>

            <section className="tasks-section" style={{ paddingBottom: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Próximos Passos</h2>
                <button onClick={clearPendingTasks} className="btn-small" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>Limpar</button>
              </div>
              <div className="task-list">
                {tasks.filter(t => !t.completed).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '12px' }}>
                    Nenhuma pendência! Peça ideias para a IA no chat flutuante.
                  </p>
                ) : (
                  tasks.filter(t => !t.completed).map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="task-item glass-panel">
                        <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                          <Circle size={24} color="var(--text-secondary)" />
                        </button>
                        <div className="task-content">
                          <span className="task-title">{task.title}</span>
                          <div className="task-meta">
                            {project ? <span className="task-project-badge">{project.name}</span> : <span className="task-project-badge" style={{background: 'rgba(255,255,255,0.1)', color: '#fff'}}>Geral</span>}
                            <span className="task-date-badge" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
                              {task.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleAddManualTask}
                  placeholder="Adicionar tarefa avulsa + Enter..." 
                  className="time-input"
                  style={{ width: '100%', padding: '0.8rem 1rem' }}
                />
              </div>
            </section>

          </div>
          
          <div className="right-column">
            <Pomodoro />
          </div>
        </div>
      </main>
    </div>
  );
};
