'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { encryptData, decryptData } from '@/lib/utils';

export interface Settings {
  selectedModel: string;
  temperature: number;
  enableSubAgentReasoning: boolean;
  enableInterAgent: boolean;
  enableSequentialMode: boolean;
  enableDebateMode: boolean;
  enableBlackboard: boolean;
  enableVoting: boolean;
  openRouterKey: string;
  tavilyApiKey: string;
  agentModels: Record<string, string>;
  customPrompts: Record<string, string>;
}

interface SettingsContextType extends Settings {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const MODELS = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: 'google' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', provider: 'google' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', provider: 'google' },
  { id: 'qwen/qwen3.6-plus:free', name: 'Qwen 3.6 Plus', provider: 'openrouter' },
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5', provider: 'openrouter' },
  { id: 'stepfun/step-3.5-flash:free', name: 'StepFun 3.5 Flash', provider: 'openrouter' },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large', provider: 'openrouter' },
  { id: 'liquid/lfm-2.5-1.2b-instruct:free', name: 'Liquid LFM 2.5', provider: 'openrouter' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B', provider: 'openrouter' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B', provider: 'openrouter' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM-4.5 Air', provider: 'openrouter' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B', provider: 'openrouter' },
  { id: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini', provider: 'openrouter' },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', name: 'Dolphin Mistral 24B (Sin Censura)', provider: 'openrouter' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 Llama 3.1 405B (Sin Censura)', provider: 'openrouter' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)', provider: 'openrouter' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)', provider: 'openrouter' },
  { id: 'google/gemma-3n-e4b-it:free', name: 'Gemma 3n e4b (Free)', provider: 'openrouter' },
];

const defaultSettings: Settings = {
  selectedModel: 'gemini-3.1-pro-preview',
  temperature: 0.7,
  enableSubAgentReasoning: true,
  enableInterAgent: false,
  enableSequentialMode: false,
  enableDebateMode: false,
  enableBlackboard: false,
  enableVoting: false,
  openRouterKey: '',
  tavilyApiKey: '',
  agentModels: {},
  customPrompts: {},
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ai_hub_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Decrypt sensitive keys
        if (parsed.openRouterKey) parsed.openRouterKey = decryptData(parsed.openRouterKey);
        if (parsed.tavilyApiKey) parsed.tavilyApiKey = decryptData(parsed.tavilyApiKey);
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {}
    } else {
      // Migrate old keys if they exist
      const oldKey = localStorage.getItem('openRouterKey');
      const oldModels = localStorage.getItem('agentModels');
      if (oldKey || oldModels) {
        setSettings(prev => {
          const next = { ...prev };
          if (oldKey) next.openRouterKey = oldKey;
          if (oldModels) {
            try { next.agentModels = JSON.parse(oldModels); } catch (e) {}
          }
          
          const storageCopy = { ...next };
          if (storageCopy.openRouterKey) storageCopy.openRouterKey = encryptData(storageCopy.openRouterKey);
          if (storageCopy.tavilyApiKey) storageCopy.tavilyApiKey = encryptData(storageCopy.tavilyApiKey);
          
          localStorage.setItem('ai_hub_settings', JSON.stringify(storageCopy));
          return next;
        });
      }
    }
    setMounted(true);
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      
      const storageCopy = { ...next };
      if (storageCopy.openRouterKey) storageCopy.openRouterKey = encryptData(storageCopy.openRouterKey);
      if (storageCopy.tavilyApiKey) storageCopy.tavilyApiKey = encryptData(storageCopy.tavilyApiKey);
      
      localStorage.setItem('ai_hub_settings', JSON.stringify(storageCopy));
      return next;
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ ...settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
