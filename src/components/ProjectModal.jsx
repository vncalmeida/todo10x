import { useState } from 'react';
import { getLocalYMD } from '../utils/dateUtils';
import { X, Calendar, Edit2, Check, Save } from 'lucide-react';
import { useTaskContext, PROJECT_COLORS } from '../context/TaskContext';

export const ProjectModal = ({ project, onClose }) => {
  const { tasks, timeLogs, updateProject } = useTaskContext();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(project?.dailyGoal || 30);

  const [isEditingDetails, setIsEditingDetails] = useState(true);
  const [editName, setEditName] = useState(project?.name || '');
  const [editDesc, setEditDesc] = useState(project?.description || '');
  const [editColor, setEditColor] = useState(project?.color || PROJECT_COLORS[0]);

  if (!project) return null;

  // Calculos de tempo
  const projectLogs = timeLogs.filter(log => log.projectId === project.id);
  const totalMinutesWorked = projectLogs.reduce((acc, log) => acc + log.durationInMinutes, 0);
  const totalHours = Math.floor(totalMinutesWorked / 60);
  const remainingMinutes = totalMinutesWorked % 60;
  
  const todayStr = getLocalYMD();
  const todayLogs = projectLogs.filter(log => log.date === todayStr);
  const timeWorkedToday = todayLogs.reduce((acc, log) => acc + log.durationInMinutes, 0);

  const handleSaveGoal = () => {
    updateProject(project.id, { dailyGoal: tempGoal });
    setIsEditingGoal(false);
  };

  const handleSaveDetails = () => {
    updateProject(project.id, { name: editName, description: editDesc, color: editColor });
    onClose();
  };

  // Filtro de tarefas
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  
  // Resumo da Semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyCompletedTasks = projectTasks.filter(t => t.completed && new Date(t.date) >= oneWeekAgo);

  // Agrupa tarefas do histórico por data
  const grouped = projectTasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        
        {isEditingDetails ? (
          <div className="modal-header-edit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Editar Projeto</h2>
              <button onClick={onClose} className="btn-icon">
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="time-input"
                style={{ width: '80%', fontSize: '1.25rem', textAlign: 'left', fontWeight: 'bold' }}
              />
              <button onClick={handleSaveDetails} className="btn-icon" style={{ background: 'var(--accent-gradient)' }}>
                <Save size={20} />
              </button>
            </div>
            <textarea 
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="time-input"
              style={{ width: '100%', textAlign: 'left', minHeight: '60px', resize: 'none' }}
              placeholder="Adicionar descrição ao projeto..."
            />
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cor do Projeto</label>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: editColor === color ? '3px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: editColor === color ? `0 0 10px ${color}` : 'none'
                    }}
                    title="Selecionar cor"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-header-view" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2>{project.name}</h2>
                <button onClick={() => setIsEditingDetails(true)} className="btn-icon" style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}>
                  <Edit2 size={16} />
                </button>
              </div>
              <button onClick={onClose} className="btn-icon">
                <X size={24} />
              </button>
            </div>
            {project.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {project.description}
              </p>
            )}
          </div>
        )}
        
        <div className="modal-stats" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="stat-item">
            <span>Progresso</span>
            <strong className="text-gradient">{project.progress}%</strong>
          </div>
          <div className="stat-item">
            <span>Tempo Total</span>
            <strong>{totalHours}h {remainingMinutes}m</strong>
          </div>
          <div className="stat-item">
            <span>Meta Diária</span>
            {isEditingGoal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={tempGoal} 
                  onChange={(e) => setTempGoal(e.target.value)} 
                  className="time-input" 
                  style={{ width: '60px' }}
                />
                <button onClick={handleSaveGoal} className="btn-icon" style={{ width: '32px', height: '32px' }}><Check size={16}/></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{project.dailyGoal}m</strong>
                <button onClick={() => setIsEditingGoal(true)} className="btn-icon" style={{ width: '24px', height: '24px', border: 'none', background: 'transparent' }}>
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <span style={{ fontSize: '0.75rem', marginTop: '4px', color: timeWorkedToday >= project.dailyGoal ? 'var(--success)' : 'var(--text-secondary)' }}>
              Hoje: {timeWorkedToday}m
            </span>
          </div>
        </div>

        {weeklyCompletedTasks.length > 0 && (
          <div className="weekly-summary" style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Resumo da Semana</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Você concluiu <strong>{weeklyCompletedTasks.length}</strong> tarefas neste projeto nos últimos 7 dias!
            </p>
          </div>
        )}

        <div className="modal-history">
          <h3>Histórico de Tarefas</h3>
          {sortedDates.length === 0 ? (
            <p className="empty-state">Nenhuma tarefa neste projeto ainda.</p>
          ) : (
            sortedDates.map(date => {
              const dateObj = new Date(date + 'T12:00:00');
              let dateLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
              
              const today = new Date();
              const todayStr = getLocalYMD(today);
              const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowStr = getLocalYMD(tomorrow);
              const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = getLocalYMD(yesterday);
              
              if (date === todayStr) dateLabel = "Hoje";
              else if (date === tomorrowStr) dateLabel = "Amanhã";
              else if (date === yesterdayStr) dateLabel = "Ontem";

              dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

              return (
                <div key={date} className="history-group">
                  <div className="history-date">
                    <Calendar size={16} color="var(--accent-primary)" />
                    <span>{dateLabel}</span>
                  </div>
                  <div className="history-tasks">
                    {grouped[date].map(task => (
                      <div key={task.id} className="history-task-item" style={{ opacity: task.completed ? 0.6 : 1 }}>
                        <span className="status-dot" style={{ background: task.completed ? 'var(--success)' : 'var(--accent-primary)' }}></span>
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
