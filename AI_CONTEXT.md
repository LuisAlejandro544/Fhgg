# AI Context & Architecture Deep Dive

**ATTENTION AI AGENT:** If you are reading this file, you are likely tasked with maintaining, debugging, or expanding this application. This document provides the critical context needed to understand the complex multi-agent orchestration logic implemented in this codebase.

## 1. High-Level Architecture
This is a Next.js 15 application using React 19. It implements a **Hierarchical Multi-Agent System** powered by the `@google/genai` SDK.
- **The Coordinator:** The primary entry point. It receives user input, reasons about it, and decides whether to answer directly or delegate.
- **The Sub-agents:** Specialized prompts (Coder, Creative, Analyst, Researcher, Translator, Reviewer, SEO, Designer, Security) that are invoked dynamically by the Coordinator.

## 2. The Parsing Engine (The Magic)
The core logic resides in `components/chat-interface.tsx` within the `parseMessageText` function. The app does NOT use native function calling for agent delegation; instead, it uses a custom text-parsing protocol.

### Protocol Syntax:
1. **Reasoning:** `<think>...</think>`
   - Extracted and rendered in a collapsible UI box.
   - ALL agents (Coordinator and Sub-agents) are instructed to use this.
2. **Delegation:** `[CALL:agentId|prompt]`
   - ONLY the Coordinator uses this.
   - Extracted via Regex: `/\[CALL:([^|\]]+)\|([^\]]+)\]/g`
   - Removed from the final rendered text so the user only sees the UI indicator, not the raw command.
3. **Blackboard (Shared Memory):** `[BLACKBOARD:note]`
   - Used by sub-agents to share discoveries with the team during a task.
   - Extracted via Regex: `/\[BLACKBOARD:([\s\S]*?)(?:\]|$)/g`
4. **Voting System:** `[VOTE:vote]`
   - Used by sub-agents to cast a justified vote on a solution.
   - Extracted via Regex: `/\[VOTE:([\s\S]*?)(?:\]|$)/g`
5. **Tools (Custom Protocol):** `[TOOL:toolName|filename|content]`
   - Used by agents to trigger client-side actions (e.g., `[TOOL:pdf|documento.pdf|content]`).
   - Extracted via Regex: `/\[TOOL:([^|]+)(?:\|([^|]+))?\|([\s\S]*?)\]/g`
   - Renders interactive UI elements (like a Download PDF button and a Markdown-based Preview Modal) using libraries like `jspdf` and `react-markdown`.
4. **Web Search:** `[SEARCH:query]`
   - Used by the Researcher agent to fetch real-time information from the web.
   - Extracted via Regex: `/\[SEARCH:([^\]]+)\]/g`
   - The system intercepts this, performs a search using Serper.dev, and feeds the results back to the agent as context for its final response.

## 3. The Orchestration Lifecycle (`handleSend`)
When the user sends a message, the following sequence occurs in `chat-interface.tsx`:

1. **Phase 1 (Coordinator Initial Pass):**
   - The Coordinator is prompted with the conversation history.
   - It streams its response. It may output just `<think>...</think> Final answer` OR `<think>...</think> [CALL:...] [CALL:...]`.
2. **Phase 2 (Evaluation):**
   - The stream finishes. `parseMessageText` checks for `[CALL:...]` commands.
   - *If NO calls:* The process ends. The Coordinator's output is the final answer.
   - *If calls EXIST:* Proceed to Phase 3.
3. **Phase 3 (Sub-agent Execution):**
   - **Parallel Mode (Default):** A `Promise.all` array is created for every extracted `[CALL]`. Each sub-agent streams its response simultaneously.
   - **Sequential Team Mode:** If enabled, the `[CALL]` commands are executed one by one. The output of the first agent is appended to the `systemInstruction` of the second agent as `accumulatedContext`, and so on. This allows agents to build upon each other's work.
   - The UI marks these messages with `isSubTask: true` for visual indentation.
4. **Phase 4 (Coordinator Final Review):**
   - The results of all sub-agents are concatenated into a hidden `reviewPrompt`.
   - The Coordinator is called *again* to review the sub-agent outputs, reason about them using `<think>` to plan the tone and structure, and synthesize a final response for the user.
   - **Token Limit Management & Auto-Continue:** To prevent the final response (especially long PDFs or code blocks) from being cut off, the API calls are configured with a forced `maxOutputTokens: 8192` (or `max_tokens: 8192` for OpenRouter). Additionally, a robust `streamWithAutoContinue` wrapper automatically detects if a stream was cut off due to length limits (`finishReason === 'MAX_TOKENS'` or `'LENGTH'`) and seamlessly prompts the model to continue exactly where it left off, appending the results transparently.

## 4. Advanced Settings & Dynamic Prompts
The `ChatInterface` component includes state variables for advanced user control:
- `temperature` (0.0 - 2.0): Passed directly to the `config` object of `ai.models.generateContentStream`.
- `enableSubAgentReasoning` (boolean): If false, dynamically appends a strict rule to the sub-agent's `systemInstruction` forbidding the use of `<think>` tags.
- `enableInterAgent` (boolean): If true, dynamically appends instructions allowing sub-agents to use the `[CALL:id|prompt]` syntax. The orchestration loop parses these secondary calls and executes them 1-level deep, appending the results to the calling sub-agent's output.
- `enableSequentialMode` (boolean): If true, changes the execution flow in Phase 3 from `Promise.all` (parallel) to a `for` loop (sequential), passing the accumulated results of previous agents as context to the next agent in the chain.
- `enableDebateMode` (boolean): If true, activates "Consenso Multi-Agente". The Coordinator's system prompt is modified to act as a Moderator, forcing it to call multiple experts for complex decisions and synthesize a unified verdict in Phase 4.
- `enableBlackboard` (boolean): If true, enables "Pizarra Compartida". Sub-agents can read and write to a shared memory space during their execution using `[BLACKBOARD:...]`. The orchestrator collects these notes and passes them to the Coordinator.
- `enableVoting` (boolean): If true, forces sub-agents to cast a vote using `[VOTE:...]`. The Coordinator uses these votes to make a final decision.
- `openRouterKey` (string): API key for OpenRouter models.
- **Flexible API Key Management:** The app no longer forces Gemini usage. Users can use OpenRouter exclusively. The Gemini API key connection is optional and managed via a button in `/settings` (using `window.aistudio.openSelectKey()`). The orchestrator checks for the key "just-in-time" before sending a message if a Google model is selected.
- `agentModels` (Record<string, string>): Maps specific agent IDs to specific model IDs.

## Modelos Soportados
El sistema soporta una amplia gama de modelos a través de Google y OpenRouter, incluyendo:
- **Google**: Gemini 3.1 Pro, Gemini 3.0 Flash, Gemini 3.1 Flash Lite.
- **OpenRouter (Gratuitos)**: Qwen 3.6 Plus, MiniMax M2.5, StepFun 3.5 Flash, Trinity Large, Liquid LFM 2.5, Nemotron Nano 9B, Nemotron 3 Super 120B, GLM-4.5 Air, Nemotron 3 Nano 30B, Trinity Mini, Dolphin Mistral 24B (Sin censura), Hermes 3 Llama 3.1 405B (Sin censura).

## 5. Historial de Chats y Memoria a Largo Plazo

### Gestión de Múltiples Chats
- **Persistencia Local:** Se utiliza Dexie.js (`lib/db.ts`) para almacenar múltiples sesiones de chat localmente en el navegador del usuario.
- **Estructura de Datos:** La base de datos contiene dos tablas principales: `chats` (almacena metadatos como ID, título, fecha de actualización y resumen) y `messages` (almacena los mensajes individuales vinculados a un `chatId`).
- **Interfaz de Usuario:** El menú lateral (`components/sidebar.tsx`) proporciona la interfaz para crear nuevos chats, cambiar entre conversaciones existentes y eliminar historiales.
- **Generación de Títulos:** Al enviar el primer mensaje de una nueva conversación, el sistema genera automáticamente un título corto basado en el contenido del mensaje para facilitar la identificación en el historial.

### Mecanismo de Resumen (Memoria a Largo Plazo)
Para manejar conversaciones largas y evitar el límite de tokens, se ha implementado un mecanismo de resumen automático:
1.  **Límite de Mensajes**: Cuando una conversación supera un cierto límite (ej. 15 mensajes), el sistema activa el resumen.
2.  **Generación del Resumen**: El Coordinador genera un resumen conciso de los mensajes más antiguos, enfocándose en objetivos, decisiones y el estado del proyecto.
3.  **Persistencia**: Este resumen se guarda en la tabla `chats` de Dexie.js (`chatSession.summary`).
4.  **Reinicio Transparente**: Los mensajes antiguos se limpian de la vista actual (y de la base de datos de mensajes de esa sesión), pero se mantiene el resumen como un mensaje especial `[TOOL:summary|...]` al inicio, junto con los últimos mensajes para contexto inmediato.
5.  **Inyección de Contexto**: En las siguientes interacciones, este resumen se inyecta dinámicamente en el `systemInstruction` del agente bajo la sección "MEMORIA A LARGO PLAZO", permitiéndole recordar el contexto general sin procesar todo el historial.
6.  **Visualización**: El usuario puede ver el resumen generado en la interfaz de chat a través de un componente visual dedicado.

## 6. State Management & Performance
- `messages`: An array of `Message` objects (defined in `types/agent.ts`).
- `Message` interface includes custom flags:
  - `isStreaming`: Controls the blinking cursor/loader UI.
  - `isSubTask`: Determines if the message should be indented and styled as a sub-agent output.
  - `agentId`: Links the message to the specific agent metadata in `lib/agents.ts`.
  - `nestedCalls`: An array of objects `{ agentId, text, isStreaming }` used to render secondary calls made by sub-agents (Inter-Agent Communication) in a distinct visual format.
- **Performance Optimization:** Individual message rendering is wrapped in `React.memo` (`MessageItem`) to prevent the entire chat list from re-rendering on every keystroke in the input field, which previously caused severe lag on mobile devices with long chat histories.

## 7. Image Proxy & Rendering
To bypass hotlinking protections and CORS restrictions from external image sources (e.g., Wikipedia) found during web searches, the application uses a custom Next.js API Route (`/api/proxy-image/route.ts`).
- The `img` renderer in `react-markdown` intercepts image URLs and rewrites them to pass through the proxy: `/api/proxy-image?url=[encoded_url]`.
- The proxy spoofs a standard browser `User-Agent` and sets the `Referer` header to the image's origin to trick basic server protections.
- Images also use `referrerPolicy="no-referrer"` and have an `onError` handler to hide broken images gracefully.

## 8. Canvas Mode & Artifacts
To improve the developer and user experience when generating code, the application implements a "Canvas Mode" (similar to Claude Artifacts).
- **Artifact Extraction:** The `extractArtifacts` function (`lib/artifacts.ts`) parses messages for HTML code blocks (` ```html `) and converts them into `Artifact` objects.
- **ArtifactCard:** HTML code blocks are intercepted by the custom Markdown renderer (`components/chat/markdown-components.tsx`) and displayed as an interactive `ArtifactCard` instead of raw text.
- **CanvasPanel:** Clicking "Abrir Canvas" opens a side panel (desktop) or full-screen overlay (mobile) containing the `CanvasPanel` (`components/canvas-panel.tsx`). This panel uses an `iframe` with a strict `sandbox` attribute (`allow-scripts allow-forms allow-popups`) to securely render the HTML preview without stripping external scripts like Tailwind CDN. It also includes a toggle to view the raw code.
- **File Manager:** The Canvas Panel includes a sidebar that lists all HTML artifacts generated within the *current chat session*, allowing users to easily switch between them.

## 9. Quick Actions (Starter Prompts)
To reduce friction for new users, the empty chat state includes "Quick Actions" (`components/chat/quick-actions.tsx`). These are clickable cards that populate the chat input with predefined, highly-structured prompts designed to force the AI to output specific formats (like HTML for the Canvas Mode, or Markdown for presentations).

## 10. Key Files to Modify for Features
- **Adding a new Agent:** Modify `lib/agents.ts`. Add a new object to the array. The system will automatically pick it up.
- **Changing the Parsing Logic:** Modify `parseMessageText` in `lib/message-parser.ts`.
- **Modifying the UI of Messages:** Modify the components inside `components/chat/` (e.g., `message-item.tsx`, `message-content.tsx`, `artifact-card.tsx`).
- **Modifying the Orchestration Logic:** Modify `hooks/use-chat-orchestrator.ts`.
- **Modifying the Settings UI:** The settings page is located at `app/settings/page.tsx`.
- **Modifying the Landing Page:** The welcome page is located at `app/page.tsx`. The main chat UI is now at `app/chat/page.tsx`.

## 11. Future Roadmap: MCP Integrations & Developer API
- **Model Context Protocol (MCP):** The application is laying the groundwork for MCP integration (`lib/mcp/registry.ts` and `app/api/mcp/route.ts`). This will allow the app to act as an "App Store" for AI, integrating community-built MCP servers (from Glama, GitHub, etc.).
  - **Vercel Adaptation:** Since Vercel Serverless functions cannot run long-lived `stdio` processes, the architecture involves extracting the core logic from open-source MCPs and wrapping them as native Function Calling tools or SSE endpoints within the Next.js backend.
- **Skills System:** A planned feature to inject modular Markdown files into the agent's context dynamically, allowing deep customization without breaking compatibility with free models that lack native Function Calling.
- **Current MVP:** The app is currently a "Local-First" application deployed on Vercel. The heavy lifting of orchestration (waiting for agents, parsing, chaining) is done by the user's browser (`use-chat-orchestrator.ts`).
- **The Problem with Serverless:** Vercel's free tier kills serverless functions after 10-15 seconds. Complex multi-agent tasks (debates, deep research) can take 2 to 8 minutes.
- **The Solution (Agents-as-a-Service):** To offer a public Developer API, the orchestration logic will be moved to the backend using either **Background Jobs** (Inngest/Trigger.dev) or **Containers** (Google Cloud Run, Render, Koyeb). This will allow developers to trigger tasks via a `POST /v1/tasks/execute` endpoint and receive results via Webhooks.
- **Pricing Strategy:** The API will use a "Bring Your Own Key" model (users pay for their own tokens). The platform will charge for **Concurrency and Execution Time** (e.g., Free: 150 reqs/2.5m/1 concurrent, Pro: 2000 reqs/5m/5 concurrent, Max: 10000 reqs/8m/20 concurrent).

## 12. Known Constraints & Rules
- **Do NOT** change the `[CALL:id|prompt]` syntax without updating the Regex in `parseMessageText`.
- **Do NOT** remove the `<think>` instructions from `lib/agents.ts` unless requested, as the UI relies on this for the "Reasoning Process" visual component.
- The `Sidebar` component currently has a placeholder for future integrations. Do not restore the agent list there unless explicitly requested.
