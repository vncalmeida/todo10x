import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, PlusCircle } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const Pomodoro = () => {
  const { projects, timeLogs, logTime } = useTaskContext();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');

  // Sincroniza o dropdown se os projetos mudarem
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(customMinutes * 60);
    }
  }, [customMinutes, isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      logTime(selectedProjectId, customMinutes);
      setTimeLeft(customMinutes * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, customMinutes, selectedProjectId, logTime]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
  };

  const handleAddManualTime = () => {
    if (manualMinutes && !isNaN(manualMinutes)) {
      logTime(selectedProjectId, manualMinutes);
      setManualMinutes('');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calcula o tempo de hoje para o projeto selecionado
  const todayStr = new Date().toISOString().split('T')[0];
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const dailyGoal = selectedProject?.dailyGoal || 30;
  
  const todayLogs = timeLogs.filter(log => log.projectId === selectedProjectId && log.date === todayStr);
  const timeWorkedToday = todayLogs.reduce((acc, log) => acc + log.durationInMinutes, 0);
  
  const routineProgress = Math.min((timeWorkedToday / dailyGoal) * 100, 100) || 0;
  const minReached = timeWorkedToday >= dailyGoal;

  return (
    <div className="pomodoro-container glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="pomodoro-header" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <h3 className="pomodoro-title">Foco & Tempo</h3>
        <select 
          className="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          disabled={isActive}
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      
      <div className="timer-display">
        <span className="time">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
      </div>
      
      <div className="timer-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          type="number" 
          value={customMinutes} 
          onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
          className="time-input"
          disabled={isActive}
          min="1"
          title="Minutos do Pomodoro"
        />
        <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem', marginRight: '0.5rem'}}>min</span>
        
        <button onClick={toggle} className="btn-icon" title={isActive ? 'Pausar' : 'Iniciar'}>
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={reset} className="btn-icon" title="Reiniciar">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="manual-time-entry" style={{ display: 'flex', gap: '0.5rem', width: '100%', padding: '1rem 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
        <input 
          type="number" 
          placeholder="Add manual (min)"
          value={manualMinutes}
          onChange={(e) => setManualMinutes(e.target.value)}
          className="time-input"
          style={{ flex: 1 }}
        />
        <button className="ai-submit-btn" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={handleAddManualTime}>
          <PlusCircle size={14} /> Add
        </button>
      </div>

      <div className="routine-tracker" style={{ width: '100%' }}>
        <div className="routine-header">
          <span>Hoje ({selectedProject?.name})</span>
          <span>{timeWorkedToday} / {dailyGoal} min</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${routineProgress}%`, background: minReached ? 'var(--success)' : 'var(--accent-gradient)' }}></div>
        </div>
        <div className="routine-markers">
          <span className={minReached ? 'reached' : ''}>Meta Diária: {dailyGoal}m</span>
        </div>
      </div>
    </div>
  );
};
