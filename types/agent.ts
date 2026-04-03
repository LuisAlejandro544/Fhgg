export interface SubAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  iconName: string;
}

export interface Artifact {
  id: string;
  messageId: string;
  title: string;
  language: string;
  content: string;
}

export interface Message {
  id: string;
  chatId?: string;
  role: 'user' | 'model';
  text: string;
  agentId?: string;
  isStreaming?: boolean;
  isSubTask?: boolean;
  tools?: { name: string; content: string }[];
  nestedCalls?: { agentId: string; text: string; isStreaming?: boolean }[];
}
