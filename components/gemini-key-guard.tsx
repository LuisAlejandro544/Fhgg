'use client';

import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

export function GeminiKeyGuard({ children }: { children: React.ReactNode }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          setHasKey(true); // Fallback if API fails
        }
      } else {
        // If not in AI Studio environment, proceed normally
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition as per guidelines
        setHasKey(true);
      } catch (e) {
        console.error("Error opening key selector:", e);
      }
    }
  };

  if (hasKey === null) return null; // Loading state

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Requiere API Key de Gemini</h1>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Para usar esta aplicación, necesitas conectar tu propia API Key de Gemini. 
            Esto asegura que el uso de la IA se facture a tu propia cuenta y no a la del creador de la app.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            Conectar mi API Key
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Tus credenciales son gestionadas de forma segura por Google.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
