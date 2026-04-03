import Dexie, { Table } from 'dexie';
import { Message } from '@/types/agent';

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  summary?: string;
}

export class ChatDatabase extends Dexie {
  messages!: Table<Message, string>;
  chats!: Table<ChatSession, string>;

  constructor() {
    super('ChatDatabase');
    this.version(2).stores({
      messages: 'id, chatId, role, agentId',
      chats: 'id, updatedAt'
    });
  }
}

export const db = new ChatDatabase();
