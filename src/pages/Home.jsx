import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { BrainCircuit, Plus, Circle, History } from 'lucide-react';
import { StreakCalendar } from '../components/StreakCalendar';
import { HoursChart } from '../components/HoursChart';
import { MoodTracker } from '../components/MoodTracker';
import { ChatPanel } from '../components/ChatPanel';
import { Pomodoro } from '../components/Pomodoro';
import { HomeTasks } from '../components/HomeTasks';

export const Home = () => {
  const { projects, quotes } = useTaskContext();
  const [dailyQuote, setDailyQuote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (quotes.length > 0) {
      setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)].text);
    }
  }, [quotes]);

  const activeProjects = projects.filter(p => p.status !== 'archived');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className="app-container animate-fade-in">
      
      <header className="header glass-panel">
        <div>
          <h1 className="text-gradient">Resumo de Hoje</h1>
          {dailyQuote && <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '0.3rem', fontSize: '0.95rem' }}>"{dailyQuote}"</p>}
        </div>
        <div className="header-stats" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </header>

      <main className="main-content">
        <div className="layout-grid">
          <div className="left-column">
            
            <section className="tasks-section" style={{ marginBottom: '2.5rem' }}>
              <HomeTasks />
            </section>

            <div className="stats-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="clickable-chart" onClick={() => navigate('/stats')} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} title="Ver estatísticas do ano">
                  <StreakCalendar />
                </div>
                <MoodTracker />
              </div>
              <div className="clickable-chart" onClick={() => navigate('/stats')} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} title="Ver estatísticas do ano">
                <HoursChart />
              </div>
            </div>

          </div>
          
          <div className="right-column">
            <Pomodoro />
          </div>
        </div>
      </main>
    </div>
  );
};
