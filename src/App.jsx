import { Routes, Route } from 'react-router-dom';
import { useTaskContext } from './context/TaskContext';
import { BrainCircuit } from 'lucide-react';
import { Home } from './pages/Home';
import { ProjectPage } from './pages/ProjectPage';
import { GlobalHistory } from './pages/GlobalHistory';
import { QuotesPage } from './pages/QuotesPage';
import { StatsPage } from './pages/StatsPage';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  const { isLoaded } = useTaskContext();

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
      <Sidebar />
      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/history" element={<GlobalHistory />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </div>
      <ChatPanel />
    </div>
  );
}

export default App;
