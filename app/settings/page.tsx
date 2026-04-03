'use client';

import { useSettings, MODELS } from '@/components/settings-provider';
import { agents } from '@/lib/agents';
import { ArrowLeft, SlidersHorizontal, Key, Brain, GitMerge, ListOrdered, Bot, Users, CheckCircle2, ClipboardList, Scale } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkGeminiKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasGeminiKey(selected);
        } catch (e) {
          // Fallback
        }
      }
    };
    checkGeminiKey();
  }, []);

  const handleConnectGemini = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasGeminiKey(true);
      } catch (e) {
        console.error("Error opening key selector:", e);
      }
    }
  };
  const {
    selectedModel,
    temperature,
    enableSubAgentReasoning,
    enableInterAgent,
    enableSequentialMode,
    enableDebateMode,
    enableBlackboard,
    enableVoting,
    openRouterKey,
    tavilyApiKey,
    agentModels,
    customPrompts,
    updateSetting,
  } = useSettings();

  const handleAgentModelChange = (agentId: string, modelId: string) => {
    updateSetting('agentModels', { ...agentModels, [agentId]: modelId });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/80 bg-white/80 backdrop-blur-md flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link 
          href="/chat"
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-inner border border-blue-100/50">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">Opciones Avanzadas</h1>
          <p className="text-xs md:text-sm text-gray-500">Configura el comportamiento de los agentes</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* API Keys Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Key className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Credenciales y APIs</h2>
          </div>
          
          <div className="space-y-6">
            {/* Gemini API Key */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <label className="text-sm font-semibold text-gray-800 block mb-2">
                Google Gemini API Key
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-gray-600 flex-1">
                  Requerido para usar los modelos de Gemini. Se gestiona de forma segura mediante tu cuenta de Google Cloud.
                </p>
                {hasGeminiKey ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Cuenta Conectada
                  </div>
                ) : (
                  <button
                    onClick={handleConnectGemini}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shrink-0 shadow-sm"
                  >
                    Conectar Cuenta
                  </button>
                )}
              </div>
            </div>

            {/* OpenRouter */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={openRouterKey}
                onChange={(e) => updateSetting('openRouterKey', e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full text-sm bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Permite usar modelos de IA externos. <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Consigue tu API Key aquí</a>.
              </p>
            </div>

            {/* Tavily AI */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Tavily AI API Key (Búsqueda Profunda)
              </label>
              <input
                type="password"
                value={tavilyApiKey}
                onChange={(e) => updateSetting('tavilyApiKey', e.target.value)}
                placeholder="Introduce tu API Key de Tavily"
                className="w-full text-sm bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <div className="text-xs text-gray-500 mt-2 space-y-2">
                <p>Motor de búsqueda avanzado diseñado para Agentes de IA.</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Regístrate en <a href="https://tavily.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Tavily AI</a>.</li>
                  <li>Copia tu API Key y pégala arriba.</li>
                </ol>
                <p className="italic text-gray-600 mt-2">
                  Nota: Te regalan 1000 búsquedas al mes al registrarte. Si se te acaba las solicitudes, te dejamos un pequeño truco. Si no tienes para pagar... Puedes hacer otra cuenta... Shhhhh🤫
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Settings Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6 text-gray-800">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Configuración Global</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Modelo Global por Defecto
              </label>
              <select 
                value={selectedModel}
                onChange={(e) => updateSetting('selectedModel', e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <optgroup label="Google Gemini">
                  {MODELS.filter(m => m.provider === 'google').map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
                <optgroup label="OpenRouter (Free)">
                  {MODELS.filter(m => m.provider === 'openrouter').map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex justify-between mb-3">
                <span>Temperatura</span>
                <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md">{temperature.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0" max="2" step="0.1" 
                value={temperature} 
                onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Más preciso (0.0)</span>
                <span>Más creativo (2.0)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Behaviors Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6 text-gray-800">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Comportamiento de Agentes</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex gap-3">
                <Brain className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">
                    Razonamiento de Subagentes
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">Permite ver cómo piensan los subagentes usando etiquetas &lt;think&gt;. Desactívalo para ahorrar tokens y acelerar las respuestas.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableSubAgentReasoning}
                  onChange={(e) => updateSetting('enableSubAgentReasoning', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex gap-3">
                <GitMerge className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">
                    Comunicación entre Agentes
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">Permite que los subagentes deleguen tareas a otros agentes de forma autónoma. (Experimental)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableInterAgent}
                  onChange={(e) => updateSetting('enableInterAgent', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex gap-3">
                <ListOrdered className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">
                    Modo Equipo (Secuencial)
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">Los agentes trabajan en cadena. Cada uno lee lo que hizo el anterior en lugar de ejecutarse todos al mismo tiempo.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableSequentialMode}
                  onChange={(e) => updateSetting('enableSequentialMode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex gap-3">
                <Users className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">
                    Modo Debate (Consenso Multi-Agente)
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">El Coordinador actuará como moderador, convocando a múltiples expertos para debatir soluciones complejas y emitir un veredicto unificado.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableDebateMode}
                  onChange={(e) => updateSetting('enableDebateMode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="flex gap-3">
                <ClipboardList className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">
                    Pizarra Compartida (Modo Agencia)
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">Crea un espacio de memoria temporal donde los agentes pueden anotar y leer descubrimientos clave durante la tarea. Fomenta la sinergia.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableBlackboard}
                  onChange={(e) => updateSetting('enableBlackboard', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="flex gap-3">
                <Scale className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">
                    Sistema de Votación (Resolución de Conflictos)
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">Obliga a los subagentes a emitir un voto justificado sobre la mejor solución. El Coordinador usará estos votos para tomar la decisión final.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enableVoting}
                  onChange={(e) => updateSetting('enableVoting', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Models per Agent Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-800">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Modelos Específicos por Agente</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Asigna un modelo de IA específico a cada agente. Si no seleccionas uno, usará el modelo global por defecto.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-800 truncate" title={agent.name}>{agent.name}</span>
                <select
                  value={agentModels[agent.id] || ''}
                  onChange={(e) => handleAgentModelChange(agent.id, e.target.value)}
                  className="text-sm bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 outline-none w-full focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="">Usar Modelo Global</option>
                  <optgroup label="Google Gemini">
                    {MODELS.filter(m => m.provider === 'google').map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="OpenRouter (Free)">
                    {MODELS.filter(m => m.provider === 'openrouter').map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Prompts Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-800">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Instrucciones Personalizadas (System Prompts)</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Añade instrucciones específicas para cada agente. Estas reglas se sumarán a su comportamiento base.</p>
          
          <div className="space-y-6">
            {agents.map(agent => (
              <div key={agent.id} className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-800" title={agent.name}>{agent.name} ({agent.role})</span>
                <textarea
                  value={customPrompts?.[agent.id] || ''}
                  onChange={(e) => updateSetting('customPrompts', { ...customPrompts, [agent.id]: e.target.value })}
                  placeholder={`Instrucciones extra para ${agent.name}...`}
                  className="w-full text-sm bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-y min-h-[80px]"
                />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
