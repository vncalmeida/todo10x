export const processAIInput = async (text, currentProjects) => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("DeepSeek API Key não configurada!");
    alert("Por favor, adicione sua chave do DeepSeek no arquivo .env (VITE_DEEPSEEK_API_KEY)");
    return [];
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const projectList = currentProjects.map(p => `- ${p.name}`).join('\n');

  const systemPrompt = `Você é um assistente de produtividade especializado em analisar linguagem natural e extrair tarefas e ações estruturadas.
Datas de Referência:
- Hoje: ${todayStr}
- Amanhã: ${tomorrowStr}
- Ontem: ${yesterdayStr}

Projetos existentes do usuário:
${projectList || "Nenhum projeto ainda."}

Sua única função é receber o texto do usuário e retornar um array JSON contendo as ações. NÃO retorne nenhum texto extra, apenas o JSON puro, começando com [ e terminando com ].

Tipos de ação possíveis e regras matemáticas de data:
1. CREATE_TASK: O usuário quer criar uma nova tarefa futura ou para hoje.
   - Campos: "type": "CREATE_TASK", "title" (string), "targetDate" (YYYY-MM-DD), "projectName" (string).
   - "targetDate": Faça os cálculos! Se o usuário disser "daqui 30 dias", some 30 dias à data de Hoje (${todayStr}) e retorne o formato YYYY-MM-DD exato. Se for "próxima terça", ache a data. Se não houver data, use ${todayStr}.

2. COMPLETE_TASK: O usuário está dizendo que concluiu uma tarefa que JÁ EXISTIA na lista dele hoje.
   - Campos: "type": "COMPLETE_TASK", "keyword" (string para buscar na lista).

3. LOG_PAST_TASK: O usuário está relatando uma tarefa que ele JÁ FEZ no passado (ex: "ontem eu fiz a reunião" ou "semana passada eu entreguei o projeto").
   - Campos: "type": "LOG_PAST_TASK", "title" (string), "targetDate" (YYYY-MM-DD do dia que ele fez), "projectName" (string).
   - O sistema criará a tarefa e automaticamente a marcará como concluída na data informada, para que fique no histórico.

Exemplo 1: "Vou fazer o roteiro do Projeto 1 amanhã e também terminei a edição daquele vídeo hoje"
[
  { "type": "CREATE_TASK", "title": "Fazer roteiro", "targetDate": "${tomorrowStr}", "projectName": "Projeto 1" },
  { "type": "COMPLETE_TASK", "keyword": "edição de vídeo" }
]

Exemplo 2: "Cara, daqui 30 dias eu tenho que pagar o imposto da Empresa. Ah, e ontem eu finalizei o design da landing page!"
[
  { "type": "CREATE_TASK", "title": "Pagar imposto", "targetDate": "YYYY-MM-DD", "projectName": "Empresa" }, // (Calcule a data correta somando 30 dias a Hoje)
  { "type": "LOG_PAST_TASK", "title": "Finalizar design da landing page", "targetDate": "${yesterdayStr}", "projectName": "Empresa" }
]

Sempre responda estritamente com JSON válido.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error("Erro na API:", await response.text());
      alert("Erro ao contatar a IA (DeepSeek). Olhe o console.");
      return [];
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    if (content.startsWith('```json')) content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (content.startsWith('```')) content = content.replace(/^```/, '').replace(/```$/, '').trim();

    return JSON.parse(content);
  } catch (err) {
    console.error("Erro no processamento da IA:", err);
    alert("Falha na comunicação com a IA ou formato de resposta inválido.");
    return [];
  }
};
