import React from 'react';
import { Globe, Presentation, FileCode2, Lightbulb } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'web',
    title: 'Crear Página Web',
    description: 'Genera una web completa en HTML, CSS y JS.',
    icon: <Globe className="w-5 h-5 text-blue-500" />,
    prompt: 'Crea una página web completa y moderna sobre: [ESCRIBE TU TEMA AQUÍ]. \n\nRegla estricta: Devuelve TODO el código (HTML, CSS, JS) en un único bloque de código ```html para poder visualizarlo en el Canvas.'
  },
  {
    id: 'presentation',
    title: 'Presentación',
    description: 'Estructura diapositivas en formato Markdown.',
    icon: <Presentation className="w-5 h-5 text-purple-500" />,
    prompt: 'Crea una presentación estructurada sobre: [ESCRIBE TU TEMA AQUÍ]. \n\nRegla estricta: Usa formato Markdown con encabezados claros, viñetas y separadores (---) para cada diapositiva.'
  },
  {
    id: 'game',
    title: 'Juego Web',
    description: 'Crea un minijuego jugable en el navegador.',
    icon: <FileCode2 className="w-5 h-5 text-emerald-500" />,
    prompt: 'Crea un juego web interactivo sobre: [ESCRIBE TU TEMA AQUÍ]. \n\nRegla estricta: Usa HTML, CSS y JS en un solo archivo y devuélvelo en un único bloque ```html para poder jugarlo en el Canvas.'
  },
  {
    id: 'explain',
    title: 'Explicar Concepto',
    description: 'Explicación sencilla con analogías.',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    prompt: 'Explica paso a paso y de forma muy sencilla el siguiente concepto: [ESCRIBE TU CONCEPTO AQUÍ]. \n\nRegla estricta: Usa analogías fáciles de entender, ejemplos cotidianos y formato Markdown para estructurar la respuesta.'
  }
];

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
}

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.prompt)}
            className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                {action.icon}
              </div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 text-sm">{action.title}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
