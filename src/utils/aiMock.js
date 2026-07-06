// Mock AI for processing natural language into actions
export const processAIInput = async (text, currentProjects) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const actions = [];
  
  // Basic mock logic using regex/keywords to simulate NLP
  const lines = text.split(/[,\n.]+/).filter(l => l.trim().length > 0);
  
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  
  lines.forEach(line => {
    line = line.trim().toLowerCase();
    
    // Extração da data alvo
    let targetDate = today.toISOString().split('T')[0];
    if (line.includes('amanhã')) {
      targetDate = tomorrow.toISOString().split('T')[0];
      // Limpa a palavra para não ficar no título da tarefa
      line = line.replace('amanhã', '').replace('para', '').trim();
    } else if (line.includes('ontem')) {
      targetDate = yesterday.toISOString().split('T')[0];
      line = line.replace('ontem', '').trim();
    } else if (line.includes('hoje')) {
      targetDate = today.toISOString().split('T')[0];
      line = line.replace('hoje', '').trim();
    }
    
    // Check if it's a completion command: "eu fiz X" or "concluí Y"
    if (line.includes('eu fiz') || line.includes('concluída') || line.includes('concluí')) {
      const keyword = line.replace('eu fiz', '').replace('já', '').replace('concluí', '').trim();
      actions.push({
        type: 'COMPLETE_TASK',
        keyword: keyword.substring(0, 10), // match first few chars
        targetDate
      });
      return;
    }

    // Default to CREATE_TASK
    let targetProject = null;
    let targetProjectId = null;
    
    // Check if project is mentioned
    for (const p of currentProjects) {
      if (line.includes(p.name.toLowerCase())) {
        targetProject = p.name;
        targetProjectId = p.id;
        // Limpa o nome do projeto do título
        line = line.replace(p.name.toLowerCase(), '').replace('do', '').replace('para o', '').trim();
        break;
      }
    }
    
    // If not found but explicitly mentioned "projeto X"
    if (!targetProject) {
      const projMatch = line.match(/projeto ([a-z0-9\s]+)/i);
      if (projMatch) {
        targetProject = "Projeto " + projMatch[1].trim();
        line = line.replace(projMatch[0], '').trim();
      } else {
        // Fallback generic project or default
        targetProject = "Geral";
      }
    }
    
    // Extract title (remove project mention from title)
    let title = line.charAt(0).toUpperCase() + line.slice(1);
    
    actions.push({
      type: 'CREATE_TASK',
      title: title || "Nova Tarefa",
      projectId: targetProjectId,
      projectName: targetProject,
      targetDate: targetDate
    });
  });

  return actions;
};
