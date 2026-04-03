import { Code, Copy, Check, Maximize2 } from 'lucide-react';
import { useState } from 'react';

export function ArtifactCard({ language, content, onOpen }: { language: string, content: string, onOpen: () => void }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 min-w-0">
          <Code className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="font-semibold text-sm truncate">Artefacto {language.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleCopy} 
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors shrink-0" 
            title="Copiar código"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            onClick={onOpen} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0"
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Abrir Canvas</span>
            <span className="sm:hidden">Abrir</span>
          </button>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-gray-500 font-mono line-clamp-2 bg-gray-50 break-all">
        {content.split('\n').slice(0, 3).join('\n')}...
      </div>
    </div>
  );
}
