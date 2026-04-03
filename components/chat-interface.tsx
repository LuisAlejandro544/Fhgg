'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { SubAgent, Artifact } from '@/types/agent';
import { agents } from '@/lib/agents';
import { Bot, Menu, Settings, Trash2 } from 'lucide-react';
import { useSettings, MODELS } from '@/components/settings-provider';
import Link from 'next/link';
import { MessageItem } from './chat/message-item';
import { ChatInput } from './chat/chat-input';
import { useChatOrchestrator } from '@/hooks/use-chat-orchestrator';
import { CanvasPanel } from './canvas-panel';
import { extractArtifacts } from '@/lib/artifacts';

interface ChatInterfaceProps {
  activeAgent: SubAgent;
  onOpenSidebar: () => void;
  chatId: string;
}

import { QuickActions } from './chat/quick-actions';

export function ChatInterface({ activeAgent, onOpenSidebar, chatId }: ChatInterfaceProps) {
  const {
    input,
    setInput,
    isLoading,
    messages,
    handleSend,
    handleClearChat
  } = useChatOrchestrator(activeAgent, chatId);

  const { selectedModel, updateSetting } = useSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  const allArtifacts = useMemo(() => extractArtifacts(messages), [messages]);

  const handleOpenArtifact = useCallback((artifact: Artifact) => {
    const existing = allArtifacts.find(a => a.content === artifact.content) || artifact;
    setActiveArtifact(existing);
    setIsCanvasOpen(true);
  }, [allArtifacts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex h-full overflow-hidden relative w-full">
      {/* Chat Area */}
      <div className={`flex flex-col h-full bg-white dark:bg-gray-950 transition-all duration-300 ${isCanvasOpen ? 'hidden lg:flex lg:w-1/2 border-r border-gray-200 dark:border-gray-800' : 'w-full'}`}>
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md flex items-center gap-3 md:gap-4 z-10 sticky top-0 shrink-0">
          <button 
            onClick={onOpenSidebar}
            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0">
            <Bot className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight">{activeAgent.name}</h1>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">{activeAgent.role}</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2 relative">
            <button
              onClick={handleClearChat}
              className="p-1.5 md:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Limpiar Conversación"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <select 
              value={selectedModel}
              onChange={(e) => updateSetting('selectedModel', e.target.value)}
              className="text-xs md:text-sm bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-none text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 outline-none focus:ring-0 cursor-pointer max-w-[120px] md:max-w-[180px] truncate transition-colors font-medium"
              title="Modelo Global (Por defecto)"
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

            <Link 
              href="/settings"
              className="p-1.5 md:p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Opciones Avanzadas"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 bg-white dark:bg-gray-950 pb-24">
          {messages.map((msg) => (
            <MessageItem key={msg.id} msg={msg} activeAgent={activeAgent} agentsList={agents} onOpenArtifact={handleOpenArtifact} />
          ))}
          {messages.length <= 1 && !messages.some(m => m.role === 'user') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <QuickActions 
                onSelectAction={(prompt) => {
                  setInput(prompt);
                }} 
              />
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <ChatInput 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isLoading={isLoading}
          activeAgentName={activeAgent.name}
        />
      </div>

      {/* Canvas Area */}
      {isCanvasOpen && activeArtifact && (
        <div className="w-full lg:w-1/2 h-full absolute lg:relative z-40 right-0">
          <CanvasPanel 
            artifact={activeArtifact} 
            allArtifacts={allArtifacts} 
            onClose={() => setIsCanvasOpen(false)} 
            onSelectArtifact={setActiveArtifact} 
          />
        </div>
      )}
    </div>
  );
}
