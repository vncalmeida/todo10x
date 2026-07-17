import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { triggerReward } from '../utils/rewards';

export const Pomodoro = () => {
  const { 
    projects, handleAIInput, 
    pomodoroStatus: status, 
    pomodoroEndTime: endTime, 
    pomodoroTimeLeft: timeLeft, 
    pomodoroProjectId: selectedProjectId, 
    pomodoroCustomMinutes: customMinutes, 
    setPomodoroState 
  } = useTaskContext();
  
  const [victoryText, setVictoryText] = useState('');

  const playBeep = (freq = 440, type = 'sine') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1);
    } catch (e) { console.error("Audio error", e); }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === 'working') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status]);



  const handlePlayClick = () => {
    if (status === 'idle') {
      if (projects.length === 0) {
        alert("Crie um projeto primeiro!");
        return;
      }
      setPomodoroState('selecting', projects[0].id);
    } else if (status === 'working') {
      // Pause
      setPomodoroState('idle', undefined, null);
    }
  };

  const handleStartWorking = () => {
    if (!selectedProjectId) return;
    setPomodoroState('working', undefined, Date.now() + timeLeft * 1000);
    playBeep(600, 'triangle');
  };

  const reset = () => {
    setPomodoroState('idle', undefined, null, customMinutes * 60);
    setVictoryText('');
  };

  const handleVictorySubmit = () => {
    if (victoryText.trim()) {
      const proj = projects.find(p => p.id === selectedProjectId);
      const text = `Vitória no projeto ${proj ? proj.name : ''}: ${victoryText}`;
      handleAIInput(text);
    }
    reset();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="pomodoro-container glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
      
      {status === 'victory' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center', textAlign: 'center' }}>
          <h3 className="text-gradient">Tempo concluído! 🎉</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Qual foi a sua vitória de hoje neste bloco de foco?</p>
          <textarea
            className="chat-input"
            rows="3"
            placeholder="Ex: Configurei o servidor e fechei o design..."
            value={victoryText}
            onChange={(e) => setVictoryText(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--glass-border)' }}
          />
          <button className="btn-small" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVictorySubmit}>
            Registrar Vitória
          </button>
        </div>
      ) : status === 'selecting' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
          <h3>Em qual projeto vamos focar?</h3>
          <select 
            className="project-select"
            value={selectedProjectId || ''}
            onChange={(e) => setPomodoroState(undefined, e.target.value)}
            style={{ width: '100%' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn-small" style={{ width: '100%', justifyContent: 'center' }} onClick={handleStartWorking}>
            <Play size={14} /> Começar Foco
          </button>
          <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>
            Cancelar
          </button>
        </div>
      ) : (
        <>
          <div className="pomodoro-header" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <h3 className="pomodoro-title">Foco & Tempo</h3>
            {status === 'working' && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                Focando em: {projects.find(p => p.id === selectedProjectId)?.name}
              </span>
            )}
          </div>
          
          <div className="timer-display">
            <span className="time">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          
          <div className="timer-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '250px' }}>
              {[15, 25, 40, 50].map(min => (
                <button 
                  key={min}
                  onClick={() => setPomodoroState(undefined, undefined, undefined, min * 60, min)}
                  style={{
                    flex: 1,
                    background: customMinutes === min ? 'var(--accent-primary)' : 'var(--glass-bg)',
                    color: customMinutes === min ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '0.3rem 0',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: customMinutes === min ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={handlePlayClick} className="btn-icon" title={status === 'working' ? 'Pausar' : 'Iniciar'}>
                {status === 'working' ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={reset} className="btn-icon" title="Reiniciar">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
