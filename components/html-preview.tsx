'use client';

import { useState } from 'react';
import { Maximize2, Minimize2, Code, Eye, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface HtmlPreviewProps {
  code: string;
}

export function HtmlPreview({ code }: HtmlPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-black/80 flex flex-col p-4 sm:p-8 backdrop-blur-sm"
    : "relative w-full border border-gray-200 rounded-xl overflow-hidden my-4 bg-white shadow-sm flex flex-col";

  const contentClasses = isFullscreen
    ? "flex-1 bg-white rounded-b-xl overflow-hidden shadow-2xl"
    : "w-full h-[400px] overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center gap-1 bg-gray-200/50 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('preview')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              viewMode === 'preview' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Eye className="w-3.5 h-3.5" /> Vista Previa
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              viewMode === 'code' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Code className="w-3.5 h-3.5" /> Código
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Copiar código"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={contentClasses}>
        {viewMode === 'preview' ? (
          <iframe
            srcDoc={code}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-popups"
            title="HTML Preview"
          />
        ) : (
          <div className="w-full h-full overflow-auto bg-gray-900 p-4">
            <pre className="text-gray-100 text-sm font-mono m-0">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
