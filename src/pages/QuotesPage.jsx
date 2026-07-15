import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Quote as QuoteIcon, Plus, Trash2 } from 'lucide-react';

export const QuotesPage = () => {
  const { quotes, addQuote, removeQuote } = useTaskContext();
  const [newQuote, setNewQuote] = useState('');

  const handleAdd = () => {
    if (newQuote.trim()) {
      addQuote(newQuote.trim());
      setNewQuote('');
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '800px', paddingBottom: '4rem' }}>
      <header className="header glass-panel" style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <QuoteIcon size={28} /> Minhas Frases Inspiradoras
        </h1>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Adicionar nova frase</h3>
        <div className="input-group">
          <input 
            type="text" 
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Ex: Só ação gera poder..."
            style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}
          />
          <button className="btn-small" style={{ background: 'var(--accent-gradient)', color: '#fff' }} onClick={handleAdd}>
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {quotes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>Nenhuma frase cadastrada.</p>
        ) : (
          quotes.map(q => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#fff' }}>"{q.text}"</p>
              <button className="btn-icon" onClick={() => removeQuote(q.id)}>
                <Trash2 size={18} color="var(--danger)" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
