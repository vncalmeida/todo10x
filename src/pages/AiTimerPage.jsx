import { Pomodoro } from '../components/Pomodoro';
import { ChatInterface } from '../components/ChatInterface';
import { BrainCircuit } from 'lucide-react';

export const AiTimerPage = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3rem)', paddingBottom: '1rem' }}>
      <header className="header glass-panel" style={{ marginBottom: '1rem', flexShrink: 0, padding: '1rem' }}>
        <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', margin: 0 }}>
          <BrainCircuit size={24} /> Modo Foco + IA
        </h1>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
        {/* Top: Pomodoro (takes natural height) */}
        <div style={{ flexShrink: 0 }}>
          <Pomodoro />
        </div>

        {/* Bottom: Chat (takes remaining height) */}
        <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatInterface style={{ height: '100%' }} />
        </div>
      </div>
    </div>
  );
};
