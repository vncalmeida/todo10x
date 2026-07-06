import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const NewProjectModal = ({ onClose }) => {
  const { addProject } = useTaskContext();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addProject(name, desc);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Novo Projeto</h2>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Projeto</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="time-input" 
              style={{ width: '100%', textAlign: 'left' }}
              placeholder="Ex: Reforma da Casa"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descrição (Opcional)</label>
            <textarea 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="time-input" 
              style={{ width: '100%', textAlign: 'left', minHeight: '80px', resize: 'none' }}
              placeholder="Ex: Planejar gastos e comprar materiais."
            />
          </div>
          
          <button className="ai-submit-btn" style={{ justifyContent: 'center', marginTop: '1rem' }} onClick={handleSave}>
            <Check size={18} /> Criar Projeto
          </button>
        </div>
      </div>
    </div>
  );
};
