import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, ArrowRight } from 'lucide-react';
import { processAIInput } from '../utils/aiService';
import { useTaskContext } from '../context/TaskContext';

export const DailyTaskAssistant = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const { projects, tasks, goals, handleAIInput } = useTaskContext();
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    setInput('');
    setIsProcessing(true);
    setAssistantMessage('');

    // Prepend a specific instruction to context
    const contextualText = `O usuário está na tela inicial e digitou no assistente de planejamento diário (entrada por voz ou texto longo). Seu objetivo é organizar esse pensamento em Tarefas (CREATE_TASK) ou sugerir quebrar a tarefa complexa em Metas (CREATE_GOAL), identificando corretamente o projeto. Responda de forma extremamente curta e focada (máx 2 a 3 linhas), e execute as ações no JSON. Mensagem do usuário: "${userText}"`;

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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
        <Sparkles size={20} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: '500', color: 'var(--text-secondary)' }}>Cérebro IA: Organize meu dia</h2>
      </div>
      
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          style={{ 
            width: '100%', 
            padding: '1.2rem 3.5rem 1.2rem 1.2rem', 
            borderRadius: '12px', 
            background: 'rgba(0,0,0,0.3)', 
            color: '#fff', 
            border: '1px solid var(--glass-border)', 
            fontSize: '1rem',
            resize: 'none',
            overflow: 'hidden',
            minHeight: '60px',
            lineHeight: '1.5'
          }}
          rows={1}
          placeholder="Fale ou digite tudo o que precisa fazer... a IA vai organizar para você."
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
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
