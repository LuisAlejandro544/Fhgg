# AI Hub - Sistema de Agentes Autónomos

Una aplicación web avanzada construida con Next.js y React que implementa un sistema de Inteligencia Artificial multi-agente. La aplicación permite a un "Coordinador" principal razonar sobre las solicitudes del usuario y delegar tareas a subagentes especializados de forma autónoma y en paralelo.

## 🚀 Características Principales

- **Orquestación Autónoma:** El Coordinador decide si responder directamente o delegar tareas basándose en la complejidad de la solicitud.
- **9 Subagentes Especializados:** DevBot (Código), Musa (Creatividad), DataMind (Análisis), Investigador, Traductor, Revisor QA, Experto SEO, Diseñador UX/UI y Ciberseguridad.
- **Búsqueda Web Integrada:** El agente Investigador puede buscar en internet usando **Serper.dev** (API de Google Search optimizada para IA) para obtener información actualizada en tiempo real.
- **Renderizado de Imágenes (Proxy):** Las imágenes de la web se renderizan en el chat eludiendo restricciones de CORS mediante un proxy interno en Next.js.
- **Herramientas Avanzadas (Custom Protocol):** Capacidad de generar documentos PDF con nombres de archivo dinámicos y previsualización interactiva mediante un modal basado en Markdown.
- **Modo Canvas y Artefactos:** Los bloques de código HTML generados por los agentes se interceptan y se muestran como "Artefactos". Al hacer clic en "Abrir Canvas", se despliega un panel lateral (o pantalla completa en móviles) con una vista previa segura (`iframe` con `sandbox` estricto) y el código fuente. Se eliminó DOMPurify para permitir la carga de scripts externos como Tailwind CDN.
- **Administrador de Archivos por Chat:** Dentro del Modo Canvas, un panel lateral lista todos los artefactos HTML generados en la sesión actual, permitiendo cambiar entre ellos rápidamente.
- **Acciones Rápidas (Starter Prompts):** En chats vacíos, se muestran tarjetas interactivas (Ej. "Crear Página Web", "Presentación") que inyectan prompts estructurados con reglas estrictas para forzar a la IA a generar formatos específicos (HTML, Markdown) de manera óptima.
- **Optimización de Tokens y Continuación Automática:** Límite de salida maximizado (8192 tokens). Además, si la respuesta de la IA se corta por llegar al límite de tokens, el sistema detecta automáticamente el corte y le pide a la IA que continúe exactamente desde donde se quedó, uniendo las respuestas de forma invisible para el usuario.
- **Gestión de Chat y Persistencia:** Interfaz completa en el menú lateral para crear, seleccionar y eliminar múltiples sesiones de chat. El historial se guarda localmente usando Dexie.js (IndexedDB).
- **Memoria a Largo Plazo (Resumen Automático):** Para conversaciones largas, el sistema genera automáticamente un resumen del contexto anterior, permitiendo interacciones casi infinitas sin perder el hilo conductor ni agotar el límite de tokens.
- **Renderizado Avanzado:** Soporte para tablas Markdown, vista previa interactiva de código HTML generado por el Coordinador, y burbujas de chat más anchas para una mejor legibilidad.
- **Optimización Móvil:** Componentes memoizados para garantizar una escritura fluida sin lag, incluso con historiales de chat extensos.
- **Razonamiento Visible (Chain-of-Thought):** Todos los agentes utilizan etiquetas `<think>` para mostrar su proceso lógico en tiempo real antes de emitir una respuesta.
- **Pizarra Compartida (Modo Agencia):** Espacio de memoria temporal donde los agentes pueden anotar y leer descubrimientos clave durante una tarea, fomentando la sinergia.
- **Sistema de Votación:** Resolución de conflictos donde los subagentes emiten votos justificados para ayudar al Coordinador a tomar la decisión final.
- **Ejecución en Paralelo:** Las llamadas a múltiples subagentes se realizan simultáneamente, reduciendo drásticamente los tiempos de espera.
- **Streaming en Tiempo Real:** La interfaz se actualiza progresivamente a medida que los modelos de IA generan texto.
- **Selector de Modelos Flexible:** Usa Gemini de forma nativa (conectando tu cuenta de Google Cloud) o conecta tu API de OpenRouter. ¡Gemini no es obligatorio! Asigna diferentes modelos a diferentes agentes según su tarea.
- **⚙️ Opciones Avanzadas:**
  - **Temperatura:** Ajusta la creatividad vs. precisión de las respuestas.
  - **Razonamiento de Subagentes:** Activa o desactiva el uso de `<think>` en subagentes para ahorrar tokens.
  - **Comunicación Inter-Agente:** Permite que los subagentes deleguen tareas a otros agentes de forma autónoma (Experimental). Las respuestas anidadas se muestran con un diseño visual distintivo para facilitar su lectura.
  - **Modo Equipo (Secuencial):** Los subagentes trabajan en cadena. En lugar de ejecutarse todos a la vez, cada agente lee el trabajo del agente anterior para construir sobre él, logrando resultados mucho más coherentes en tareas complejas.
  - **Modo Debate (Consenso Multi-Agente):** El Coordinador actúa como moderador, convocando a múltiples expertos para debatir soluciones complejas y emitir un veredicto unificado.
  - **Pizarra Compartida:** Activa un espacio de trabajo colaborativo para que los agentes compartan notas en tiempo real.
  - **Sistema de Votación:** Obliga a los agentes a votar por la mejor solución ante problemas ambiguos.
  - **Modelos por Agente:** Asigna un modelo de IA específico (Gemini u OpenRouter) a cada agente individualmente, permitiendo combinaciones poderosas.
- **Amplia Gama de Modelos:** Soporta modelos de Google (Gemini 3.1 Pro, Flash, Flash Lite) y OpenRouter (Nemotron, Qwen, MiniMax, StepFun, Trinity, Liquid, GLM, Dolphin Mistral, Hermes).
- **Diseño Responsivo y Moderno:** Interfaz optimizada para móviles con un menú lateral tipo "drawer", página de configuración dedicada (`/settings`), página de bienvenida (Landing Page) y manejo inteligente del desbordamiento de código.

## 🔮 Visión a Futuro: Agents-as-a-Service y Ecosistema MCP
El proyecto tiene un roadmap claro para evolucionar de una aplicación web "Local-First" a una plataforma **PaaS (Platform as a Service)** y un Hub de integraciones.
- **Integración MCP (Model Context Protocol):** Transformación de la app en un ecosistema extensible conectando servidores MCP de la comunidad (Glama, GitHub). Los agentes podrán leer repositorios, bases de datos y navegar por la web de forma estandarizada.
- **Sistema de Skills:** Módulos de conocimiento (Markdown) inyectables dinámicamente para personalizar a los agentes sin sacrificar compatibilidad con modelos gratuitos.
- **API Pública:** Permitirá a desarrolladores integrar nuestro enjambre de agentes en sus propias aplicaciones (Slack, Discord, CRMs).
- **Infraestructura Cloud:** Migración de la orquestación a contenedores (Cloud Run, Render) o Background Jobs (Inngest) para soportar tareas de larga duración (hasta 8 minutos de ejecución), superando los límites de las funciones Serverless.
- **Modelo de Negocio "Bring Your Own Key":** Cobro exclusivo por solicitudes, tiempo de ejecución y concurrencia (Planes Free, Pro y Max), sin cobrar por tokens de IA.

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Base de Datos Local:** Dexie.js (IndexedDB)
- **Estilos:** Tailwind CSS v4
- **IA SDK:** `@google/genai` (Gemini API)
- **Iconos:** Lucide React
- **Markdown:** React Markdown

## 📦 Instalación y Uso

1. Clona el repositorio.
2. Instala las dependencias: `npm install`
3. Configura tu variable de entorno en `.env.local`:
   `NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui`
4. Inicia el servidor de desarrollo: `npm run dev`
5. Abre `http://localhost:3000` en tu navegador para ver la página de bienvenida.
6. Configura tus API Keys (Gemini u OpenRouter) en la sección de Configuración (`/settings`).
