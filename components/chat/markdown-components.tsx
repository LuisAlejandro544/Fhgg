import React from 'react';
import { Message } from '@/types/agent';
import { ArtifactCard } from './artifact-card';

export const getMarkdownComponents = (msg: Message, onOpenArtifact?: (artifact: any) => void) => ({
  pre: ({node, children, ...props}: any) => {
    const child = React.Children.toArray(children)[0] as React.ReactElement;
    const isHtml = (child?.props as any)?.className?.includes('language-html');

    if (isHtml) {
      return <>{children}</>;
    }

    return (
      <div className="overflow-x-auto w-full max-w-full my-4 rounded-lg bg-gray-900 shadow-sm border border-gray-800">
        <pre className="!my-0 !bg-transparent text-gray-100 p-4 text-sm" {...props}>
          {children}
        </pre>
      </div>
    );
  },
  code: ({node, inline, className, children, ...props}: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const isHtml = language === 'html';
    const codeString = String(children).replace(/\n$/, '');

    if (!inline && isHtml) {
      return (
        <ArtifactCard 
          language={language} 
          content={codeString} 
          onOpen={() => {
            if (onOpenArtifact) {
              onOpenArtifact({
                id: `${msg.id}-${codeString.length}`,
                messageId: msg.id,
                title: 'documento.html',
                language,
                content: codeString
              });
            }
          }} 
        />
      );
    }

    return inline ? (
      <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded-md text-sm break-words border border-gray-200" {...props}>
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  table: ({node, ...props}: any) => (
    <div className="overflow-x-auto w-full my-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
    </div>
  ),
  thead: ({node, ...props}: any) => <thead className="bg-gray-50" {...props} />,
  th: ({node, ...props}: any) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" {...props} />,
  td: ({node, ...props}: any) => <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap" {...props} />,
  a: ({node, ...props}: any) => (
    <a 
      {...props} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 break-all" 
    />
  ),
  img: ({node, src, ...props}: any) => {
    const proxySrc = src ? `/api/proxy-image?url=${encodeURIComponent(src)}` : '';
    return (
      <img 
        {...props} 
        src={proxySrc}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
        className="max-w-full h-auto rounded-xl shadow-sm border border-gray-200 my-4 object-cover max-h-96"
        loading="lazy"
        alt={props.alt || ''}
      />
    );
  }
});
