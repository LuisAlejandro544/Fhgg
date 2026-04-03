import React, { useState } from 'react';
import { Message } from '@/types/agent';
import { clsx } from 'clsx';
import { Bot, ChevronDown, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMarkdownComponents } from './markdown-components';

export const NestedCallItem = ({ call, msg }: { call: any, msg: Message }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSearch = call.agentId === 'Buscador Web';

  return (
    <div className={clsx(
      "border rounded-xl shadow-sm overflow-hidden",
      isSearch ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-indigo-100"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between p-3 text-left transition-colors",
          isSearch ? "hover:bg-emerald-100/50" : "hover:bg-indigo-50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center",
            isSearch ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
          )}>
            {isSearch ? <Globe className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
          </div>
          <span className={clsx(
            "font-semibold text-sm",
            isSearch ? "text-emerald-900" : "text-indigo-900"
          )}>{call.agentId}</span>
          {call.isStreaming && <span className="flex h-2 w-2 relative ml-1"><span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isSearch ? "bg-emerald-400" : "bg-indigo-400")}></span><span className={clsx("relative inline-flex rounded-full h-2 w-2", isSearch ? "bg-emerald-500" : "bg-indigo-500")}></span></span>}
        </div>
        <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180", isSearch ? "text-emerald-600" : "text-indigo-600")} />
      </button>
      {isOpen && (
        <div className={clsx(
          "p-4 pt-0 prose prose-sm max-w-none break-words [&>p]:whitespace-pre-wrap",
          isSearch ? "text-emerald-800" : "text-gray-700"
        )}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(msg)}>
            {call.isStreaming ? call.text + ' ▍' : call.text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
