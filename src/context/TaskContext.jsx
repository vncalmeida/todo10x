import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { processAIInput } from '../utils/aiMock';
import { supabase } from '../lib/supabase';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [victories, setVictories] = useState([]);
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
      const payload = { projects, tasks, timeLogs, chatMessages, suggestions, victories };
      try {
        await supabase.from('todo10x').upsert({ id: 1, data_payload: payload });
      } catch (err) {
        console.error('Supabase Sync Error:', err);
      }
    };
    
    const debounceTimer = setTimeout(syncToCloud, 1000);
    return () => clearTimeout(debounceTimer);
  }, [projects, tasks, timeLogs, chatMessages, suggestions, victories, isLoaded]);

  const addProject = (name, description, dailyGoal = 30) => {
    const newProject = {
      id: Date.now().toString(),
      name,
      description, // Goal/Meta
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

  const logTime = (projectId, durationInMinutes) => {
    const newLog = {
      id: Date.now().toString(),
      projectId,
      durationInMinutes,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };
    setTimeLogs(prev => [...prev, newLog]);
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

    const result = await processAIInput(text, projects, chatMessages);
    
    if (result.text) {
      const aiMsg = { id: Date.now().toString() + 'ai', role: 'assistant', text: result.text };
      setChatMessages(prev => [...prev, aiMsg]);
    }

    if (result.actions && result.actions.length > 0) {
      let newProjects = [...projects];
      
      result.actions.forEach(action => {
        let projectId = action.projectId;
        
        // Tratar nome de projeto vindo da IA se não tiver ID
        if (!projectId && action.projectName) {
          let proj = newProjects.find(p => p.name.toLowerCase() === action.projectName.toLowerCase());
          if (!proj) {
            proj = { id: Date.now().toString() + Math.random(), name: action.projectName, progress: 0, dailyGoal: 30 };
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
          
          // Checa se a vitória mata alguma sugestão existente
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
      });

      if (newProjects.length !== projects.length) {
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
      isLoaded
    }}>
      {children}
    </TaskContext.Provider>
  );
};
