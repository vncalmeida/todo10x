import { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Send, Clock, Check, X } from 'lucide-react';

export const ChatPanel = () => {
  const { chatMessages, handleAIInput, suggestions, acceptSuggestion, rejectSuggestion } = useTaskContext();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, suggestions, isProcessing]);

  const send = async () => {
    if (!text.trim()) return;
    const txt = text;
    setText('');
    setIsProcessing(true);
    await handleAIInput(txt);
    setIsProcessing(false);
  };

  return (
    <div className="glass-panel chat-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', maxHeight: '700px' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h3 className="text-gradient">IA Assistente</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Relate suas vitórias ou peça ajuda</p>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            <p>Olá! O que vamos fazer hoje?</p>
          </div>
        )}

        {chatMessages.map(m => (
          <div key={m.id} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--glass-bg)',
            color: '#fff',
            padding: '0.8rem 1rem', 
            borderRadius: '12px', 
            borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
            borderBottomLeftRadius: m.role === 'assistant' ? '2px' : '12px',
            maxWidth: '85%',
            fontSize: '0.95rem',
            lineHeight: '1.4'
          }}>
            {m.text}
          </div>
        ))}

        {suggestions.length > 0 && (
          <div style={{ background: 'rgba(255, 165, 0, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.8rem', fontSize: '0.9rem' }}>✨ Tarefas Sugeridas</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem' }}>{s.title}</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-icon" style={{ background: 'var(--success)', width: '28px', height: '28px' }} onClick={() => acceptSuggestion(s.id)}>
                      <Check size={14} color="#000" />
                    </button>
                    <button className="btn-icon" style={{ background: 'var(--glass-border)', width: '28px', height: '28px' }} onClick={() => rejectSuggestion(s.id)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--glass-bg)', padding: '0.8rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Clock className="spin" size={16} /> Pensando...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Trabalhei 50m no projeto X e fiz Y..." 
          style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '24px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
        />
        <button onClick={send} disabled={isProcessing} style={{ background: 'var(--accent-gradient)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1 }}>
          <Send size={18} color="#fff" style={{ marginLeft: '2px' }} />
        </button>
      </div>
    </div>
  );
};
