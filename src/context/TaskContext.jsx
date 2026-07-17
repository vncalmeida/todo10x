import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLocalYMD } from '../utils/dateUtils';
import { processAIInput } from '../utils/aiService';
import { supabase } from '../lib/supabase';
import { triggerReward } from '../utils/rewards';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [victories, setVictories] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [productivityRatings, setProductivityRatings] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const skipSyncRef = useRef(true);

  // Global Pomodoro State
  const [pomodoroStatus, setPomodoroStatus] = useState('idle'); // 'idle' | 'selecting' | 'working' | 'victory'
  const [pomodoroEndTime, setPomodoroEndTime] = useState(null);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroProjectId, setPomodoroProjectId] = useState(null);
  const [pomodoroCustomMinutes, setPomodoroCustomMinutes] = useState(25);

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
          setQuotes(payload.quotes || [{ id: '1', text: 'Só ação gera poder.' }]);
          setGoals(payload.goals || []);
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
      const payload = { projects, tasks, timeLogs, chatMessages, suggestions, victories, productivityRatings, quotes, goals };
      try {
        await supabase.from('todo10x').upsert({ id: 1, data_payload: payload });
      } catch (err) {
        console.error('Supabase Sync Error:', err);
      }
    };
    
    const debounceTimer = setTimeout(syncToCloud, 1000);
    return () => clearTimeout(debounceTimer);
  }, [projects, tasks, timeLogs, chatMessages, suggestions, victories, productivityRatings, quotes, goals, isLoaded]);


  const addProject = (name, description, milestones = '') => {
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      milestones,
      status: 'active',
      progress: 0,
      timeTiers: { ok: 10, good: 30, excellent: 60 }
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTask = (projectId, title, date, goalId = null, completed = false) => {
    const newTask = {
      id: Date.now().toString() + Math.random(),
      projectId,
      goalId,
      title,
      completed: completed,
      date: date || getLocalYMD()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const addVictory = (projectId, title, date) => {
    const newVic = {
      id: Date.now().toString() + Math.random(),
      projectId,
      title,
      date: date || getLocalYMD()
    };
    setVictories(prev => [...prev, newVic]);
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const editTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    setTimeout(() => {
      setTasks(currentTasks => {
        const task = currentTasks.find(t => t.id === taskId);
        if (task && task.completed) {
          triggerReward();
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

          if (task.goalId) {
            setGoals(currentGoals => {
              return currentGoals.map(g => {
                 if (g.id === task.goalId) {
                    const completedForGoal = currentTasks.filter(t => t.goalId === g.id && t.completed).length;
                    const isCompleted = completedForGoal >= g.target;
                    if (isCompleted && !g.isCompleted) {
                      setTimeout(() => triggerReward(), 300);
                      addVictory(g.projectId, `Meta Concluída: ${g.title}`);
                    }
                    return { ...g, current: completedForGoal, isCompleted };
                 }
                 return g;
              });
            });
          }
        }
        return currentTasks;
      });
    }, 100);
  };

  useEffect(() => {
    let interval = null;
    if (pomodoroStatus === 'working' && pomodoroEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.round((pomodoroEndTime - now) / 1000);
        
        if (diff <= 0) {
          logTime(pomodoroProjectId, pomodoroCustomMinutes);
          triggerReward();
          
          setPomodoroStatus('victory');
          setPomodoroEndTime(null);
          setPomodoroTimeLeft(pomodoroCustomMinutes * 60);
        } else {
          setPomodoroTimeLeft(diff);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [pomodoroStatus, pomodoroEndTime, pomodoroCustomMinutes, pomodoroProjectId]);

  const setPomodoroState = (status, projectId, endTime, timeLeft, customMinutes) => {
    if (status !== undefined) setPomodoroStatus(status);
    if (projectId !== undefined) setPomodoroProjectId(projectId);
    if (endTime !== undefined) setPomodoroEndTime(endTime);
    if (timeLeft !== undefined) setPomodoroTimeLeft(timeLeft);
    if (customMinutes !== undefined) setPomodoroCustomMinutes(customMinutes);
  };

  const logTime = (projectId, durationInMinutes, pastDateStr = null) => {
    const logDate = pastDateStr || getLocalYMD();
    const newLog = {
      id: Date.now().toString() + Math.random(),
      projectId,
      durationInMinutes: Math.round(durationInMinutes),
      date: logDate,
      timestamp: Date.now()
    };
    setTimeLogs(prev => [...prev, newLog]);
    
    if (!pastDateStr) {
       const proj = projects.find(p => p.id === projectId);
       if (proj) {
           setTimeLogs(currentLogs => {
             const workedToday = currentLogs.filter(l => l.date === logDate && l.projectId === projectId)
                                            .reduce((acc, l) => acc + l.durationInMinutes, 0);
             const target = proj.timeTiers?.excellent || proj.dailyGoal || 60;
             if (workedToday + durationInMinutes >= target) {
                triggerReward();
             }
             return currentLogs;
          });
       }
    }
  };

  const addProductivityRating = (score) => {
    const date = getLocalYMD();
    setProductivityRatings(prev => {
      const filtered = prev.filter(r => r.date !== date);
      return [...filtered, { date, score }];
    });
    if (score >= 4) {
      triggerReward();
    }
  };

  const acceptSuggestion = (id) => {
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      addTask(suggestion.projectId, suggestion.title, null, suggestion.goalId);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    }
  };

  const rejectSuggestion = (sugId) => {
    setSuggestions(prev => prev.filter(s => s.id !== sugId));
  };

  const clearSuggestions = () => setSuggestions([]);
  const clearPendingTasks = () => setTasks(prev => prev.filter(t => t.completed));

  const addGoal = (projectId, title, target, deadline, tasksArray = []) => {
    const goalId = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newGoal = {
      id: goalId,
      projectId,
      title,
      target: tasksArray.length > 0 ? tasksArray.length : (parseInt(target) || 1),
      current: 0,
      deadline: deadline || '',
      isCompleted: false
    };
    setGoals(prev => [...prev, newGoal]);

    if (tasksArray && tasksArray.length > 0) {
      const newTasks = tasksArray.map(tTitle => ({
        id: Date.now().toString() + Math.random(),
        projectId,
        goalId,
        title: tTitle,
        completed: false,
        date: getLocalYMD()
      }));
      setTasks(prev => [...prev, ...newTasks]);
    }
  };

  const updateGoalProgress = (goalId, current) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const isCompleted = current >= g.target;
        if (isCompleted && !g.isCompleted) triggerReward();
        return { ...g, current, isCompleted };
      }
      return g;
    }));
  };

  const deleteGoal = (goalId) => setGoals(prev => prev.filter(g => g.id !== goalId));

  const addQuote = (text) => setQuotes(prev => [...prev, { id: Date.now().toString(), text }]);
  const removeQuote = (id) => setQuotes(prev => prev.filter(q => q.id !== id));

  const handleAIInput = async (text) => {
    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);

    const result = await processAIInput(text, projects, chatMessages, tasks, goals);
    
    if (result.text) {
      const aiMsg = { id: Date.now().toString() + 'ai', role: 'assistant', text: result.text };
      setChatMessages(prev => [...prev, aiMsg]);
    }

    if (result.actions && result.actions.length > 0) {
      let newProjects = [...projects];
      
      result.actions.forEach(action => {
        let projectId = action.projectId;
        
        if (projectId && !newProjects.find(p => p.id === projectId)) {
          let projByName = newProjects.find(p => p.name.toLowerCase() === String(projectId).toLowerCase());
          if (projByName) projectId = projByName.id;
        }
        
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
            goalId: action.goalId,
            title: action.title
          }]);
        }
        else if (action.type === 'LOG_VICTORY' && projectId) {
          addVictory(projectId, action.title || 'Vitória', action.date);
          if (action.title) {
            setSuggestions(prev => prev.filter(s => !s.title.toLowerCase().includes(action.title.toLowerCase())));
          }
        }
        else if (action.type === 'COMPLETE_TASK') {
          setTasks(prev => prev.map(t => {
            if (!t.completed && (t.id === action.taskId || (action.keyword && t.title.toLowerCase().includes(action.keyword.toLowerCase())))) {
              return { ...t, completed: true };
            }
            return t;
          }));
        }
        else if (action.type === 'LOG_PAST_TIME' && projectId) {
          const duration = parseInt(String(action.durationInMinutes).replace(/[^0-9]/g, '')) || 60;
          logTime(projectId, duration, action.date);
        }
        else if (action.type === 'CREATE_PROJECT') {
          const newProj = {
            id: Date.now().toString() + Math.random(),
            name: action.name,
            description: action.description,
            milestones: action.milestones || '',
            status: 'active',
            progress: 0,
            timeTiers: { ok: 10, good: 30, excellent: 60 }
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
        else if (action.type === 'CLEAR_SUGGESTIONS') {
          setSuggestions([]);
        }
        else if (action.type === 'CREATE_GOAL') {
          addGoal(action.projectId || null, action.title, action.target, action.deadline, action.tasks);
        }
        else if (action.type === 'UPDATE_GOAL') {
          updateGoalProgress(action.goalId, action.current);
        }
        else if (action.type === 'CLEAR_PENDING_TASKS') {
          clearPendingTasks();
        }
        else if (action.type === 'CREATE_TASK') {
          addTask(projectId || null, action.title, null, null, action.completed || false);
        }
        else if (action.type === 'EDIT_TASK') {
          editTask(action.taskId, action.updates);
        }
        else if (action.type === 'DELETE_TASK') {
          deleteTask(action.taskId);
        }
        else if (action.type === 'UPDATE_PROJECT') {
          const idx = newProjects.findIndex(p => p.id === action.projectId);
          if (idx !== -1) newProjects[idx] = { ...newProjects[idx], ...action.updates };
        }
      });

      if (newProjects.length !== projects.length || result.actions.some(a => ['ARCHIVE_PROJECT', 'UPDATE_PROGRESS', 'UPDATE_PROJECT', 'ERASE_ALL'].includes(a.type))) {
        setProjects(newProjects);
      }
    }
  };

  const breakDownTask = async (taskTitle) => {
    setIsChatOpen(true);
    await handleAIInput(`Estou travado na tarefa "${taskTitle}". Por favor, quebre ela em 3 sub-tarefas atômicas e ridículas de fáceis e use SUGGEST_TASK.`);
  };

  return (
    <TaskContext.Provider value={{
      projects, addProject, updateProject,
      tasks, addTask, toggleTaskComplete, deleteTask, editTask,
      victories, addVictory,
      timeLogs, logTime,
      chatMessages, handleAIInput,
      suggestions, acceptSuggestion, rejectSuggestion, clearSuggestions,
      goals, addGoal, updateGoalProgress, deleteGoal,
      clearPendingTasks,
      productivityRatings, addProductivityRating,
      quotes, addQuote, removeQuote,
      isLoaded,
      isChatOpen, setIsChatOpen, breakDownTask,
      pomodoroStatus,
      pomodoroEndTime,
      pomodoroTimeLeft,
      pomodoroProjectId,
      pomodoroCustomMinutes,
      setPomodoroState
    }}>
      {children}
    </TaskContext.Provider>
  );
};
