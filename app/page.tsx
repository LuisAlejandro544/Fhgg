'use client';

import Link from 'next/link';
import { Bot, Sparkles, BrainCircuit, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">AI Hub</span>
        </div>
        <Link 
          href="/chat"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Ir a la App &rarr;
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium mb-8 border border-blue-200/50">
          <Sparkles className="w-4 h-4" />
          <span>El futuro de la orquestación de IA</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          Un equipo de expertos <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            trabajando para ti.
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          AI Hub no es solo un chat. Es un ecosistema donde múltiples agentes especializados colaboran, debaten y resuelven problemas complejos de forma autónoma.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/chat"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            Comenzar ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/settings"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-sm"
          >
            Configurar APIs
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Múltiples Agentes</h3>
            <p className="text-gray-600 leading-relaxed">
              Desde programadores hasta analistas y diseñadores. Cada agente tiene un rol específico y colaboran entre sí para darte la mejor respuesta.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Modelos Flexibles</h3>
            <p className="text-gray-600 leading-relaxed">
              Usa Gemini de forma nativa o conecta tu API de OpenRouter. Asigna diferentes modelos a diferentes agentes según su tarea.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Privado y Seguro</h3>
            <p className="text-gray-600 leading-relaxed">
              Tus API Keys se encriptan localmente. El historial se guarda en tu navegador. Tú tienes el control total de tus datos y gastos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
