import { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Send, Clock, Check, X, MessageCircle, X as CloseIcon } from 'lucide-react';

export const ChatPanel = () => {
  const { chatMessages, handleAIInput, suggestions, acceptSuggestion, rejectSuggestion, clearSuggestions } = useTaskContext();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, suggestions, isProcessing, isOpen]);

  const send = async () => {
    if (!text.trim()) return;
    const txt = text;
    setText('');
    setIsProcessing(true);
    
    try {
      await handleAIInput(txt);
    } catch (e) {
      console.error("Erro na comunicação com a IA", e);
      alert("Ocorreu um erro grave no Chat. Verifique o console ou tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="btn-icon"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'var(--accent-gradient)', color: '#fff',
          width: '64px', height: '64px', borderRadius: '50%',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
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
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            <p>Olá! O que vamos fazer hoje?</p>
          </div>
        )}

        {chatMessages.map(m => (
          <div key={m.id} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            padding: '0.8rem 1rem', 
            borderRadius: '12px', 
            borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
            borderBottomLeftRadius: m.role === 'assistant' ? '2px' : '12px',
            maxWidth: '85%',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap'
          }}
          dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        ))}

        {suggestions.length > 0 && (
          <div style={{ background: 'rgba(255, 165, 0, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '0.9rem' }}>✨ Tarefas Sugeridas</h4>
              <button onClick={clearSuggestions} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>Limpar Todas</button>
            </div>
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
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
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
          placeholder="Digite sua mensagem..." 
          style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '24px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
        />
        <button onClick={send} disabled={isProcessing} style={{ background: 'var(--accent-gradient)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1 }}>
          <Send size={18} color="#fff" style={{ marginLeft: '2px' }} />
        </button>
      </div>
    </div>
  );
};
