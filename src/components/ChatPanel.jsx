import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X as CloseIcon } from 'lucide-react';
import { ChatInterface } from './ChatInterface';

export const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        className="btn-icon"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'var(--accent-gradient)', color: '#000',
          width: '64px', height: '64px', borderRadius: '50%',
          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)',
          zIndex: 1000,
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={32} />
      </button>
    );
  }

  return (
    <div className="glass-panel chat-panel animate-fade-in" style={{ 
      position: 'fixed', bottom: '2rem', right: '2rem',
      width: '90%', maxWidth: '380px', height: '600px', maxHeight: '80vh',
      display: 'flex', flexDirection: 'column', zIndex: 1000,
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      background: 'var(--glass-bg)'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="text-gradient">IA Assistente</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Relate suas vitórias ou peça ajuda</p>
        </div>
        <button className="btn-icon" onClick={() => setIsOpen(false)}><CloseIcon size={20} /></button>
      </div>
      
      <ChatInterface />
    </div>
  );
};
