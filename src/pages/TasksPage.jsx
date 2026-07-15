import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Circle, Plus, Sparkles, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TasksPage = () => {
  const { 
    projects, tasks, goals, suggestions, 
    toggleTaskComplete, addTask, 
    acceptSuggestion, rejectSuggestion, clearSuggestions 
  } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const navigate = useNavigate();
  
  const pendingTasks = tasks.filter(t => !t.completed);
  
  const looseTasks = pendingTasks.filter(t => !t.goalId);
  const tasksByGoal = pendingTasks.reduce((acc, t) => {
    if (t.goalId) {
      if (!acc[t.goalId]) acc[t.goalId] = [];
      acc[t.goalId].push(t);
    }
    return acc;
  }, {});

  const handleAddManualTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      addTask(null, newTaskTitle.trim(), new Date().toISOString().split('T')[0]);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="header glass-panel" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient">Gestão de Tarefas</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>O seu centro de pendências e metas focadas.</p>
        </div>
      </header>

      {/* AI Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--text-secondary)" /> Sugestões da IA
            </h2>
            <button onClick={clearSuggestions} className="btn-small" style={{ fontSize: '0.8rem' }}>
              Limpar Todas
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {suggestions.map(sug => {
              const proj = projects.find(p => p.id === sug.projectId);
              const goal = sug.goalId ? goals.find(g => g.id === sug.goalId) : null;
              return (
                <div key={sug.id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '3px solid var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                    <span style={{ fontSize: '1rem', color: '#fff' }}>{sug.title}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                      {proj ? (
                        <span style={{ border: '1px solid var(--glass-border)', padding: '0.1rem 0.5rem', color: '#fff' }}>{proj.name}</span>
                      ) : (
                        <span style={{ border: '1px solid var(--glass-border)', padding: '0.1rem 0.5rem', color: '#fff' }}>Geral</span>
                      )}
                      {goal && <span style={{ border: '1px solid #D4AF37', padding: '0.1rem 0.5rem', color: '#D4AF37' }}>🎯 {goal.title}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" onClick={() => acceptSuggestion(sug.id)} style={{ background: '#fff', color: '#000' }}>
                      <CheckCircle size={18} />
                    </button>
                    <button className="btn-icon" onClick={() => rejectSuggestion(sug.id)}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Loose Tasks */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Tarefas Avulsas</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {looseTasks.length === 0 ? (
             <p style={{ color: 'var(--text-secondary)' }}>Nenhuma tarefa avulsa pendente.</p>
          ) : (
            looseTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <div key={task.id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                    <Circle size={22} color="var(--text-secondary)" />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                    <span style={{ fontSize: '1rem', color: '#fff' }}>{task.title}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                      {project ? (
                        <span style={{ border: '1px solid var(--glass-border)', padding: '0.1rem 0.5rem', color: '#fff' }}>{project.name}</span>
                      ) : (
                        <span style={{ border: '1px solid var(--glass-border)', padding: '0.1rem 0.5rem', color: '#fff' }}>Geral</span>
                      )}
                      <span style={{ border: '1px solid var(--glass-border)', padding: '0.1rem 0.5rem', color: 'var(--text-secondary)' }}>{task.date}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddManualTask}
          placeholder="Adicionar tarefa avulsa + Enter..." 
          className="time-input"
          style={{ width: '100%', padding: '0.8rem 1rem', background: 'transparent', border: '1px solid var(--glass-border)', textAlign: 'left' }}
        />
      </section>

      {/* Grouped by Goals */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {Object.entries(tasksByGoal).map(([goalId, goalTasks]) => {
          const goal = goals.find(g => g.id === goalId);
          if (!goal) return null;
          
          const project = projects.find(p => p.id === goal.projectId);
          
          return (
            <div key={goalId}>
              {/* META HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0', background: 'transparent' }}>
                <div style={{ background: '#D4AF37', color: '#000', padding: '0.8rem 1.5rem', fontWeight: '900', fontSize: '2rem', letterSpacing: '2px', lineHeight: '1' }}>
                  META
                </div>
                <div style={{ background: 'transparent', color: '#fff', padding: '0.8rem 1.5rem', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {project ? `PROJETO ${project.name.toUpperCase()}` : 'META'}
                </div>
              </div>
              
              {/* TASKS CONTAINER */}
              <div style={{ border: '1px solid var(--glass-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'var(--bg-secondary)' }}>
                {goalTasks.map(task => (
                  <div key={task.id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#0a0a0a', border: '1px solid #333' }}>
                    <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                      <Circle size={22} color="var(--text-secondary)" />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                      <span style={{ fontSize: '1rem', color: '#fff' }}>{task.title}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ border: '1px solid #333', padding: '0.1rem 0.5rem', color: '#fff' }}>{project ? project.name : 'Geral'}</span>
                        <span style={{ border: '1px solid #333', padding: '0.1rem 0.5rem', color: 'var(--text-secondary)' }}>{task.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
