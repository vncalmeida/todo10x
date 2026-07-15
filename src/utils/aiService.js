export const processAIInput = async (text, currentProjects, chatHistory = [], tasks = [], goals = []) => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("DeepSeek API Key não configurada!");
    alert("Por favor, adicione sua chave do DeepSeek no arquivo .env");
    return { text: "Erro: Chave de API não configurada.", actions: [] };
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const projectList = currentProjects.map(p => {
    const projTasks = tasks.filter(t => t.projectId === p.id);
    const completed = projTasks.filter(t => t.completed).length;
    const total = projTasks.length;
    const projGoals = goals.filter(g => g.projectId === p.id);
    const goalsText = projGoals.length > 0 
      ? projGoals.map(g => `    - ${g.title}: ${g.current}/${g.target} (Prazo: ${g.deadline || 'Nenhum'})`).join('\n')
      : 'Nenhuma meta numérica específica.';
    return `- [${p.status === 'archived' ? 'ARQUIVADO' : 'ATIVO'}] ${p.name}
  Meta Geral: ${p.description || 'Nenhum'}
  Metas Numéricas Específicas:
${goalsText}
  Milestones: ${p.milestones || 'Nenhum'}
  Progresso de Tarefas: ${p.progress}% (${completed}/${total} tarefas)
  ID do Projeto (USE ESTE ID NAS AÇÕES): ${p.id}`;
  }).join('\n\n');

  const systemPrompt = `Você é uma Secretária Executiva de Produtividade Gamificada.
O usuário vai relatar o que fez, pedir estatísticas (responda com base nos dados reais), criar projetos ou arquivar.
Data de Hoje: ${todayStr}

STATUS DOS PROJETOS E ESTATÍSTICAS REAIS:
${projectList || "Nenhum projeto cadastrado."}

**Sua Personalidade & Regras de Interação:**
- Seja eficiente, motivadora e parceira de accountability.
- REGRA 1 (Esqueceu o projeto): Se o usuário relatar uma tarefa/vitória, mas NÃO informar para qual projeto foi (e não for óbvio pelo histórico ou pelo aviso do Pomodoro), NÃO registre a vitória ainda. Apenas responda perguntando: "Para qual projeto você fez essa tarefa?".

**Sua Resposta (MUITO IMPORTANTE):**
Você DEVE SEMPRE responder no seguinte formato de duas partes separadas por "===ACTIONS===":

1. Uma resposta em texto natural (motivando, informando estatísticas, ou confirmando ações).
2. A exata string "===ACTIONS==="
3. Um array JSON de ações estruturadas (pode ser vazio []).

Ações JSON possíveis:
1. "SUGGEST_TASK": Sugerir uma tarefa (o usuário terá que aceitar depois).
   Campos: "type": "SUGGEST_TASK", "title", "projectId" (use o ID acima, ou omita se for uma tarefa Geral/Solta do dia a dia)
2. "LOG_VICTORY": Registrar uma vitória que ele acabou de relatar.
   Campos: "type": "LOG_VICTORY", "title", "projectId" (OBRIGATÓRIO. Se não souber, use a REGRA 1), "date": "${todayStr}"
3. "COMPLETE_TASK": Concluir uma tarefa que já estava na lista dele e ele disse que fez.
   Campos: "type": "COMPLETE_TASK", "keyword"
4. "LOG_PAST_TIME": O usuário está dizendo que trabalhou num projeto (ex: "ontem trabalhei 3 horas").
   Campos: "type": "LOG_PAST_TIME", "projectId", "durationInMinutes" (inteiro), "date" (YYYY-MM-DD deduzido, ex: ontem = ${yesterdayStr})
   (MUITO IMPORTANTE: Se o usuário disser que trabalhou num projeto e detalhar o que fez, você DEVE retornar a ação LOG_PAST_TIME somada a múltiplas ações LOG_VICTORY ou COMPLETE_TASK para cada coisa que ele fez. Assim o histórico das tarefas fica salvo!)
5. "CREATE_PROJECT": O usuário pediu para criar um novo projeto.
   Campos: "type": "CREATE_PROJECT", "name", "description" (a meta principal), "milestones" (texto corrido com os marcos)
   (Dica: Se ele pedir para criar um projeto e já listar as tarefas, retorne um array com múltiplas ações: primeiro o CREATE_PROJECT e depois vários SUGGEST_TASK usando o campo "projectName" para vinculá-las ao projeto recém criado).
6. "ARCHIVE_PROJECT": O usuário quer arquivar/encerrar um projeto.
   Campos: "type": "ARCHIVE_PROJECT", "projectId"
7. "UPDATE_PROGRESS": O usuário quer definir manualmente a % de conclusão de um projeto (ex: "Coloque o projeto X em 22%").
   Campos: "type": "UPDATE_PROGRESS", "projectId", "progress" (numero de 0 a 100)
8. "ERASE_ALL": O usuário pediu EXPLICITAMENTE para apagar/resetar todos os dados, projetos e tarefas (ex: "Delete tudo", "Resete os projetos").
   Campos: "type": "ERASE_ALL"
9. "CLEAR_SUGGESTIONS": O usuário pediu para limpar as sugestões de tarefas do chat.
   Campos: "type": "CLEAR_SUGGESTIONS"
10. "CLEAR_PENDING_TASKS": O usuário pediu para apagar todas as tarefas pendentes ("Próximos Passos") da Home.
    Campos: "type": "CLEAR_PENDING_TASKS"
11. "CREATE_GOAL": O usuário quer criar uma meta numérica específica para um projeto.
    Campos: "type": "CREATE_GOAL", "projectId", "title", "target" (numero inteiro), "deadline" (data YYYY-MM-DD opcional)
12. "UPDATE_GOAL": O usuário quer atualizar o progresso de uma meta numérica (ex: "Fiz 10 aulas da meta X").
    Campos: "type": "UPDATE_GOAL", "goalId" (procure o ID da meta no histórico ou peça para ele), "current" (novo número inteiro de progresso)

**Exemplo de Resposta:**
Projeto "Reforma" criado com sucesso! Já anotei os marcos que você pediu.
===ACTIONS===
[
  { "type": "CREATE_PROJECT", "name": "Reforma", "description": "Terminar a obra do quarto", "milestones": "1. Comprar tinta, 2. Pintar, 3. Móveis" }
]`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-5).map(m => ({ role: m.role, content: m.text })), // Ultimos 5 dialogos
    { role: 'user', content: text }
  ];

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      console.error("Erro na API:", await response.text());
      return { text: "Ocorreu um erro ao falar com o cérebro.", actions: [] };
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    let textPart = content;
    let actionsPart = "[]";

    if (content.includes("===ACTIONS===")) {
      const parts = content.split("===ACTIONS===");
      textPart = parts[0].trim();
      let rawJson = parts[1].trim();
      if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (rawJson.startsWith('```')) rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();
      actionsPart = rawJson;
    }

    let actions = [];
    try {
      actions = JSON.parse(actionsPart);
    } catch (e) {
      console.error("Erro parseando JSON das ações", e, actionsPart);
    }

    return { text: textPart, actions };
  } catch (err) {
    console.error("Erro no processamento da IA:", err);
    return { text: "Falha na conexão com a IA.", actions: [] };
  }
};
