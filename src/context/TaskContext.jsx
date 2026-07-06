import { createContext, useContext, useState, useEffect } from 'react';
import { processAIInput } from '../utils/aiMock';
import { supabase } from '../lib/supabase';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Supabase on start
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('todo10x')
          .select('data_payload')
          .eq('id', 1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means row not found, which is fine for first run
          throw error;
        }
        
        if (data && data.data_payload) {
          const payload = data.data_payload;
          setProjects(payload.projects || []);
          setTasks(payload.tasks || []);
          setTimeLogs(payload.timeLogs || []);
          console.log('Dados carregados da nuvem!');
        } else {
          throw new Error('Nenhum dado na nuvem ainda.');
        }
      } catch (err) {
        console.warn('Usando backup local:', err.message);
        // Fallback to localStorage if Supabase fails (e.g. no internet or first run)
        const savedProjects = localStorage.getItem('projects');
        const savedTasks = localStorage.getItem('tasks');
        const savedTimeLogs = localStorage.getItem('timeLogs');
        if (savedProjects) setProjects(JSON.parse(savedProjects));
        else setProjects([
          { id: '1', name: 'Projeto 1', progress: 22, dailyGoal: 60 },
          { id: '2', name: 'Projeto 2', progress: 34, dailyGoal: 30 }
        ]);
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedTimeLogs) setTimeLogs(JSON.parse(savedTimeLogs));
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Sync to LocalStorage AND Supabase whenever data changes
  useEffect(() => {
    if (!isLoaded) return; // Prevents overwriting cloud with empty state on startup

    const syncData = async () => {
      // Local backup
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('timeLogs', JSON.stringify(timeLogs));

      // Supabase Cloud Sync
      try {
        const payload = { projects, tasks, timeLogs };
        const { error } = await supabase
          .from('todo10x')
          .upsert({ id: 1, data_payload: payload });
          
        if (error) console.error('Supabase Sync Error:', error.message);
      } catch (err) {
        console.error('Erro ao sincronizar com Supabase:', err);
      }
    };

    // Delay 1 second to avoid spamming the database with requests while user is typing
    const timeoutId = setTimeout(syncData, 1000);
    return () => clearTimeout(timeoutId);
  }, [projects, tasks, timeLogs, isLoaded]);

  const addProject = (name, description = '') => {
    const newProject = { id: Date.now().toString(), name, description, progress: 0, dailyGoal: 30 };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProjectDetails = (projectId, name, description) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name, description } : p));
  };

  const updateProjectGoal = (projectId, dailyGoal) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, dailyGoal: parseInt(dailyGoal) || 30 } : p));
  };

  const logTime = (projectId, minutes, dateStr = new Date().toISOString().split('T')[0]) => {
    if (!projectId || !minutes || isNaN(minutes)) return;
    const newLog = {
      id: Date.now().toString() + Math.random(),
      projectId,
      date: dateStr,
      durationInMinutes: parseInt(minutes, 10)
    };
    setTimeLogs(prev => [...prev, newLog]);
  };

  const addTask = (projectId, title, targetDate) => {
    const newTask = {
      id: Date.now().toString() + Math.random(),
      projectId,
      title,
      completed: false,
      date: targetDate || new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    setTimeout(() => recalculateProgress(), 100);
  };

  const updateProjectProgress = (projectId, progress) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, progress } : p
    ));
  };

  const recalculateProgress = () => {
    setProjects(prevProjects => prevProjects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      if (projectTasks.length === 0) return project;
      const completed = projectTasks.filter(t => t.completed).length;
      const progress = Math.round((completed / projectTasks.length) * 100);
      return { ...project, progress };
    }));
  };

  const handleAIInput = async (text) => {
    const actions = await processAIInput(text, projects);
    let newProjects = [...projects];
    
    actions.forEach(action => {
      if (action.type === 'CREATE_TASK') {
        let projectId = action.projectId;
        if (!projectId && action.projectName) {
          let proj = newProjects.find(p => p.name.toLowerCase() === action.projectName.toLowerCase());
          if (!proj) {
            proj = { id: Date.now().toString() + Math.random(), name: action.projectName, progress: 0, dailyGoal: 30 };
            newProjects.push(proj);
          }
          projectId = proj.id;
        }
        
        if (projectId) {
          addTask(projectId, action.title, action.targetDate);
        }
      }
      else if (action.type === 'COMPLETE_TASK') {
        const matchingTask = tasks.find(t => 
          !t.completed && t.title.toLowerCase().includes(action.keyword.toLowerCase())
        );
        if (matchingTask) {
          toggleTaskComplete(matchingTask.id);
        }
      }
    });

    if (newProjects.length !== projects.length) {
      setProjects(newProjects);
    }
  };

  return (
    <TaskContext.Provider value={{
      projects,
      tasks,
      timeLogs,
      isLoaded,
      addProject,
      addTask,
      toggleTaskComplete,
      updateProjectProgress,
      updateProjectDetails,
      handleAIInput,
      logTime,
      updateProjectGoal
    }}>
      {children}
    </TaskContext.Provider>
  );
};
