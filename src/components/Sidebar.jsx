import { NavLink } from 'react-router-dom';
import { BrainCircuit, Home, History, Quote, BarChart2, CheckSquare, X, Clock, Target } from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onOpenBrain }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1rem' }}>
          <div className="logo">
            <BrainCircuit size={28} color="var(--accent-primary)" />
            <h1 className="text-gradient" style={{ fontSize: '1.2rem' }}>AI Executive</h1>
          </div>
          <button className="mobile-close-btn btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Target size={20} />
            <span>Projetos</span>
          </NavLink>
          <NavLink to="/tasks" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <CheckSquare size={20} />
            <span>Tarefas</span>
          </NavLink>
          <NavLink to="/history" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <History size={20} />
            <span>Diário Global</span>
          </NavLink>
          <NavLink to="/quotes" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Quote size={20} />
            <span>Minhas Frases</span>
          </NavLink>
          <NavLink to="/stats" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <BarChart2 size={20} />
            <span>Estatísticas</span>
          </NavLink>
          <NavLink to="/ai" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <BrainCircuit size={20} />
            <span>Assistente IA</span>
          </NavLink>
          <NavLink to="/timer" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Clock size={20} />
            <span>Timer Foco</span>
          </NavLink>
          <button onClick={onOpenBrain} className="sidebar-link" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
            <BrainCircuit size={20} />
            <span>Cérebro da IA</span>
          </button>
          
          <button 
            onClick={() => {
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              window.OneSignalDeferred.push(function(OneSignal) {
                OneSignal.Slidedown.promptPush();
              });
              if (onClose) onClose();
            }}
            className="sidebar-link" 
            style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', borderRadius: 0 }}
          >
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>🔔</span>
            <span>Ativar Notificações</span>
          </button>
        </nav>
      </aside>
    </>
  );
};
