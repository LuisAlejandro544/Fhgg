import { useState } from 'react';
import { X, Code, Play, FileCode2, LayoutPanelLeft } from 'lucide-react';
import { Artifact } from '@/types/agent';

interface CanvasPanelProps {
  artifact: Artifact;
  allArtifacts: Artifact[];
  onClose: () => void;
  onSelectArtifact: (artifact: Artifact) => void;
}

export function CanvasPanel({ artifact, allArtifacts, onClose, onSelectArtifact }: CanvasPanelProps) {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [showFiles, setShowFiles] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-2xl lg:shadow-none w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFiles(!showFiles)} 
            className={`p-2 rounded-lg transition-colors ${showFiles ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`} 
            title="Administrador de archivos"
          >
            <LayoutPanelLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[200px]">{artifact.title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-200/50 p-1 rounded-lg">
            <button 
              onClick={() => setView('preview')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Play className="w-4 h-4" /> <span className="hidden sm:inline">Vista Previa</span>
            </button>
            <button 
              onClick={() => setView('code')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Code className="w-4 h-4" /> <span className="hidden sm:inline">Código</span>
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* File Manager Sidebar */}
        {showFiles && (
          <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col absolute inset-y-0 left-0 z-10 shadow-lg md:relative md:shadow-none">
            <div className="p-3 border-b border-gray-200 font-semibold text-sm text-gray-700 flex justify-between items-center shrink-0">
              Archivos del Chat
              <button onClick={() => setShowFiles(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {allArtifacts.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No hay artefactos guardados.</p>
              ) : (
                allArtifacts.map(art => (
                  <button
                    key={art.id}
                    onClick={() => { onSelectArtifact(art); setShowFiles(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${artifact.id === art.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FileCode2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{art.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 bg-white overflow-hidden relative">
          {view === 'preview' ? (
            <iframe
              srcDoc={artifact.content}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-forms allow-popups"
              title="HTML Preview"
            />
          ) : (
            <div className="h-full overflow-auto p-4 bg-gray-900 text-gray-100 font-mono text-sm custom-scrollbar">
              <pre><code>{artifact.content}</code></pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
