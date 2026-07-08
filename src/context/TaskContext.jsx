import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { processAIInput } from '../utils/aiService';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [victories, setVictories] = useState([]);
  const [productivityRatings, setProductivityRatings] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipSyncRef = useRef(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase.from('todo10x').select('data_payload').eq('id', 1).single();
        if (data && data.data_payload) {
          const payload = data.data_payload;
          setProjects(payload.projects || []);
          setTasks(payload.tasks || []);
          setTimeLogs(payload.timeLogs || []);
          setChatMessages(payload.chatMessages || []);
          setSuggestions(payload.suggestions || []);
          setVictories(payload.victories || []);
          setProductivityRatings(payload.productivityRatings || []);
        }
      } catch (err) {
        console.error("Erro ao puxar dados da nuvem:", err);
      } finally {
        setIsLoaded(true);
        setTimeout(() => { skipSyncRef.current = false; }, 500);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (skipSyncRef.current || !isLoaded) return;
    const syncToCloud = async () => {
      const payload = { projects, tasks, timeLogs, chatMessages, suggestions, victories, productivityRatings };
      try {
        await supabase.from('todo10x').upsert({ id: 1, data_payload: payload });
      } catch (err) {
        console.error('Supabase Sync Error:', err);
      }
    };
    
    const debounceTimer = setTimeout(syncToCloud, 1000);
    return () => clearTimeout(debounceTimer);
  }, [projects, tasks, timeLogs, chatMessages, suggestions, victories, productivityRatings, isLoaded]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00e676', '#00bcd4', '#ffeb3b', '#ff4081']
    });
  };

  const addProject = (name, description, dailyGoal = 60, milestones = '') => {
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      milestones,
      status: 'active',
      progress: 0,
      dailyGoal
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTask = (projectId, title, date) => {
    const newTask = {
      id: Date.now().toString() + Math.random(),
      projectId,
      title,
      completed: false,
      date: date || new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const addVictory = (projectId, title, date) => {
    const newVic = {
      id: Date.now().toString() + Math.random(),
      projectId,
      title,
      date: date || new Date().toISOString().split('T')[0]
    };
    setVictories(prev => [...prev, newVic]);
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    setTimeout(() => {
      setTasks(currentTasks => {
        const task = currentTasks.find(t => t.id === taskId);
        if (task && task.completed) {
          triggerConfetti();
          setProjects(currentProjects => {
            return currentProjects.map(p => {
              if (p.id === task.projectId) {
                const totalProjTasks = currentTasks.filter(t => t.projectId === p.id).length;
                if (totalProjTasks === 0) return p;
                const completedProjTasks = currentTasks.filter(t => t.projectId === p.id && t.completed).length;
                const progress = Math.round((completedProjTasks / totalProjTasks) * 100);
                return { ...p, progress };
              }
              return p;
            });
          });
        }
        return currentTasks;
      });
    }, 100);
  };

  const logTime = (projectId, durationInMinutes, pastDateStr = null) => {
    const logDate = pastDateStr || new Date().toISOString().split('T')[0];
    const newLog = {
      id: Date.now().toString() + Math.random(),
      projectId,
      durationInMinutes,
      date: logDate,
      timestamp: Date.now()
    };
    setTimeLogs(prev => [...prev, newLog]);
    
    // Confetti if goal reached for today
    if (!pastDateStr) {
       const proj = projects.find(p => p.id === projectId);
       if (proj) {
          setTimeLogs(currentLogs => {
             const workedToday = currentLogs.filter(l => l.date === logDate && l.projectId === projectId)
                                            .reduce((acc, l) => acc + l.durationInMinutes, 0);
             if (workedToday + durationInMinutes >= proj.dailyGoal) {
                triggerConfetti();
             }
             return currentLogs;
          });
       }
    }
  };

  const addProductivityRating = (score) => {
    const date = new Date().toISOString().split('T')[0];
    setProductivityRatings(prev => {
      const filtered = prev.filter(r => r.date !== date);
      return [...filtered, { date, score }];
    });
    if (score >= 4) {
      triggerConfetti();
    }
  };

  const acceptSuggestion = (sugId) => {
    const sug = suggestions.find(s => s.id === sugId);
    if (sug) {
      addTask(sug.projectId, sug.title, new Date().toISOString().split('T')[0]);
      setSuggestions(prev => prev.filter(s => s.id !== sugId));
    }
  };

  const rejectSuggestion = (sugId) => {
    setSuggestions(prev => prev.filter(s => s.id !== sugId));
  };

  const handleAIInput = async (text) => {
    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);

    const result = await processAIInput(text, projects, chatMessages, tasks);
    
    if (result.text) {
      const aiMsg = { id: Date.now().toString() + 'ai', role: 'assistant', text: result.text };
      setChatMessages(prev => [...prev, aiMsg]);
    }

    if (result.actions && result.actions.length > 0) {
      let newProjects = [...projects];
      
      result.actions.forEach(action => {
        let projectId = action.projectId;
        
        if (!projectId && action.projectName) {
          let proj = newProjects.find(p => p.name.toLowerCase() === action.projectName.toLowerCase());
          if (!proj) {
            proj = { id: Date.now().toString() + Math.random(), name: action.projectName, progress: 0, dailyGoal: 60, status: 'active' };
            newProjects.push(proj);
          }
          projectId = proj.id;
        }

        if (action.type === 'SUGGEST_TASK' && projectId) {
          setSuggestions(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            projectId,
            title: action.title
          }]);
        }
        else if (action.type === 'LOG_VICTORY' && projectId) {
          addVictory(projectId, action.title, action.date);
          setSuggestions(prev => prev.filter(s => !s.title.toLowerCase().includes(action.title.toLowerCase())));
        }
        else if (action.type === 'COMPLETE_TASK') {
          setTasks(prev => prev.map(t => {
            if (!t.completed && t.title.toLowerCase().includes(action.keyword.toLowerCase())) {
              return { ...t, completed: true };
            }
            return t;
          }));
        }
        else if (action.type === 'LOG_PAST_TIME' && projectId) {
          logTime(projectId, action.durationInMinutes, action.date);
        }
        else if (action.type === 'CREATE_PROJECT') {
          const newProj = {
            id: Date.now().toString() + Math.random(),
            name: action.name,
            description: action.description,
            milestones: action.milestones || '',
            status: 'active',
            progress: 0,
            dailyGoal: 60
          };
          newProjects.push(newProj);
        }
        else if (action.type === 'ARCHIVE_PROJECT' && projectId) {
          const idx = newProjects.findIndex(p => p.id === projectId);
          if (idx !== -1) newProjects[idx] = { ...newProjects[idx], status: 'archived' };
        }
        else if (action.type === 'UPDATE_PROGRESS' && projectId) {
          const idx = newProjects.findIndex(p => p.id === projectId);
          if (idx !== -1) newProjects[idx] = { ...newProjects[idx], progress: action.progress };
        }
        else if (action.type === 'ERASE_ALL') {
          setProjects([]);
          setTasks([]);
          setTimeLogs([]);
          setVictories([]);
          setSuggestions([]);
          setChatMessages([{ id: Date.now().toString(), role: 'assistant', text: 'Todos os dados foram resetados com sucesso. Como posso ajudar com seu novo recomeço?' }]);
          newProjects = [];
        }
      });

      if (newProjects.length !== projects.length || result.actions.some(a => ['ARCHIVE_PROJECT', 'UPDATE_PROGRESS', 'ERASE_ALL'].includes(a.type))) {
        setProjects(newProjects);
      }
    }
  };

  return (
    <TaskContext.Provider value={{
      projects, addProject, updateProject,
      tasks, addTask, toggleTaskComplete,
      victories, addVictory,
      timeLogs, logTime,
      chatMessages, handleAIInput,
      suggestions, acceptSuggestion, rejectSuggestion,
      productivityRatings, addProductivityRating,
      isLoaded, triggerConfetti
    }}>
      {children}
    </TaskContext.Provider>
  );
};
