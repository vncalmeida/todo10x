import { Routes, Route } from 'react-router-dom';
import { useTaskContext } from './context/TaskContext';
import { BrainCircuit } from 'lucide-react';
import { Home } from './pages/Home';
import { ProjectPage } from './pages/ProjectPage';
import './App.css';

function App() {
  const { isLoaded } = useTaskContext();

  if (!isLoaded) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BrainCircuit size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
          <h2 className="text-gradient">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/project/:id" element={<ProjectPage />} />
    </Routes>
  );
}

export default App;
