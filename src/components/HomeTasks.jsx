import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Circle, Edit2, Trash2, Save, Wand2 } from 'lucide-react';
import { getLocalYMD } from '../utils/dateUtils';

export const HomeTasks = () => {
  const { projects, tasks, goals, toggleTaskComplete, deleteTask, editTask, breakDownTask, addTask } = useTaskContext();
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskProjectId, setEditingTaskProjectId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const pendingTasks = tasks.filter(t => !t.completed);

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
      addTask(null, newTaskTitle.trim(), getLocalYMD());
      setNewTaskTitle('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {pendingTasks.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>Nenhuma tarefa pendente! Você está livre.</p>
      ) : (
        pendingTasks.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          const goal = task.goalId ? goals?.find(g => g.id === task.goalId) : null;
          return (
            <div key={task.id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
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
                      <div style={{ position: 'relative', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: project.color || 'var(--accent-primary)', opacity: 0.15 }} />
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: project.color || 'var(--accent-primary)', position: 'relative', zIndex: 1 }} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
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
      
      <div className="new-task-container" style={{ marginTop: '1rem' }}>
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddManualTask}
          placeholder="Adicionar tarefa avulsa + Enter..." 
          className="time-input"
          style={{ flex: 1, padding: '0.8rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', textAlign: 'left', borderRadius: '8px', color: 'white' }}
        />
      </div>
    </div>
  );
};
