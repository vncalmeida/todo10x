import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTaskContext, PROJECT_COLORS } from '../context/TaskContext';

export const NewProjectModal = ({ onClose }) => {
  const { addProject } = useTaskContext();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    addProject(name, desc, selectedColor);
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cor do Projeto</label>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: selectedColor === color ? '3px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedColor === color ? `0 0 10px ${color}` : 'none'
                  }}
                  title="Selecionar cor"
                />
              ))}
            </div>
          </div>
          
          <button className="ai-submit-btn" style={{ justifyContent: 'center', marginTop: '1rem' }} onClick={handleSave}>
            <Check size={18} /> Criar Projeto
          </button>
        </div>
      </div>
    </div>
  );
};
