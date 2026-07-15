import { NavLink } from 'react-router-dom';
import { BrainCircuit, Home, History, Quote, BarChart2, CheckSquare } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo" style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>
        <BrainCircuit size={28} color="var(--accent-primary)" />
        <h1 className="text-gradient" style={{ fontSize: '1.2rem' }}>AI Executive</h1>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <CheckSquare size={20} />
          <span>Tarefas</span>
        </NavLink>
        <NavLink to="/history" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <History size={20} />
          <span>Diário Global</span>
        </NavLink>
        <NavLink to="/quotes" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Quote size={20} />
          <span>Minhas Frases</span>
        </NavLink>
        <NavLink to="/stats" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <BarChart2 size={20} />
          <span>Estatísticas</span>
        </NavLink>
      </nav>
    </aside>
  );
};
