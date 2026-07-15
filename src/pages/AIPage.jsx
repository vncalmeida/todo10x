import { ChatInterface } from '../components/ChatInterface';
import { BrainCircuit } from 'lucide-react';

export const AIPage = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: 'none', borderRadius: '0' }}>
        <ChatInterface style={{ height: '100%' }} />
      </div>
    </div>
  );
};
