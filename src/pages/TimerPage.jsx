import { Pomodoro } from '../components/Pomodoro';
import { Clock } from 'lucide-react';

export const TimerPage = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '1rem' }}>
      <header className="header glass-panel" style={{ marginBottom: '1rem', flexShrink: 0, padding: '1rem' }}>
        <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', margin: 0 }}>
          <Clock size={24} /> Timer Foco
        </h1>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <Pomodoro />
        </div>
      </div>
    </div>
  );
};
