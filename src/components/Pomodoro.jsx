import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const Pomodoro = () => {
  const { projects, logTime, handleAIInput } = useTaskContext();
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [endTime, setEndTime] = useState(null);
  
  // State Machine: 'idle' | 'selecting' | 'working' | 'victory'
  const [status, setStatus] = useState('idle');
  const [selectedProjectId, setSelectedProjectId] = useState('');
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
    let interval = null;
    if (status === 'working' && endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.round((endTime - now) / 1000);
        
        if (diff <= 0) {
          // Finished
          logTime(selectedProjectId, customMinutes);
          playBeep(800, 'square');
          setTimeout(() => playBeep(800, 'square'), 200);
          
          setStatus('victory');
          setEndTime(null);
          setTimeLeft(customMinutes * 60);
        } else {
          setTimeLeft(diff);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [status, endTime, customMinutes, selectedProjectId, logTime]);

  const handlePlayClick = () => {
    if (status === 'idle') {
      if (projects.length === 0) {
        alert("Crie um projeto primeiro!");
        return;
      }
      setSelectedProjectId(projects[0].id);
      setStatus('selecting');
    } else if (status === 'working') {
      // Pause
      setStatus('idle');
      setEndTime(null);
    }
  };

  const handleStartWorking = () => {
    if (!selectedProjectId) return;
    setStatus('working');
    setEndTime(Date.now() + timeLeft * 1000);
    playBeep(600, 'triangle');
  };

  const reset = () => {
    setStatus('idle');
    setEndTime(null);
    setTimeLeft(customMinutes * 60);
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
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
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
          
          <div className="timer-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="number" 
              value={customMinutes} 
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setCustomMinutes(val);
                if(status === 'idle') setTimeLeft(val * 60);
              }}
              className="time-input"
              disabled={status !== 'idle'}
              min="1"
              title="Minutos do Pomodoro"
            />
            <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem', marginRight: '0.5rem'}}>min</span>
            
            <button onClick={handlePlayClick} className="btn-icon" title={status === 'working' ? 'Pausar' : 'Iniciar'}>
              {status === 'working' ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={reset} className="btn-icon" title="Reiniciar">
              <RotateCcw size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
