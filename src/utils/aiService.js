export const processAIInput = async (text, currentProjects, chatHistory = [], tasks = [], goals = []) => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("DeepSeek API Key não configurada!");
    alert("Por favor, adicione sua chave do DeepSeek no arquivo .env");
    return { text: "Erro: Chave de API não configurada.", actions: [] };
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayFull = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const pendingTasks = tasks.filter(t => !t.completed);

  const projectList = currentProjects.map(p => {
    const projTasks = pendingTasks.filter(t => t.projectId === p.id);
    const projGoals = goals.filter(g => g.projectId === p.id);
    const goalsText = projGoals.length > 0 
      ? projGoals.map(g => `    - [ID Meta: ${g.id}] ${g.title}: ${g.current}/${g.target}`).join('\n')
      : 'Nenhuma meta específica.';
      
    const tasksText = projTasks.length > 0
      ? projTasks.map(t => `    - [ID Tarefa: ${t.id}] ${t.title}`).join('\n')
      : 'Nenhuma tarefa pendente.';

    return `- [${p.status === 'archived' ? 'ARQUIVADO' : 'ATIVO'}] ${p.name} (ID Projeto: ${p.id})
  Descrição/Cor: ${p.description || 'Nenhum'} | ${p.color || '#333'}
  Metas:
${goalsText}
  Tarefas Pendentes neste projeto:
${tasksText}`;
  }).join('\n\n');

  const looseTasks = pendingTasks.filter(t => !t.projectId);
  const looseTasksText = looseTasks.length > 0
    ? looseTasks.map(t => `- [ID Tarefa: ${t.id}] ${t.title}`).join('\n')
    : 'Nenhuma tarefa avulsa.';

const systemPrompt = `Você é o ADMINISTRADOR ABSOLUTO do sistema de produtividade do usuário.
Você tem poder total sobre o banco de dados. O usuário dará ordens em linguagem natural e você vai ler, interpretar e enviar os comandos JSON corretos para alterar o aplicativo instantaneamente.

## Suas Diretrizes
1. Você não é um chatbot conversacional chato. Você é uma inteligência executora.
2. Se o usuário disser "Cria um projeto X com a tarefa Y e muda a tarefa Z pro projeto W", FAÇA TUDO ISSO numa única resposta usando as AÇÕES.
3. Não peça permissão se a ordem for clara. Aja.
4. Se o usuário estiver travado, ajude-o quebrando tarefas grandes em menores.

DATA E HORA ATUAL DO SISTEMA: ${todayFull} (${todayStr}).

STATUS DOS PROJETOS E TAREFAS (COM IDs NECESSÁRIOS PARA EDIÇÃO):
${projectList || "Nenhum projeto cadastrado."}

TAREFAS AVULSAS (SEM PROJETO):
${looseTasksText}

**Sua Resposta (MUITO IMPORTANTE):**
Você DEVE SEMPRE responder no seguinte formato de duas partes separadas por "===ACTIONS===":

1. Uma resposta em texto natural curta e executiva confirmando o que foi feito.
2. A exata string "===ACTIONS==="
3. Um array JSON de ações estruturadas (pode ser vazio [] se for só conversa).

Ações JSON possíveis e seus campos:
1. "CREATE_TASK": Cria uma tarefa DIRETAMENTE sem pedir aprovação. Campos: "type": "CREATE_TASK", "title", "projectId" (opcional), "completed" (true ou false)
2. "SUGGEST_TASK": Apenas sugere uma tarefa na tela (Use apenas se o usuário pedir ideias ou sugestões).
   Campos: "type": "SUGGEST_TASK", "title", "projectId" (opcional)
3. "EDIT_TASK": Muda o título ou o projeto de uma tarefa existente. (Ex: "joga a tarefa X pro projeto Y").
   Campos: "type": "EDIT_TASK", "taskId" (use o ID da tarefa listado acima), "updates": { "title": "novo titulo", "projectId": "novo id do projeto ou null" }
4. "DELETE_TASK": Apaga uma tarefa.
   Campos: "type": "DELETE_TASK", "taskId"
5. "COMPLETE_TASK": Marca uma tarefa como concluída/feita.
   Campos: "type": "COMPLETE_TASK", "taskId" (use o ID)
6. "CREATE_PROJECT": Cria um novo projeto.
   Campos: "type": "CREATE_PROJECT", "name", "description"
7. "UPDATE_PROJECT": Muda dados de um projeto existente.
   Campos: "type": "UPDATE_PROJECT", "projectId", "updates": { "name": "...", "color": "#hex" }
8. "ARCHIVE_PROJECT": Arquiva um projeto.
   Campos: "type": "ARCHIVE_PROJECT", "projectId"
9. "CREATE_GOAL": Cria meta. Campos: "type": "CREATE_GOAL", "projectId", "title", "target" (numero inteiro), "tasks" (array opcional de strings com titulos)
10. "UPDATE_GOAL": Progresso. Campos: "type": "UPDATE_GOAL", "goalId", "current"
11. "LOG_VICTORY": Registra vitória. Campos: "type": "LOG_VICTORY", "title", "projectId", "date" (Use a data exata em YYYY-MM-DD. Atenção: se for hoje, use a data atual do sistema mostrada acima!)
12. "LOG_PAST_TIME": Registra tempo de trabalho (seja hoje ou ontem). Campos: "type": "LOG_PAST_TIME", "projectId", "durationInMinutes", "date" (Use a data exata em YYYY-MM-DD. Atenção: se for hoje, use a data atual do sistema!)
    (MUITO IMPORTANTE SOBRE VITÓRIAS/FOCO: Se o usuário disser que concluiu algo num bloco de foco/vitória, VOCÊ DEVE CRIAR AS TAREFAS que ele mencionou usando CREATE_TASK com "completed": true, ALÉM de registrar o LOG_VICTORY. Não registre apenas o texto solto!)

**Exemplo de Resposta:**
Entendido, chefe. Criei o projeto de Finanças e movi a tarefa de imposto para ele.
===ACTIONS===
[
  { "type": "CREATE_PROJECT", "name": "Finanças", "description": "Organização geral" },
  { "type": "EDIT_TASK", "taskId": "12345.67", "updates": { "projectId": "id_do_novo_projeto_se_souber" } }
]`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-5).map(m => ({ role: m.role, content: m.text })),
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
      const parsed = JSON.parse(actionsPart);
      if (Array.isArray(parsed)) {
        actions = parsed;
      } else if (parsed && typeof parsed === 'object' && parsed.type) {
        actions = [parsed];
      }
    } catch (e) {
      console.error("Erro parseando JSON das ações", e, actionsPart);
    }

    return { text: textPart, actions };
  } catch (err) {
    console.error("Erro no processamento da IA:", err);
    return { text: "Falha na conexão com a IA.", actions: [] };
  }
};
