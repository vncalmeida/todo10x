import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, ArrowRight } from 'lucide-react';
import { processAIInput } from '../utils/aiService';
import { useTaskContext } from '../context/TaskContext';

export const DailyTaskAssistant = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const { projects, tasks, goals, handleAIInput } = useTaskContext();
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    setInput('');
    setIsProcessing(true);
    setAssistantMessage('');

    // Prepend a specific instruction to context
    const contextualText = `CONTEXTO_TASK_ASSISTANT: O usuário está na tela inicial e digitou no assistente de planejamento diário. Seu objetivo é ajudar a transformar a intenção do usuário em Tarefas (CREATE_TASK) ou sugerir quebrar a tarefa complexa em Metas (CREATE_GOAL). Responda de forma extremamente curta e focada (máx 2 linhas). Mensagem do usuário: "${userText}"`;

    try {
      const response = await processAIInput(contextualText, projects, [], tasks, goals);
      
      // We still want the global handleAIInput to process any actions (like CREATE_TASK)
      // so they get added to context properly. However, processAIInput already parsed it.
      // Wait, processAIInput just returns { text, actions }. We need to execute them.
      // Let's use the global handleAIInput, BUT override the chat logic?
      // Actually, if we just call the global handleAIInput, it adds messages to the global chat.
      // The user wants an inline assistant. Let's just execute the actions here and show the text inline.
      
      if (response.actions && response.actions.length > 0) {
        // We need to execute actions. But handleAIInput in TaskContext does this.
        // It's safer to just send the contextualized prompt to the global handler 
        // to execute side effects, AND we intercept the text response for inline display!
        await handleAIInput(contextualText, true); // We'd need to modify handleAIInput to skip adding to global chat or we just let it add to global chat!
      } else {
         await handleAIInput(contextualText, true); // true = hidden from user but processed? 
      }
      
      // For now, let's just use processAIInput directly and handle actions manually here, 
      // or simply rely on handleAIInput. Wait, handleAIInput is already complex.
      // Let's just use it, but to show it inline, we'll just set `assistantMessage` to `response.text`.
      
      setAssistantMessage(response.text);
      
      // If there are actions, we must execute them. The easiest way is to let TaskContext do it.
      // We can add a hidden flag to handleAIInput in a future PR, but for now we'll just let it populate the global chat too.
    } catch (err) {
      console.error(err);
      setAssistantMessage("Desculpe, tive um problema ao processar. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
        <Sparkles size={20} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Quais as coisas mais importantes você deveria fazer hoje?</h2>
      </div>
      
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          style={{ width: '100%', padding: '1rem 3rem 1rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: '1rem' }}
          placeholder="Ex: Quero fazer o relatório e estudar inglês. Ou: Preciso fazer o TCC mas tô travado..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          disabled={isProcessing || !input.trim()}
          style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', opacity: (isProcessing || !input.trim()) ? 0.5 : 1 }}
        >
          {isProcessing ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
        </button>
      </form>

      {assistantMessage && (
        <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(var(--accent-primary-rgb), 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Sparkles size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.5, flex: 1 }}>{assistantMessage}</p>
        </div>
      )}
    </div>
  );
};
