export const processAIInput = async (text, currentProjects, chatHistory = []) => {
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
  
  const projectList = currentProjects.map(p => `- ${p.name} (Meta: ${p.goal || 'Nenhuma meta definida'})`).join('\n');

  const systemPrompt = `Você é um Assistente de Engajamento e Produtividade. O usuário vai relatar o que fez, quais foram suas vitórias diárias ou pedir ajuda.
Data de Hoje: ${todayStr}

Projetos ativos e suas metas:
${projectList || "Nenhum projeto ainda."}

**Sua Personalidade:**
Seja motivador, conciso, aja como um parceiro de accountability. Parabenize-o pelas vitórias.

**Sua Resposta (MUITO IMPORTANTE):**
Você DEVE SEMPRE responder no seguinte formato de duas partes separadas por "===ACTIONS===":

1. Uma resposta em texto natural conversando com o usuário, motivando-o e sugerindo 1 ou 2 próximos passos com base nas metas do projeto.
2. A exata string "===ACTIONS==="
3. Um array JSON de ações estruturadas (pode ser vazio []).

Ações JSON possíveis:
1. "SUGGEST_TASK": Sugerir uma tarefa (o usuário terá que aceitar depois).
   Campos: "type": "SUGGEST_TASK", "title", "projectName"
2. "LOG_VICTORY": Registrar uma vitória que ele acabou de relatar no chat.
   Campos: "type": "LOG_VICTORY", "title", "projectName", "date": "${todayStr}"
3. "COMPLETE_TASK": Concluir uma tarefa que já estava na lista dele e ele disse que fez.
   Campos: "type": "COMPLETE_TASK", "keyword"
4. "LOG_PAST_TIME": O usuário está dizendo que trabalhou em um projeto (ex: "ontem trabalhei 3 horas no projeto X").
   Campos: "type": "LOG_PAST_TIME", "projectName", "durationInMinutes" (inteiro), "date" (YYYY-MM-DD deduzido, ex: ontem = ${yesterdayStr})

**Exemplo de Resposta:**
Muito bom! Trabalhar 50 minutos nos canais é um ótimo avanço para a meta de engajamento. Continue assim! Sugiro que amanhã você revise as métricas iniciais.
===ACTIONS===
[
  { "type": "LOG_VICTORY", "title": "Trabalhei 50 mins nos canais e configurei X", "projectName": "Geral", "date": "${todayStr}" },
  { "type": "SUGGEST_TASK", "title": "Revisar métricas iniciais", "projectName": "Geral" }
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
