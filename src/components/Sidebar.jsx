import { NavLink } from 'react-router-dom';
import { BrainCircuit, Home, History, Quote, BarChart2, CheckSquare, X } from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
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
          <NavLink to="/ai-timer" onClick={onClose} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <BrainCircuit size={20} />
            <span>Foco + IA</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
};
