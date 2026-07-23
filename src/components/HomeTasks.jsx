import { useState, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Circle, Edit2, Trash2, Save, Wand2, CheckCircle } from 'lucide-react';
import { getLocalYMD } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export const HomeTasks = () => {
  const { projects, tasks, goals, toggleTaskComplete, deleteTask, editTask, breakDownTask, addTask } = useTaskContext();
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskProjectId, setEditingTaskProjectId] = useState('');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [mentionQuery, setMentionQuery] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskProjectId(task.projectId || '');
  };

  const handleSaveEdit = (taskId) => {
    if (editingTaskTitle.trim()) {
      editTask(taskId, { 
        title: editingTaskTitle.trim(),
        projectId: editingTaskProjectId === '' ? null : editingTaskProjectId 
      });
    }
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setEditingTaskProjectId('');
  };

  const handleAddManualTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      let finalTitle = newTaskTitle.trim();
      let assignedProjectId = null;
      
      const activeProjects = projects.filter(p => p.status !== 'archived');
      for (const p of activeProjects) {
        const mention = `@${p.name.toLowerCase()}`;
        if (finalTitle.toLowerCase().includes(mention)) {
          assignedProjectId = p.id;
          const regex = new RegExp(`@${p.name}`, 'i');
          finalTitle = finalTitle.replace(regex, '').trim();
          break;
        }
      }

      addTask(assignedProjectId, finalTitle, getLocalYMD());
      setNewTaskTitle('');
      setMentionQuery(null);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewTaskTitle(val);
    
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);
    
    if (match) {
      setMentionQuery(match[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (project) => {
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = newTaskTitle.slice(0, cursorPosition);
    const textAfterCursor = newTaskTitle.slice(cursorPosition);
    
    const newTextBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_-]*)$/, `@${project.name} `);
    setNewTaskTitle(newTextBefore + textAfterCursor);
    setMentionQuery(null);
    inputRef.current.focus();
  };
  
  const filteredProjects = mentionQuery !== null 
    ? projects.filter(p => p.status !== 'archived' && p.name.toLowerCase().includes(mentionQuery))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      
      <div className="new-task-container" style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <input 
          ref={inputRef}
          type="text" 
          value={newTaskTitle}
          onChange={handleInputChange}
          onKeyDown={handleAddManualTask}
          placeholder="Escreva a tarefa... digite @ para escolher o projeto" 
          className="time-input"
          style={{ width: '100%', padding: '1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', textAlign: 'left', borderRadius: '12px', color: 'white', fontSize: '1.1rem' }}
        />
        {mentionQuery !== null && filteredProjects.length > 0 && (
          <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '0.5rem', zIndex: 10, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0 0.5rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Projetos Sugeridos</p>
            {filteredProjects.map(p => (
              <button 
                key={p.id} 
                onClick={() => handleSelectMention(p)}
                style={{ textAlign: 'left', padding: '0.8rem', background: 'transparent', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.color || '#fff' }} />
                <span style={{ fontWeight: '500' }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {pendingTasks.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>Nenhuma tarefa pendente! Você está livre.</p>
      ) : (
        pendingTasks.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          const goal = task.goalId ? goals?.find(g => g.id === task.goalId) : null;
          return (
            <div key={task.id} className="glass-panel task-hover" style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0, borderLeft: `3px solid ${project?.color || '#ffffff'}` }}>
              <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                <Circle size={22} color="var(--text-secondary)" />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                {editingTaskId === task.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <input 
                      type="text" 
                      value={editingTaskTitle} 
                      onChange={(e) => setEditingTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                      autoFocus
                      style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '1rem', flex: 1 }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: '1rem', color: '#fff' }}>{task.title}</span>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                  {project ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.75rem' }}>
                        {project.name} {goal ? `- ${goal.title}` : ''}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Geral</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-icon" onClick={() => breakDownTask(task)} title="Transformar em Meta e quebrar em passos" style={{ color: '#fbbf24' }}>
                  <Wand2 size={18} />
                </button>
                {editingTaskId === task.id ? (
                  <button className="btn-icon" onClick={() => handleSaveEdit(task.id)} style={{ color: 'var(--success)' }}>
                    <Save size={18} />
                  </button>
                ) : (
                  <button className="btn-icon" onClick={() => handleStartEdit(task)}>
                    <Edit2 size={18} />
                  </button>
                )}
                <button className="btn-icon" onClick={() => deleteTask(task.id)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })
      )}

      {completedTasks.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <CheckCircle size={16} /> Concluídas Recentemente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {completedTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <div key={task.id} className="glass-panel" style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.6, borderLeft: `3px solid ${project?.color || '#ffffff'}` }}>
                  <button className="checkbox" onClick={() => toggleTaskComplete(task.id)}>
                    <CheckCircle size={20} color="var(--success)" />
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#fff', textDecoration: 'line-through' }}>{task.title}</span>
                </div>
              );
            })}
          </div>
          <button className="btn-small" onClick={() => navigate('/tasks')} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', margin: '1.5rem auto 0 auto', display: 'block', padding: '0.6rem 1.5rem' }}>
            Ver todas as tarefas completas
          </button>
        </div>
      )}

    </div>
  );
};
