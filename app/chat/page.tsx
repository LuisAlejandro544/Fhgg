'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ChatInterface } from '@/components/chat-interface';
import { agents } from '@/lib/agents';
import { db } from '@/lib/db';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // El Coordinador es siempre el agente activo principal
  const activeAgent = agents[0];

  useEffect(() => {
    const initDefaultChat = async () => {
      const chats = await db.chats.orderBy('updatedAt').reverse().toArray();
      if (chats.length > 0) {
        setCurrentChatId(chats[0].id);
      } else {
        const newId = Date.now().toString();
        await db.chats.add({ id: newId, title: 'Nuevo Chat', updatedAt: Date.now() });
        setCurrentChatId(newId);
      }
    };
    initDefaultChat();
  }, []);

  if (!currentChatId) return null;

  return (
    <main className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden font-sans relative">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
      />
      <ChatInterface 
        activeAgent={activeAgent} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
        chatId={currentChatId}
      />
    </main>
  );
}
