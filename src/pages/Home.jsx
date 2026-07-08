import { useState } from 'react';
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
  const { projects, tasks, toggleTaskComplete } = useTaskContext();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-container animate-fade-in">
      {isCreatingProject && <NewProjectModal onClose={() => setIsCreatingProject(false)} />}
      
      <header className="header glass-panel">
        <div className="logo">
          <BrainCircuit className="logo-icon" size={32} color="var(--accent-primary)" />
          <h1 className="text-gradient">AI Engagement</h1>
        </div>
        <div className="header-stats" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-small" onClick={() => navigate('/history')}>
            <History size={16} /> Diário Global
          </button>
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
                {projects.map(project => (
                  <div key={project.id} className="project-card glass-panel clickable" onClick={() => navigate(`/project/${project.id}`)}>
                    <h3 style={{ marginBottom: project.description ? '0.5rem' : '1rem' }}>{project.name}</h3>
                    {project.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                    )}
                    <div className="progress-bar" style={{ marginTop: 'auto' }}>
                      <div className="progress-fill" style={{ width: `${project.progress}%`, background: project.progress === 100 ? 'var(--success)' : 'var(--accent-gradient)' }}></div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)' }}>Nenhum projeto ativo. Crie um para começar!</p>
                )}
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <StreakCalendar />
                <MoodTracker />
              </div>
              <HoursChart />
            </div>

            <section className="tasks-section" style={{ paddingBottom: '5rem' }}>
              <h2>Próximos Passos (Sugestões Aprovadas)</h2>
              <div className="task-list" style={{ marginTop: '1rem' }}>
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
                            {project && <span className="task-project-badge">{project.name}</span>}
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
            </section>

          </div>
          
          <div className="right-column">
            <Pomodoro />
          </div>
        </div>
      </main>

      <ChatPanel />
    </div>
  );
};
