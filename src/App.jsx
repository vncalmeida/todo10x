import { useState } from 'react';
import { CheckCircle2, Circle, Clock, BrainCircuit, Plus, RotateCcw } from 'lucide-react';
import { useTaskContext } from './context/TaskContext';
import { Pomodoro } from './components/Pomodoro';
import { ProjectModal } from './components/ProjectModal';
import { NewProjectModal } from './components/NewProjectModal';
import './App.css';

function App() {
  const { projects, tasks, toggleTaskComplete, handleAIInput, isLoaded } = useTaskContext();
  const [aiText, setAiText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeTab, setActiveTab] = useState('hoje');

  const onProcessAI = async () => {
    if (!aiText.trim()) return;
    setIsProcessing(true);
    await handleAIInput(aiText);
    setAiText('');
    setIsProcessing(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date(); tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'hoje') return task.date === todayStr && !task.completed;
    if (activeTab === 'amanhã') return task.date === tomorrowStr && !task.completed;
    if (activeTab === 'historico') return false; // Handled separately
    return !task.completed; // 'todos' mostra apenas as ativas
  });

  if (!isLoaded) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BrainCircuit size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
          <h2 className="text-gradient">Sincronizando com a Nuvem...</h2>
        </div>
      </div>
    );
  }

  // Render Histórico Global
  const renderHistory = () => {
    const completed = tasks.filter(t => t.completed);
    const grouped = completed.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    }, {});
    
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
      return <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>Nenhuma tarefa concluída ainda.</p>;
    }

    return sortedDates.map(date => {
      let dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      if (date === todayStr) dateLabel = "Hoje";
      
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (date === yesterday.toISOString().split('T')[0]) dateLabel = "Ontem";
      
      dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

      return (
        <div key={date} style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>
            {dateLabel}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {grouped[date].map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <div key={task.id} className="task-item glass-panel" style={{ opacity: 0.7 }}>
                  <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                    <RotateCcw size={18} color="var(--text-secondary)" title="Restaurar Tarefa" />
                  </button>
                  <div className="task-content" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                    <span className="task-title">{task.title}</span>
                    <div className="task-meta">
                      {project && <span className="task-project-badge">{project.name}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="app-container">
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {isCreatingProject && <NewProjectModal onClose={() => setIsCreatingProject(false)} />}
      
      <header className="header glass-panel animate-fade-in">
        <div className="logo">
          <BrainCircuit className="logo-icon" size={32} />
          <h1 className="text-gradient">AI Task Manager</h1>
        </div>
        <div className="header-stats">
          <span>Hoje, {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </header>

      <main className="main-content">
        <div className="layout-grid">
          <div className="left-column">
            {/* Project Cards Section */}
            <section className="projects-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2>Projetos Ativos</h2>
                  <button className="btn-small" onClick={() => setIsCreatingProject(true)}>
                    <Plus size={14} /> Novo
                  </button>
                </div>
              </div>
              <div className="projects-grid">
                {projects.map(project => (
                  <div key={project.id} className="project-card glass-panel clickable" onClick={() => setSelectedProject(project)}>
                    <h3 style={{ marginBottom: project.description ? '0' : '0.5rem' }}>{project.name}</h3>
                    {project.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                    )}
                    <div className="progress-bar" style={{ marginTop: 'auto' }}>
                      <div className="progress-fill" style={{ width: `${project.progress}%`, background: project.progress === 100 ? 'var(--success)' : 'var(--accent-gradient)' }}></div>
                    </div>
                    <span className="progress-text" style={{ color: project.progress === 100 ? 'var(--success)' : 'var(--text-secondary)' }}>{project.progress}%</span>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Input Section */}
            <section className="ai-input-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="ai-prompt-container glass-panel">
                <label>O que você fez ou vai fazer?</label>
                <textarea 
                  placeholder="Ex: Ligar para o cliente amanhã para o projeto 1. Ah, hoje cedo concluí a tarefa X!"
                  rows={4}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onProcessAI();
                    }
                  }}
                />
                <button className="ai-submit-btn" onClick={onProcessAI} disabled={isProcessing}>
                  {isProcessing ? <Clock className="spin" size={18} /> : <BrainCircuit size={18} />}
                  {isProcessing ? 'Processando...' : 'Processar com DeepSeek'}
                </button>
              </div>
            </section>

            {/* Tasks Section */}
            <section className="tasks-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="tasks-header-row">
                <h2>Tarefas</h2>
                <div className="tabs">
                  <button className={`tab-btn ${activeTab === 'hoje' ? 'active' : ''}`} onClick={() => setActiveTab('hoje')}>Hoje</button>
                  <button className={`tab-btn ${activeTab === 'amanhã' ? 'active' : ''}`} onClick={() => setActiveTab('amanhã')}>Amanhã</button>
                  <button className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`} onClick={() => setActiveTab('todos')}>Todas Pendentes</button>
                  <button className={`tab-btn ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')} style={{ color: 'var(--accent-primary)' }}>Histórico</button>
                </div>
              </div>
              
              <div className="task-list">
                {activeTab === 'historico' ? (
                  renderHistory()
                ) : filteredTasks.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>Nenhuma tarefa pendente nesta aba.</p>
                ) : (
                  filteredTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="task-item glass-panel" style={{ opacity: task.completed ? 0.6 : 1, transition: 'all 0.3s' }}>
                        <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                          <Circle size={24} color="var(--text-secondary)" />
                        </button>
                        <div className="task-content">
                          <span className="task-title">{task.title}</span>
                          <div className="task-meta">
                            {project && <span className="task-project-badge">{project.name}</span>}
                            {activeTab === 'todos' && <span className="task-date-badge">{task.date}</span>}
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
    </div>
  );
}

export default App;
