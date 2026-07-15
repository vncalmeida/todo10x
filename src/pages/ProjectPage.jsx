import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { ArrowLeft, Target, Trophy, CheckCircle, Clock, Edit2, Save, Flag, Plus, Minus, Trash2, History } from 'lucide-react';
import { useState } from 'react';
import { StreakCalendar } from '../components/StreakCalendar';

export const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, victories, timeLogs, goals, updateProject, addGoal, toggleTaskComplete, deleteTask, editTask } = useTaskContext();
  const [isEditingTiers, setIsEditingTiers] = useState(false);
  const [tiers, setTiers] = useState({ ok: 10, good: 30, excellent: 60 });
  
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTasksText, setNewGoalTasksText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return <div style={{ padding: '2rem', color: '#fff' }}>Projeto não encontrado. <button onClick={() => navigate('/')}>Voltar</button></div>;
  }

  const projectGoals = goals.filter(g => g.projectId === id);

  const handleSaveTiers = () => {
    updateProject(id, { timeTiers: tiers });
    setIsEditingTiers(false);
  };

  const handleCreateGoal = () => {
    if (!newGoalTitle.trim() || !newGoalTasksText.trim()) return;
    const tasksArray = newGoalTasksText.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    if (tasksArray.length === 0) return;
    
    addGoal(id, newGoalTitle.trim(), 0, '', tasksArray);
    setIsCreatingGoal(false);
    setNewGoalTitle('');
    setNewGoalTasksText('');
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const handleSaveEdit = (taskId) => {
    if (editingTaskTitle.trim()) {
      editTask(taskId, editingTaskTitle.trim());
    }
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const currentTiers = project.timeTiers || { ok: 10, good: 30, excellent: 60 };

  // Combina tarefas concluídas e vitórias diárias
  const projectTasks = tasks.filter(t => t.projectId === id && t.completed).map(t => ({ ...t, type: 'task' }));
  const projectVictories = victories.filter(v => v.projectId === id).map(v => ({ ...v, type: 'victory' }));
  const projectTimeLogs = timeLogs.filter(l => l.projectId === id).map(l => ({ 
    ...l, 
    type: 'time', 
    title: `Sessão de Foco: ${l.durationInMinutes >= 60 ? Math.floor(l.durationInMinutes / 60) + 'h ' : ''}${l.durationInMinutes % 60 > 0 ? (l.durationInMinutes % 60) + 'm' : ''}`.trim()
  }));
  
  const allEvents = [...projectTasks, ...projectVictories, ...projectTimeLogs];
  
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
              <span style={{ fontSize: '0.8rem', color: "gold", textTransform: 'uppercase' }}>Excelente</span>
              {isEditingTiers ? (
                <input type="number" value={tiers.excellent} onChange={e => setTiers({...tiers, excellent: parseInt(e.target.value) || 0})} className="time-input" style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center' }} />
              ) : (
                <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', color: "gold" }}>{currentTiers.excellent}m</h4>
              )}
            </div>
          </div>
        </div>
      </div>

      {projectGoals.filter(g => !g.isCompleted).length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem' }}>
              <Flag size={24} color="var(--text-secondary)" /> Metas Ativas
            </h2>
            {!isCreatingGoal && (
               <button className="btn-small" onClick={() => setIsCreatingGoal(true)} style={{ background: 'var(--text-primary)', color: '#000' }}>
                 <Plus size={16} /> Nova Meta
               </button>
            )}
          </div>
          
          {isCreatingGoal && (
             <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--text-secondary)', marginBottom: '1.5rem' }}>
               <h3 style={{ margin: 0 }}>Criar Nova Meta</h3>
               <input 
                 type="text" 
                 placeholder="Nome da Meta (ex: Lançamento do Site)" 
                 value={newGoalTitle} 
                 onChange={(e) => setNewGoalTitle(e.target.value)} 
                 className="time-input" 
                 style={{ padding: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', textAlign: 'left', fontSize: '1rem' }} 
               />
               <textarea 
                 placeholder="Digite as tarefas dessa meta (uma por linha)&#10;Ex:&#10;Fazer design&#10;Aprovar textos&#10;Publicar site"
                 value={newGoalTasksText}
                 onChange={(e) => setNewGoalTasksText(e.target.value)}
                 style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', minHeight: '120px', resize: 'vertical' }}
               />
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                 <button className="btn-small" onClick={() => setIsCreatingGoal(false)}>Cancelar</button>
                 <button className="btn-small" onClick={handleCreateGoal} style={{ background: '#fff', color: '#000' }}>Criar Meta</button>
               </div>
             </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {projectGoals.filter(g => !g.isCompleted).map(goal => {
              const goalTasks = tasks.filter(t => t.goalId === goal.id);

              return (
                <div key={goal.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: '#D4AF37', color: '#000', padding: '0.8rem 1.5rem', fontWeight: '900', fontSize: '1.5rem', letterSpacing: '2px', lineHeight: '1' }}>
                      META
                    </div>
                    <div style={{ background: 'transparent', color: '#fff', padding: '0.8rem 1.5rem', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {goal.title}
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderTop: 'none', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {goalTasks.map(task => (
                      <div key={task.id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#0a0a0a', border: '1px solid #333' }}>
                        <button 
                          className="btn-icon" 
                          style={{ width: '28px', height: '28px', background: task.completed ? 'var(--success)' : 'transparent', border: task.completed ? 'none' : '2px solid var(--text-secondary)' }}
                          onClick={() => toggleTaskComplete(task.id)}
                        >
                          {task.completed && <CheckCircle size={18} color="#000" />}
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                          {editingTaskId === task.id ? (
                            <input 
                              type="text" 
                              value={editingTaskTitle} 
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                              autoFocus
                              style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '1rem', width: '100%' }}
                            />
                          ) : (
                            <span style={{ fontSize: '1rem', color: '#fff', textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1 }}>{task.title}</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {projectGoals.length === 0 && (
        <div style={{ marginBottom: '4rem', textAlign: 'center', padding: '2rem', background: 'var(--glass-bg)', borderRadius: '0', border: '1px dashed var(--glass-border)' }}>
          <Flag size={32} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nenhuma Meta Ativa</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Crie metas baseadas em tarefas para acompanhar o seu progresso.</p>
          
          {isCreatingGoal ? (
             <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--text-secondary)' }}>
               <h3 style={{ margin: 0 }}>Criar Nova Meta</h3>
               <input 
                 type="text" 
                 placeholder="Nome da Meta (ex: Lançamento do Site)" 
                 value={newGoalTitle} 
                 onChange={(e) => setNewGoalTitle(e.target.value)} 
                 className="time-input" 
                 style={{ padding: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', textAlign: 'left', fontSize: '1rem' }} 
               />
               <textarea 
                 placeholder="Digite as tarefas dessa meta (uma por linha)&#10;Ex:&#10;Fazer design&#10;Aprovar textos&#10;Publicar site"
                 value={newGoalTasksText}
                 onChange={(e) => setNewGoalTasksText(e.target.value)}
                 style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', minHeight: '120px', resize: 'vertical' }}
               />
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                 <button className="btn-small" onClick={() => setIsCreatingGoal(false)}>Cancelar</button>
                 <button className="btn-small" onClick={handleCreateGoal} style={{ background: '#fff', color: '#000' }}>Criar Meta</button>
               </div>
             </div>
          ) : (
            <button className="btn-small" onClick={() => setIsCreatingGoal(true)} style={{ background: 'var(--text-primary)', color: '#000', margin: '0 auto' }}>
              <Plus size={16} /> Nova Meta
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <StreakCalendar projectId={id} />
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
                    <div key={item.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', borderLeft: item.type === 'victory' ? '3px solid gold' : item.type === 'time' ? '3px solid var(--accent-primary)' : '3px solid var(--success)' }}>
                      {item.type === 'victory' ? <Trophy size={22} color="gold" style={{ flexShrink: 0 }} /> : item.type === 'time' ? <History size={22} color="var(--accent-primary)" style={{ flexShrink: 0 }} /> : <CheckCircle size={22} color="var(--success)" style={{ flexShrink: 0 }} />}
                      <div>
                        <span style={{ fontSize: '1rem', color: '#fff' }}>{item.title}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                           {item.type === 'victory' && <span style={{ fontSize: '0.75rem', color: "gold", textTransform: 'uppercase', letterSpacing: '1px' }}>Vitória</span>}
                           {item.type === 'time' && <span style={{ fontSize: '0.75rem', color: "var(--accent-primary)", textTransform: 'uppercase', letterSpacing: '1px' }}>Tempo Registrado</span>}
                        </div>
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
