import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  activeAgentName: string;
}

export const ChatInput = ({ input, setInput, handleSend, isLoading, activeAgentName }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  return (
    <div className="p-3 md:p-6 bg-transparent">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-md p-2 focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Mensaje para ${activeAgentName}...`}
          className="flex-1 p-2 md:p-3 bg-transparent resize-none outline-none text-sm md:text-base max-h-32 custom-scrollbar text-gray-900 dark:text-gray-100 placeholder-gray-500"
          rows={1}
          style={{ minHeight: '44px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-2 md:p-2.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed rounded-full transition-colors shrink-0 mb-0.5"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="text-center mt-2 md:mt-3 hidden sm:block">
        <p className="text-[10px] md:text-xs text-gray-400 font-medium">
          La IA puede cometer errores. Considera verificar la información importante.
        </p>
      </div>
    </div>
  );
};
