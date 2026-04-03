import React, { memo } from 'react';
import { SubAgent, Message } from '@/types/agent';
import { clsx } from 'clsx';
import { Bot, Loader2 } from 'lucide-react';
import { MessageContent } from './message-content';

export const MessageItem = memo(({ msg, activeAgent, agentsList, onOpenArtifact }: { msg: Message, activeAgent: SubAgent, agentsList: SubAgent[], onOpenArtifact?: (artifact: any) => void }) => {
  const msgAgent = agentsList.find(a => a.id === msg.agentId) || activeAgent;
  const isUser = msg.role === 'user';

  return (
    <div 
      className={clsx(
        "flex w-full mx-auto max-w-3xl px-4 md:px-6",
        isUser ? "justify-end" : "justify-start",
        msg.isSubTask && "ml-8 md:ml-12 opacity-95" // Indent subtasks
      )}
    >
      <div className={clsx(
        "flex gap-4 max-w-[85%] md:max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        
        {/* Avatar - Only show for AI */}
        {!isUser && (
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
            msg.isSubTask ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600 border border-blue-200"
          )}>
            <Bot className="w-5 h-5" />
          </div>
        )}

        {/* Message Bubble/Content */}
        <div className={clsx(
          "min-w-0",
          isUser 
            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-5 py-3 rounded-3xl" 
            : "py-1.5 text-gray-800 dark:text-gray-200",
          msg.isSubTask && !isUser && "border-l-2 border-indigo-200 pl-4"
        )}>
          {!isUser && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {msgAgent.name} {msg.isSubTask && <span className="text-gray-500 font-normal text-xs">(Sub-tarea)</span>}
              </span>
              {msg.isStreaming && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
            </div>
          )}
          <div className={clsx("w-full", isUser && "prose-p:m-0")}>
            <MessageContent msg={msg} activeAgent={activeAgent} agentsList={agentsList} onOpenArtifact={onOpenArtifact} />
          </div>
        </div>
      </div>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';
