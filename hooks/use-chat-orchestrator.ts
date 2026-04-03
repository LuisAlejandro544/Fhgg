import { useState, useEffect } from 'react';
import { Message, SubAgent } from '@/types/agent';
import { agents } from '@/lib/agents';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSettings, MODELS } from '@/components/settings-provider';
import { performWebSearch } from '@/lib/search';
import { parseMessageText } from '@/lib/message-parser';
import { generateUnifiedStream } from '@/lib/ai-stream';

export function useChatOrchestrator(activeAgent: SubAgent, chatId: string) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentChatId = chatId;
  
  const dbMessages = useLiveQuery(
    () => db.messages.where({ chatId: currentChatId }).toArray(),
    [currentChatId]
  );

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messages = dbMessages || localMessages;
  const currentChatSession = useLiveQuery(() => db.chats.get(currentChatId), [currentChatId]);

  const {
    selectedModel,
    temperature,
    enableSubAgentReasoning,
    enableInterAgent,
    enableSequentialMode,
    enableDebateMode,
    openRouterKey,
    tavilyApiKey,
    agentModels,
    customPrompts,
  } = useSettings();

  useEffect(() => {
    if (dbMessages) {
      setLocalMessages(dbMessages);
    }
  }, [dbMessages]);

  const updateMessage = async (id: string, updater: (m: Message) => Message) => {
    setLocalMessages(prev => prev.map(m => m.id === id ? updater(m) : m));
    const msg = await db.messages.get(id);
    if (msg) {
      await db.messages.put(updater(msg));
    }
  };

  const addMessage = async (msg: Message) => {
    const newMsg = { ...msg, chatId: currentChatId };
    setLocalMessages(prev => [...prev, newMsg]);
    await db.messages.add(newMsg);
  };

  const handleClearChat = async () => {
    await db.messages.where({ chatId: currentChatId }).delete();
    await db.chats.update(currentChatId, { summary: undefined });
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      chatId: currentChatId,
      role: 'model',
      text: `¡Hola! Soy **${activeAgent.name}** (${activeAgent.role}). ${activeAgent.description} ¿En qué puedo ayudarte hoy?`,
      agentId: activeAgent.id
    };
    setLocalMessages([welcomeMsg]);
    await db.messages.add(welcomeMsg);
  };

  useEffect(() => {
    const initChat = async () => {
      const chatExists = await db.chats.get(currentChatId);
      if (!chatExists) {
        await db.chats.add({ id: currentChatId, title: 'Nuevo Chat', updatedAt: Date.now() });
      }

      const count = await db.messages.where({ chatId: currentChatId }).count();
      if (count === 0) {
        const welcomeMsg: Message = {
          id: Date.now().toString(),
          chatId: currentChatId,
          role: 'model',
          text: `¡Hola! Soy **${activeAgent.name}** (${activeAgent.role}). ${activeAgent.description} ¿En qué puedo ayudarte hoy?`,
          agentId: activeAgent.id
        };
        setLocalMessages([welcomeMsg]);
        await db.messages.add(welcomeMsg);
      }
    };
    initChat();
  }, [activeAgent, currentChatId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if a Google model is selected and if the user has connected their key
    const currentAgentModel = agentModels[activeAgent.id] || selectedModel;
    const isGoogleModel = MODELS.find(m => m.id === currentAgentModel)?.provider === 'google';
    
    if (isGoogleModel && typeof window !== 'undefined' && window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // We assume they connected it, but if they didn't, the API call will just fail gracefully below
        }
      } catch (e) {
        console.error("Error checking/opening key selector:", e);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim()
    };

    await addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const currentDateString = new Date().toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const timeContext = `\n\nCONTEXTO DEL SISTEMA:\nHoy es ${currentDateString}. Usa esta información para responder a referencias temporales como 'hoy', 'mañana' o 'este año'.`;

    const streamWithAutoContinue = async (
      modelId: string,
      baseMessages: any[],
      config: any,
      onUpdate: (text: string) => void
    ) => {
      let fullText = '';
      let isCutOff = false;
      let continueCount = 0;
      const MAX_CONTINUES = 3;

      do {
        isCutOff = false;
        let currentMessages = [...baseMessages];
        
        if (fullText) {
           // Si el texto es muy largo, enviamos solo la última parte para no exceder el límite de contexto del modelo
           const contextText = fullText.length > 8000 ? "..." + fullText.slice(-8000) : fullText;
           currentMessages.push({ role: 'model', parts: [{ text: contextText }] });
           currentMessages.push({ role: 'user', parts: [{ text: "Tu respuesta anterior se cortó por límite de longitud. Por favor, continúa EXACTAMENTE desde donde te quedaste, sin repetir lo anterior ni añadir introducciones." }] });
        }

        const stream = generateUnifiedStream(modelId, currentMessages, config, openRouterKey);
        
        for await (const chunk of stream) {
          fullText += chunk.text;
          onUpdate(fullText);
          
          const reason = chunk.finishReason ? String(chunk.finishReason).toUpperCase() : '';
          if (reason && (reason.includes('MAX_TOKENS') || reason.includes('LENGTH') || reason.includes('TOKEN') || reason === 'LIMIT')) {
            isCutOff = true;
          }
        }
        
        continueCount++;
      } while (isCutOff && continueCount < MAX_CONTINUES);
      
      return fullText;
    };

    try {
      const chat = await db.chats.get(currentChatId);
      if (chat && chat.title === 'Nuevo Chat') {
        const newTitle = userMessage.text.slice(0, 30) + (userMessage.text.length > 30 ? '...' : '');
        await db.chats.update(currentChatId, { title: newTitle, updatedAt: Date.now() });
      } else {
        await db.chats.update(currentChatId, { updatedAt: Date.now() });
      }

      const MESSAGE_LIMIT = 15;
      let contextMessages = messages;
      let currentSummary = currentChatSession?.summary || '';

      if (messages.length > MESSAGE_LIMIT) {
        const messagesToSummarize = messages.slice(0, -5);
        const summaryPrompt = `Resume los siguientes mensajes de la conversación. Concéntrate en los objetivos del usuario, las decisiones tomadas y el estado actual del proyecto. Sé conciso pero detallado.\n\n${messagesToSummarize.map(m => `${m.role}: ${m.text}`).join('\n')}`;
        
        const summaryModel = agentModels['coordinator'] || selectedModel;
        const summaryStream = generateUnifiedStream(
          summaryModel,
          [{ role: 'user', parts: [{ text: summaryPrompt }] }],
          { temperature: 0.3 },
          openRouterKey
        );

        let newSummary = '';
        for await (const chunk of summaryStream) {
          newSummary += chunk.text;
        }

        currentSummary = newSummary;
        await db.chats.update(currentChatId, { summary: currentSummary });
        
        await db.messages.where({ chatId: currentChatId }).delete();
        
        const summaryMsg: Message = {
          id: Date.now().toString(),
          chatId: currentChatId,
          role: 'model',
          text: `[TOOL:summary|${currentSummary}]\nHe resumido nuestra conversación anterior para mantener mi memoria fresca. ¡Podemos continuar sin problemas!`,
          agentId: 'coordinator'
        };
        
        const recentKeptMessages = messages.slice(-5);
        
        setLocalMessages([summaryMsg, ...recentKeptMessages, userMessage]);
        await db.messages.add(summaryMsg);
        for (const m of recentKeptMessages) {
            await db.messages.add(m);
        }
        await db.messages.add(userMessage);
        
        contextMessages = [summaryMsg, ...recentKeptMessages, userMessage];
      }

      const recentMessages = contextMessages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const initMsgId = (Date.now() + 1).toString();
      await addMessage({
        id: initMsgId,
        role: 'model',
        text: '',
        agentId: activeAgent.id,
        isStreaming: true
      });

      const currentAgentModel = agentModels[activeAgent.id] || selectedModel;
      
      let systemInstructionWithMemory = activeAgent.systemInstruction + timeContext;
      if (customPrompts?.[activeAgent.id]) {
          systemInstructionWithMemory += `\n\nINSTRUCCIONES PERSONALIZADAS DEL USUARIO:\n${customPrompts[activeAgent.id]}`;
      }
      if (currentSummary) {
          systemInstructionWithMemory += `\n\nMEMORIA A LARGO PLAZO (Resumen de la conversación anterior):\n${currentSummary}\n\nUsa esta memoria para mantener el contexto de lo que se ha discutido y decidido anteriormente.`;
      }
      if (enableDebateMode && activeAgent.id === 'coordinator') {
          systemInstructionWithMemory += `\n\nMODO DEBATE (CONSENSO MULTI-AGENTE) ACTIVADO: Tu rol ahora es de Moderador de un Comité de Expertos. Cuando el usuario plantee un problema complejo, tome decisiones de arquitectura, o pida ideas, DEBES convocar a 2 o más agentes expertos (usando [CALL:id|prompt]) para que den sus perspectivas desde diferentes ángulos (ej. código vs seguridad vs diseño). No des la respuesta final tú mismo de inmediato; primero delega a los expertos para que debatan.`;
      }

      const initText = await streamWithAutoContinue(
        currentAgentModel,
        [
          ...recentMessages,
          { role: 'user', parts: [{ text: userMessage.text }] }
        ],
        {
          systemInstruction: systemInstructionWithMemory,
          temperature: temperature,
        },
        (text) => updateMessage(initMsgId, m => ({ ...m, text }))
      );

      updateMessage(initMsgId, m => ({ ...m, isStreaming: false }));

      if (activeAgent.id === 'coordinator') {
        const { calls } = parseMessageText(initText);

        if (calls.length > 0) {
          const subAgentResults: { agentId: string; prompt: string; result: string }[] = [];
          
          const executeSubAgent = async (call: { agentId: string; prompt: string }, index: number, accumulatedContext: string = "") => {
            if (!enableSequentialMode) {
              await new Promise(resolve => setTimeout(resolve, index * 1000));
            }
            const subAgent = agents.find(a => a.id === call.agentId);
            if (!subAgent) return { agentId: call.agentId, prompt: call.prompt, result: 'Error: Agente no encontrado.' };

            const subMsgId = (Date.now() + 10 + index).toString();
            await addMessage({
              id: subMsgId,
              role: 'model',
              text: '',
              agentId: subAgent.id,
              isStreaming: true,
              isSubTask: true
            });

            let subText = '';
            try {
              let subInstruction = subAgent.systemInstruction + timeContext;
              if (customPrompts?.[subAgent.id]) {
                  subInstruction += `\n\nINSTRUCCIONES PERSONALIZADAS DEL USUARIO:\n${customPrompts[subAgent.id]}`;
              }
              if (!enableSubAgentReasoning) {
                subInstruction += "\n\nREGLA ESTRICTA: TIENES PROHIBIDO usar etiquetas <think>. No razones en voz alta. Da tu respuesta final directamente para ahorrar tokens.";
              }
              if (enableInterAgent) {
                const availableAgents = agents.filter(a => a.id !== 'coordinator').map(a => a.id).join(', ');
                subInstruction += `\n\nCOMUNICACIÓN ENTRE AGENTES ACTIVADA: Si necesitas que otro agente haga una parte de tu tarea, DEBES llamarlo usando EXACTAMENTE este formato: [CALL:id_del_agente|instrucción]. ¡Es obligatorio cerrar con el corchete ']'! Ejemplo: [CALL:code|Por favor, escribe una función en Python para calcular Fibonacci]. Agentes disponibles: ${availableAgents}. Solo hazlo si es estrictamente necesario.`;
              }
              if (enableSequentialMode && accumulatedContext) {
                subInstruction += `\n\nMODO EQUIPO SECUENCIAL ACTIVADO: A continuación se muestra el trabajo realizado por los agentes anteriores en esta misma cadena. Úsalo como contexto para tu tarea si es relevante:\n\n${accumulatedContext}`;
              }
              const subAgentModel = agentModels[subAgent.id] || selectedModel;
              
              subText = await streamWithAutoContinue(
                subAgentModel,
                [{ role: 'user', parts: [{ text: call.prompt }] }],
                {
                  systemInstruction: subInstruction,
                  temperature: temperature,
                },
                (text) => updateMessage(subMsgId, m => ({ ...m, text }))
              );

              if (enableInterAgent) {
                const { calls: secCalls, cleanText: cleanedSubText, searches: secSearches } = parseMessageText(subText);
                
                if (secSearches.length > 0) {
                  const nestedCallsData: { agentId: string; text: string; isStreaming?: boolean }[] = [];
                  updateMessage(subMsgId, m => ({ ...m, text: cleanedSubText, nestedCalls: nestedCallsData }));

                  let combinedSearchResults = "";

                  for (const searchObj of secSearches) {
                    const query = searchObj.query;
                    const searchIndex = nestedCallsData.length;
                    nestedCallsData.push({ agentId: 'Buscador Web', text: `Buscando en la web: "${query}"...`, isStreaming: true });
                    updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));

                    try {
                      const searchResultText = await performWebSearch(query, {
                        tavilyKey: tavilyApiKey
                      });

                      nestedCallsData[searchIndex].text = searchResultText;
                      nestedCallsData[searchIndex].isStreaming = false;
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                      
                      combinedSearchResults += `RESULTADOS PARA "${query}":\n${searchResultText}\n\n`;

                    } catch (e) {
                      nestedCallsData[searchIndex].text = `Error al realizar la búsqueda web: ${e instanceof Error ? e.message : 'Desconocido'}`;
                      nestedCallsData[searchIndex].isStreaming = false;
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                      combinedSearchResults += `RESULTADOS PARA "${query}":\nError al buscar.\n\n`;
                    }
                  }

                  const searchContextPrompt = `RESULTADOS DE BÚSQUEDA WEB:\n${combinedSearchResults}\nINSTRUCCIÓN CRÍTICA Y OBLIGATORIA: Tienes prohibido devolver los resultados de búsqueda en bruto. DEBES leer la información anterior, extraer los datos solicitados (como precios exactos, porcentajes, nombres de empresas), y redactar un informe final con tus propias palabras. Si te pidieron un precio, escribe el número exacto. Tu respuesta debe ser el análisis final, no un log de búsqueda.`;
                  
                  const newSubText = await streamWithAutoContinue(
                    subAgentModel,
                    [
                      { role: 'user', parts: [{ text: call.prompt }] },
                      { role: 'model', parts: [{ text: subText }] },
                      { role: 'user', parts: [{ text: searchContextPrompt }] }
                    ],
                    {
                      systemInstruction: subInstruction,
                      temperature: temperature
                    },
                    (text) => updateMessage(subMsgId, m => ({ ...m, text: cleanedSubText + '\n\n' + text }))
                  );

                  subText = cleanedSubText + '\n\n' + newSubText;
                }

                const { calls: finalSecCalls, cleanText: finalCleanedSubText } = parseMessageText(subText);

                if (finalSecCalls.length > 0) {
                  let currentNestedCalls: { agentId: string; text: string; isStreaming?: boolean }[] = [];
                  setLocalMessages(prev => {
                    const msg = prev.find(m => m.id === subMsgId);
                    if (msg && msg.nestedCalls) {
                      currentNestedCalls = [...msg.nestedCalls];
                    }
                    return prev;
                  });
                  
                  const nestedCallsData = currentNestedCalls;
                  updateMessage(subMsgId, m => ({ ...m, text: finalCleanedSubText, nestedCalls: nestedCallsData }));

                  for (const secCall of finalSecCalls) {
                    const normalizedSecAgentId = secCall.agentId.toLowerCase().trim();
                    const secAgent = agents.find(a => a.id.toLowerCase() === normalizedSecAgentId);
                    
                    if (secAgent) {
                      const secAgentModel = agentModels[secAgent.id] || selectedModel;
                      
                      const recentHistory = messages.slice(-3).map(m => `${m.role === 'user' ? 'Usuario' : m.agentId}: ${m.text}`).join('\n');
                      const contextPrompt = `CONTEXTO DE LA CONVERSACIÓN:\n${recentHistory}\n\nINSTRUCCIÓN ORIGINAL DEL USUARIO:\n${input}\n\nTAREA ASIGNADA POR ${subAgent.name}:\n${secCall.prompt}`;

                      const callIndex = nestedCallsData.length;
                      nestedCallsData.push({ agentId: secAgent.name, text: '', isStreaming: true });
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));

                      const secText = await streamWithAutoContinue(
                        secAgentModel,
                        [{ role: 'user', parts: [{ text: contextPrompt }] }],
                        {
                          systemInstruction: secAgent.systemInstruction + (!enableSubAgentReasoning ? "\n\nREGLA: NO uses <think>." : ""),
                          temperature: temperature
                        },
                        (text) => {
                          nestedCallsData[callIndex].text = text;
                          updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                        }
                      );
                      
                      nestedCallsData[callIndex].isStreaming = false;
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                    } else {
                      nestedCallsData.push({ agentId: 'Sistema', text: `⚠️ El agente '${secCall.agentId}' no fue encontrado.`, isStreaming: false });
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                    }
                  }
                  subText = finalCleanedSubText;
                  updateMessage(subMsgId, m => ({ ...m, text: subText }));
                }
              } else {
                const { searches: secSearches, cleanText: cleanedSubText } = parseMessageText(subText);
                if (secSearches.length > 0) {
                  const nestedCallsData: { agentId: string; text: string; isStreaming?: boolean }[] = [];
                  updateMessage(subMsgId, m => ({ ...m, text: cleanedSubText, nestedCalls: nestedCallsData }));

                  let combinedSearchResults = "";

                  for (const searchObj of secSearches) {
                    const query = searchObj.query;
                    const searchIndex = nestedCallsData.length;
                    nestedCallsData.push({ agentId: 'Buscador Web', text: `Buscando en la web: "${query}"...`, isStreaming: true });
                    updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));

                    try {
                      const searchResultText = await performWebSearch(query, {
                        tavilyKey: tavilyApiKey
                      });

                      nestedCallsData[searchIndex].text = searchResultText;
                      nestedCallsData[searchIndex].isStreaming = false;
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                      
                      combinedSearchResults += `RESULTADOS PARA "${query}":\n${searchResultText}\n\n`;

                    } catch (e) {
                      nestedCallsData[searchIndex].text = `Error al realizar la búsqueda web: ${e instanceof Error ? e.message : 'Desconocido'}`;
                      nestedCallsData[searchIndex].isStreaming = false;
                      updateMessage(subMsgId, m => ({ ...m, nestedCalls: [...nestedCallsData] }));
                      combinedSearchResults += `RESULTADOS PARA "${query}":\nError al buscar.\n\n`;
                    }
                  }

                  const searchContextPrompt = `RESULTADOS DE BÚSQUEDA WEB:\n${combinedSearchResults}\nINSTRUCCIÓN CRÍTICA Y OBLIGATORIA: Tienes prohibido devolver los resultados de búsqueda en bruto. DEBES leer la información anterior, extraer los datos solicitados (como precios exactos, porcentajes, nombres de empresas), y redactar un informe final con tus propias palabras. Si te pidieron un precio, escribe el número exacto. Tu respuesta debe ser el análisis final, no un log de búsqueda.`;
                  
                  const newSubText = await streamWithAutoContinue(
                    subAgentModel,
                    [
                      { role: 'user', parts: [{ text: call.prompt }] },
                      { role: 'model', parts: [{ text: subText }] },
                      { role: 'user', parts: [{ text: searchContextPrompt }] }
                    ],
                    {
                      systemInstruction: subInstruction,
                      temperature: temperature
                    },
                    (text) => updateMessage(subMsgId, m => ({ ...m, text: cleanedSubText + '\n\n' + text }))
                  );
                  
                  subText = cleanedSubText + '\n\n' + newSubText;
                  
                  const { cleanText: finalCleanedSubText } = parseMessageText(subText);
                  subText = finalCleanedSubText;
                  updateMessage(subMsgId, m => ({ ...m, text: subText }));
                }
              }

            } catch (e) {
              subText = '⚠️ Error al ejecutar la tarea del subagente (Posible límite de cuota de la API).';
              updateMessage(subMsgId, m => ({ ...m, text: subText }));
            }
            
            updateMessage(subMsgId, m => ({ ...m, isStreaming: false }));
            return { agentId: subAgent.name, prompt: call.prompt, result: subText };
          };

          if (enableSequentialMode) {
            let accumulatedContext = "";
            for (let i = 0; i < calls.length; i++) {
              const result = await executeSubAgent(calls[i], i, accumulatedContext);
              subAgentResults.push(result);
              accumulatedContext += `\n--- Trabajo de ${result.agentId} ---\n${result.result}\n`;
            }
          } else {
            const results = await Promise.all(calls.map((call, index) => executeSubAgent(call, index)));
            subAgentResults.push(...results);
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
          const finalMsgId = (Date.now() + 100).toString();
          await addMessage({
            id: finalMsgId,
            role: 'model',
            text: '',
            agentId: activeAgent.id,
            isStreaming: true
          });

          let reviewPrompt = `Los subagentes han respondido a sus tareas (incluyendo datos de búsquedas web si fueron necesarias):\n\n${subAgentResults.map(r => `--- RESPUESTA DE ${r.agentId} ---\n${r.result}`).join('\n\n')}\n\nINSTRUCCIÓN CRÍTICA: Usa <think>...</think> para revisar estas respuestas, planificar el tono y estructurar el documento. Considera toda la información proporcionada como válida. Tu trabajo es leerlos, extraer la información útil y redactar la respuesta final. DESPUÉS de cerrar la etiqueta </think>, escribe tu respuesta final y genera el documento solicitado (usando [TOOL:pdf|...]).`;

          if (enableDebateMode) {
            reviewPrompt += `\n\nMODO DEBATE ACTIVADO: Como Moderador del Comité, analiza críticamente los puntos de vista de cada agente, destaca los pros y contras de sus enfoques, y emite un VEREDICTO FINAL consensuado, robusto y unificado.`;
          } else {
            reviewPrompt += `\n\nTu respuesta final debe ser emotiva, pulida y unificar el trabajo de los subagentes.`;
          }

          const currentAgentModel = agentModels[activeAgent.id] || selectedModel;
          let systemInstructionWithMemory = activeAgent.systemInstruction + timeContext;
          if (customPrompts?.[activeAgent.id]) {
              systemInstructionWithMemory += `\n\nINSTRUCCIONES PERSONALIZADAS DEL USUARIO:\n${customPrompts[activeAgent.id]}`;
          }
          if (currentChatSession?.summary) {
              systemInstructionWithMemory += `\n\nMEMORIA A LARGO PLAZO (Resumen de la conversación anterior):\n${currentChatSession.summary}\n\nUsa esta memoria para mantener el contexto de lo que se ha discutido y decidido anteriormente.`;
          }
          if (enableDebateMode && activeAgent.id === 'coordinator') {
              systemInstructionWithMemory += `\n\nMODO DEBATE (CONSENSO MULTI-AGENTE) ACTIVADO: Eres el Moderador del Comité.`;
          }

          const finalText = await streamWithAutoContinue(
            currentAgentModel,
            [
              ...recentMessages,
              { role: 'user', parts: [{ text: userMessage.text }] },
              { role: 'model', parts: [{ text: initText }] },
              { role: 'user', parts: [{ text: reviewPrompt }] }
            ],
            {
              systemInstruction: systemInstructionWithMemory,
              temperature: temperature,
            },
            (text) => updateMessage(finalMsgId, m => ({ ...m, text }))
          );

          updateMessage(finalMsgId, m => ({ ...m, isStreaming: false }));
        }
      }

    } catch (error) {
      console.error('Error generating response:', error);
      
      localMessages.forEach(async (m) => {
        if (m.isStreaming) {
          await updateMessage(m.id, msg => ({ ...msg, isStreaming: false }));
        }
      });

      await addMessage({
        id: (Date.now() + 1000).toString(),
        role: 'model',
        text: `⚠️ **Error al procesar la solicitud.**\n\nDetalle: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nSi usas OpenRouter, verifica tu API Key. Si usas Gemini, asegúrate de haber conectado tu cuenta de Google en las Opciones Avanzadas o verifica tu límite de cuota.`,
        agentId: activeAgent.id
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    input,
    setInput,
    isLoading,
    messages,
    handleSend,
    handleClearChat
  };
}
