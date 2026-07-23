import { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { X, Save, Brain } from 'lucide-react';

export const AIBrainModal = ({ isOpen, onClose }) => {
  const { aiSystemPrompt, setAiSystemPrompt } = useTaskContext();
  const [localPrompt, setLocalPrompt] = useState(aiSystemPrompt);

  useEffect(() => {
    setLocalPrompt(aiSystemPrompt);
  }, [aiSystemPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setAiSystemPrompt(localPrompt);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', height: '85vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
            <Brain color="var(--accent-primary)" size={28} />
            Cérebro da IA (Contexto Mestre)
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Cole abaixo o seu dossiê completo. A Inteligência Artificial lerá estas instruções em todas as interações para entender perfeitamente o seu perfil, seus negócios e a sua forma de trabalhar.
          </p>
          <textarea
            value={localPrompt}
            onChange={e => setLocalPrompt(e.target.value)}
            className="time-input"
            style={{ 
              flex: 1, 
              width: '100%', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid var(--glass-border)', 
              background: 'rgba(0,0,0,0.3)', 
              color: '#e2e8f0',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              resize: 'none',
              fontFamily: 'monospace'
            }}
            placeholder="Cole o System Prompt aqui..."
          />
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn-small" onClick={onClose} style={{ background: 'transparent' }}>Cancelar</button>
          <button className="btn-small" onClick={handleSave} style={{ background: 'var(--accent-primary)', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> Salvar Cérebro
          </button>
        </div>
      </div>
    </div>
  );
};
