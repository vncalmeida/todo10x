import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { Plus, Target } from 'lucide-react';
import { NewProjectModal } from '../components/NewProjectModal';

export const ProjectsPage = () => {
  const { projects } = useTaskContext();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  const activeProjects = projects.filter(p => p.status !== 'archived');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {isCreatingProject && <NewProjectModal onClose={() => setIsCreatingProject(false)} />}
      
      <header className="header glass-panel" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Target size={24} /> Projetos & Visão Geral
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>O centro das suas maiores empreitadas.</p>
        </div>
      </header>

      <div className="projects-section">
        <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Projetos Ativos ({activeProjects.length})</h2>
          <button className="btn-small" onClick={() => setIsCreatingProject(true)}>
            <Plus size={14} /> Criar Novo Projeto
          </button>
        </div>
        
        <div className="projects-grid">
          {activeProjects.map(project => (
            <div key={project.id} className="project-card glass-panel clickable" onClick={() => navigate(`/project/${project.id}`)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ marginBottom: project.description ? '0.5rem' : '0' }}>{project.name}</h3>
              {project.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Acessar ➔</span>
              </div>
            </div>
          ))}
          {activeProjects.length === 0 && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum projeto ativo no momento. Peça para a IA criar um ou crie manualmente!</p>
            </div>
          )}
        </div>

        {archivedProjects.length > 0 && (
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <button className="btn-small" style={{ margin: '0 auto', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }} onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? 'Ocultar Projetos Arquivados' : `Ver Projetos Arquivados (${archivedProjects.length})`}
            </button>
          </div>
        )}

        {showArchived && (
          <div className="projects-grid" style={{ marginTop: '1.5rem', opacity: 0.6 }}>
            {archivedProjects.map(project => (
              <div key={project.id} className="project-card glass-panel clickable" onClick={() => navigate(`/project/${project.id}`)} style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0' }}>{project.name} <span style={{ fontSize: '0.7rem', border: '1px solid var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>ARQUIVADO</span></h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
