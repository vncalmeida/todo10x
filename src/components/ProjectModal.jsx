import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useTaskContext, PROJECT_COLORS } from '../context/TaskContext';

export const ProjectModal = ({ project, onClose }) => {
  const { updateProject } = useTaskContext();
  const [editName, setEditName] = useState(project?.name || '');
  const [editDesc, setEditDesc] = useState(project?.description || '');
  const [editColor, setEditColor] = useState(project?.color || PROJECT_COLORS[0]);

  if (!project) return null;

  const handleSaveDetails = () => {
    updateProject(project.id, { name: editName, description: editDesc, color: editColor });
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '1.5rem' }}>
          <div className="modal-header-edit" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Editar Projeto</h2>
              <button onClick={onClose} className="btn-icon">
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="time-input"
                style={{ width: '80%', fontSize: '1.25rem', textAlign: 'left', fontWeight: 'bold', padding: '0.5rem' }}
              />
              <button onClick={handleSaveDetails} className="btn-icon" style={{ background: 'var(--accent-gradient)' }}>
                <Save size={20} />
              </button>
            </div>
            <textarea 
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="time-input"
              style={{ width: '100%', textAlign: 'left', minHeight: '60px', resize: 'none', padding: '0.5rem' }}
              placeholder="Adicionar descrição ao projeto..."
            />
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cor do Projeto</label>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: editColor === color ? '3px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: editColor === color ? `0 0 10px ${color}` : 'none'
                    }}
                    title="Selecionar cor"
                  />
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
