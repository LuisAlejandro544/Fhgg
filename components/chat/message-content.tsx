import React, { useState, useEffect } from 'react';
import { SubAgent, Message } from '@/types/agent';
import { clsx } from 'clsx';
import { Brain, ChevronDown, GitMerge, Bot, FileText, FileArchive, Eye, Download, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import { parseMessageText } from '@/lib/message-parser';
import { getMarkdownComponents } from './markdown-components';
import { NestedCallItem } from './nested-call';

export const MessageContent = ({ msg, activeAgent, agentsList, onOpenArtifact }: { msg: Message, activeAgent: SubAgent, agentsList: SubAgent[], onOpenArtifact?: (artifact: any) => void }) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);
  const [isSubTaskOpen, setIsSubTaskOpen] = useState(true);
  const [previewContent, setPreviewContent] = useState<{title: string, content: string} | null>(null);

  const { thought, cleanText, calls, tools } = parseMessageText(msg.text);

  const handleDownloadPDF = (content: string, filename: string = 'documento_generado.pdf') => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 15);
    if (!filename.endsWith('.pdf')) filename += '.pdf';
    doc.save(filename);
  };

  const handlePreviewPDF = (content: string, filename: string) => {
    setPreviewContent({ title: filename, content });
  };

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full">
      {/* Thought Process Box */}
      {thought && (
        <div className="mb-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)} 
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Brain className="w-4 h-4" />
            {isThoughtOpen ? 'Ocultar razonamiento' : 'Mostrar razonamiento'}
            {msg.isStreaming && <span className="flex h-2 w-2 relative ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span></span>}
            <ChevronDown className={clsx("w-3 h-3 transition-transform ml-1", isThoughtOpen && "rotate-180")} />
          </button>
          {isThoughtOpen && (
            <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 font-mono leading-relaxed prose prose-sm max-w-none overflow-x-auto">
              <ReactMarkdown>{thought}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Sub-agent calls indicators */}
      {calls.length > 0 && (
        <div className="flex flex-col gap-2 my-2">
          {calls.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              <GitMerge className="w-4 h-4 shrink-0" />
              <span className="font-medium shrink-0">Delegando a {c.agentId}:</span>
              <span className="truncate opacity-80">{c.prompt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content (For User or Coordinator) */}
      {cleanText && !msg.isSubTask && (
        <div className={clsx(
          "prose prose-sm md:prose-base max-w-none break-words w-full min-w-0 [&>p]:whitespace-pre-wrap dark:prose-invert",
          msg.role === 'user' ? "text-gray-900 dark:text-gray-100" : ""
        )}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(msg, onOpenArtifact)}>
            {msg.isStreaming && !thought ? cleanText + ' ▍' : cleanText}
          </ReactMarkdown>
        </div>
      )}

      {/* Sub Task Content (Collapsible) */}
      {cleanText && msg.isSubTask && (
        <div className="mt-2 flex flex-col min-w-0 w-full">
           <button 
             onClick={() => setIsSubTaskOpen(!isSubTaskOpen)} 
             className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors w-fit"
           >
             <Bot className="w-4 h-4" />
             Aporte de {agentsList.find(a => a.id === msg.agentId)?.name || 'Subagente'}
             <ChevronDown className={clsx("w-4 h-4 transition-transform ml-1", isSubTaskOpen && "rotate-180")} />
           </button>
           {isSubTaskOpen && (
             <div className={clsx(
               "mt-3 prose prose-sm md:prose-base max-w-none break-words w-full min-w-0 text-gray-800 dark:text-gray-200 [&>p]:whitespace-pre-wrap dark:prose-invert",
               msg.role === 'user' ? "text-gray-900 dark:text-gray-100" : ""
             )}>
               <ReactMarkdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(msg, onOpenArtifact)}>
                 {msg.isStreaming && !thought ? cleanText + ' ▍' : cleanText}
               </ReactMarkdown>
             </div>
           )}
        </div>
      )}

      {/* Nested Calls (Inter-Agent Communication) */}
      {msg.nestedCalls && msg.nestedCalls.length > 0 && (
        <div className="flex flex-col gap-3 mt-4 pl-4 border-l-2 border-indigo-200">
          <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
            <GitMerge className="w-4 h-4" />
            Respuestas de Subagentes Consultados
          </div>
          {msg.nestedCalls.map((call, idx) => (
            <NestedCallItem key={idx} call={call} msg={msg} />
          ))}
        </div>
      )}

      {/* Tools Rendering */}
      {tools.length > 0 && (
        <div className="flex flex-col gap-2 mt-3">
          {tools.map((t, i) => {
            if (t.name === 'pdf') {
              const filename = t.filename || 'documento_generado.pdf';
              return (
                <div key={i} className="flex flex-col gap-3 bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm w-full sm:w-fit max-w-full overflow-hidden">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-1 min-w-0">
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="truncate break-all">{filename}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePreviewPDF(t.content, filename)}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4" />
                      Previsualizar
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(t.content, filename)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm flex-1 sm:flex-none"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  </div>
                </div>
              );
            }
            if (t.name === 'summary') {
              return (
                <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-amber-900">
                  <FileArchive className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 text-amber-800">Resumen de la Conversación</h4>
                    <div className="text-sm opacity-90 prose prose-sm prose-amber max-w-none">
                      <ReactMarkdown>{t.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Content Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 truncate">
                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                <span className="truncate">Vista Previa: {previewContent.title}</span>
              </h3>
              <button 
                onClick={() => setPreviewContent(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800 shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-white overflow-y-auto p-6 md:p-10">
              <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewContent.content}</ReactMarkdown>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
               <button
                  onClick={() => handleDownloadPDF(previewContent.content, previewContent.title)}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
