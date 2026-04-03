# Estructura del Proyecto (AI Hub)

Este documento describe la organización de los archivos y carpetas del proyecto para facilitar la navegación y el desarrollo modular.

```text
/
├── app/                    # Next.js App Router
│   ├── api/                # Rutas de API del servidor
│   │   ├── mcp/            # Endpoint base para integraciones Model Context Protocol (MCP)
│   │   │   └── route.ts
│   │   └── proxy-image/    # Proxy para eludir CORS y hotlinking de imágenes
│   │       └── route.ts
│   ├── globals.css         # Estilos globales y configuración de Tailwind
│   ├── layout.tsx          # Layout principal de la aplicación
│   ├── page.tsx            # Página de bienvenida (Landing Page)
│   ├── chat/               # Ruta principal del chat
│   │   └── page.tsx        # Ensambla Sidebar y ChatInterface
│   └── settings/           # Página dedicada para la configuración avanzada
│       └── page.tsx
│
├── components/             # Componentes de UI modulares
│   ├── chat/               # Componentes específicos del chat
│   │   ├── artifact-card.tsx # Tarjeta interactiva para artefactos HTML
│   │   ├── chat-input.tsx  # Input de texto y controles de envío
│   │   ├── markdown-components.tsx # Renderizadores personalizados para Markdown
│   │   ├── message-content.tsx # Renderizado del contenido (texto, think, tools, pdf modal)
│   │   ├── message-item.tsx # Contenedor individual de cada mensaje (burbuja)
│   │   ├── nested-call.tsx # Renderizado de llamadas anidadas (Inter-Agent)
│   │   └── quick-actions.tsx # Tarjetas de inicio rápido con prompts predefinidos
│   ├── canvas-panel.tsx    # Panel lateral para previsualizar código y gestionar archivos
│   ├── chat-interface.tsx  # Lógica principal de la UI del chat y persistencia
│   ├── sidebar.tsx         # Menú lateral con historial de chats y creación de nuevas sesiones
│   ├── settings-provider.tsx # Contexto global para la configuración
│   └── html-preview.tsx    # Componente base para renderizar código HTML
│
├── lib/                    # Lógica de negocio y utilidades
│   ├── mcp/                # Registro y adaptación de herramientas MCP (Model Context Protocol)
│   │   └── registry.ts
│   ├── agents.ts           # Definición de los agentes, sus roles y System Prompts
│   ├── ai-stream.ts        # Lógica de conexión con Gemini/OpenRouter y streaming
│   ├── artifacts.ts        # Funciones para extraer artefactos HTML de los mensajes
│   ├── db.ts               # Configuración de Dexie.js (Base de datos local)
│   ├── message-parser.ts   # Lógica de parseo de comandos ([CALL], [TOOL], <think>, [BLACKBOARD], [VOTE])
│   └── utils.ts            # Funciones utilitarias (ej. concatenación de clases con clsx)
│
├── types/                  # Definiciones de TypeScript
│   └── agent.ts            # Interfaces para SubAgent y Message
│
├── hooks/                  # Custom React Hooks
│   ├── use-chat-orchestrator.ts # Hook principal que maneja la orquestación de agentes y la continuación automática de streams
│   └── use-mobile.ts       # Hook para detectar si el viewport es móvil
│
├── .env.example            # Ejemplo de variables de entorno requeridas
├── eslint.config.mjs       # Configuración de ESLint
├── next.config.ts          # Configuración de Next.js
├── package.json            # Dependencias y scripts del proyecto
├── postcss.config.mjs      # Configuración de PostCSS (Tailwind)
├── tsconfig.json           # Configuración de TypeScript
└── *.md                    # Archivos de documentación (README, ROADMAP, etc.)
```

## Principios de Diseño
- **Modularidad:** La lógica de los agentes está separada de la UI (`lib/agents.ts`). La configuración se maneja globalmente mediante Context API (`components/settings-provider.tsx`).
- **Escalabilidad:** Añadir un nuevo agente solo requiere agregar un objeto al array en `agents.ts`.
- **Persistencia Local:** Se utiliza Dexie.js (`lib/db.ts`) para almacenar el historial de chat y los resúmenes de memoria a largo plazo directamente en el navegador del usuario.
- **Separación de Responsabilidades:** `page.tsx` es la landing page, `chat/page.tsx` maneja el estado global de la UI del chat, `chat-interface.tsx` maneja la lógica compleja de la IA (incluyendo el Modo Debate, Secuencial, Pizarra Compartida, Votación, la renderización visual distintiva de subagentes y la búsqueda web) y la interacción con la base de datos, y `settings/page.tsx` maneja las preferencias del usuario y las API Keys.

## Notas de Arquitectura en Debate
- **Motor de Búsqueda Web:** Se ha integrado **Serper.dev** como el motor de búsqueda definitivo, proporcionando resultados precisos y rápidos a través de la API de Google Search.
- **Renderizado de Imágenes:** Actualmente en desarrollo activo. Se ha implementado un proxy interno en Next.js (`/api/proxy-image`) para eludir las protecciones de hotlinking de servidores externos y permitir que las imágenes encontradas por el Investigador se rendericen correctamente en el chat.
- **Evolución a Developer API (Agents-as-a-Service):** La arquitectura actual es un MVP "Local-First" alojado en Vercel, donde el navegador del usuario mantiene el estado y ejecuta la orquestación. Para la futura API Pública, la orquestación se migrará a contenedores (ej. Render, Koyeb, Cloud Run) o Background Jobs (Inngest) para evitar los límites de ejecución de 10-15s de Vercel y soportar tareas de hasta 8 minutos.
