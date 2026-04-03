'use client';

import { Bot, X, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentChatId: string;
  onSelectChat: (id: string) => void;
}

export function Sidebar({ isOpen, onClose, currentChatId, onSelectChat }: SidebarProps) {
  const chats = useLiveQuery(() => db.chats.orderBy('updatedAt').reverse().toArray());

  const handleNewChat = async () => {
    const newId = Date.now().toString();
    await db.chats.add({ id: newId, title: 'Nuevo Chat', updatedAt: Date.now() });
    onSelectChat(newId);
    if (window.innerWidth < 768) onClose();
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await db.messages.where({ chatId: id }).delete();
    await db.chats.delete(id);
    if (currentChatId === id) {
      const remainingChats = await db.chats.orderBy('updatedAt').reverse().toArray();
      if (remainingChats.length > 0) {
        onSelectChat(remainingChats[0].id);
      } else {
        const newId = Date.now().toString();
        await db.chats.add({ id: newId, title: 'Nuevo Chat', updatedAt: Date.now() });
        onSelectChat(newId);
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex justify-between items-center">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <div className="w-6 h-6 rounded-md bg-black dark:bg-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white dark:text-black" />
            </div>
            Nuevo Chat
            <Plus className="w-4 h-4 ml-auto text-gray-500" />
          </button>
          <button 
            onClick={onClose} 
            className="md:hidden p-2 ml-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {chats?.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id);
                if (window.innerWidth < 768) onClose();
              }}
              className={clsx(
                "group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-sm",
                currentChatId === chat.id 
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium" 
                  : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              )}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MessageSquare className={clsx(
                  "w-4 h-4 shrink-0",
                  currentChatId === chat.id ? "text-gray-900 dark:text-gray-100" : "text-gray-500"
                )} />
                <span className="truncate">{chat.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                title="Eliminar chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {chats?.length === 0 && (
            <div className="text-center p-4 text-gray-500 text-sm">
              No hay chats recientes.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
