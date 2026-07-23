import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTaskContext } from './context/TaskContext';
import { BrainCircuit, Menu } from 'lucide-react';
import { Home } from './pages/Home';
import { ProjectPage } from './pages/ProjectPage';
import { GlobalHistory } from './pages/GlobalHistory';
import { QuotesPage } from './pages/QuotesPage';
import { StatsPage } from './pages/StatsPage';
import { TasksPage } from './pages/TasksPage';
import { AIPage } from './pages/AIPage';
import { TimerPage } from './pages/TimerPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';
import { AIBrainModal } from './components/AIBrainModal';
import './App.css';

function App() {
  const { isLoaded } = useTaskContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBrainModalOpen, setIsBrainModalOpen] = useState(false);
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="pulse-glow" style={{ textAlign: 'center' }}>
          <BrainCircuit size={64} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 className="text-gradient" style={{ fontSize: '2rem' }}>Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenBrain={() => { setIsSidebarOpen(false); setIsBrainModalOpen(true); }}
      />
      <div className="main-wrapper">
        <div className="mobile-header">
          <button className="btn-icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} color="var(--text-primary)" />
          </button>
          <div className="logo" style={{ margin: 0 }}>
            <BrainCircuit size={24} color="var(--accent-primary)" />
            <h1 className="text-gradient" style={{ fontSize: '1.2rem', margin: 0 }}>AI Executive</h1>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/history" element={<GlobalHistory />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/timer" element={<TimerPage />} />
        </Routes>
      </div>
      {location.pathname !== '/ai' && <ChatPanel />}
      
      <AIBrainModal 
        isOpen={isBrainModalOpen} 
        onClose={() => setIsBrainModalOpen(false)} 
      />
    </div>
  );
}

export default App;
