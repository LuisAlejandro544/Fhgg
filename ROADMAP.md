# Roadmap del Proyecto (AI Hub)

Este documento traza las futuras actualizaciones, integraciones y mejoras planificadas para la aplicación.

## Fase 1: Estabilización y Core (Completado ✅)
- [x] Interfaz de chat básica.
- [x] Integración con Gemini API.
- [x] Sistema de subagentes (Coordinador, Coder, Creative, Analyst).
- [x] Lógica de delegación autónoma (`[CALL:...]`).
- [x] Razonamiento visible (`<think>`).
- [x] Streaming en tiempo real.
- [x] Ejecución paralela de subagentes.
- [x] Diseño responsivo y corrección de desbordamiento de código.
- [x] Selector de modelos dinámico.
- [x] **Opciones Avanzadas:** Temperatura, Toggle de Razonamiento y Comunicación Inter-Agente.
- [x] **Nuevos Subagentes:** Investigador, Traductor, Revisor QA, Experto SEO, Diseñador UX/UI y Ciberseguridad.
- [x] **Herramientas (Custom Protocol):** Capacidad de generar y descargar PDFs con nombres dinámicos y previsualización en modal Markdown.
- [x] **Gestión de Chat y Persistencia:** Botón para limpiar la conversación y almacenamiento local con Dexie.js.
- [x] **Modo Equipo (Secuencial):** Ejecución en cadena de subagentes compartiendo contexto.
- [x] **Modelos por Agente:** Asignación de modelos específicos (Gemini/OpenRouter) a cada agente individual.
- [x] **Mejoras de Interfaz (UI/UX):** Rediseño de la configuración a una página dedicada (`/settings`), mejoras visuales en el input de chat, sidebar, scrollbars personalizadas y burbujas de chat más anchas.
- [x] **Renderizado Avanzado:** Soporte para tablas Markdown y vista previa interactiva de código HTML.
- [x] **Optimización de Tokens:** Aumento del límite de salida a 8192 tokens para evitar recortes en respuestas largas y permitir razonamiento profundo (`<think>`) en la fase final.
- [x] **Memoria a Largo Plazo (Resumen):** Mecanismo automático para resumir conversaciones largas y mantener el contexto sin exceder límites de tokens.
- [x] **Modo Debate (Consenso Multi-Agente):** El Coordinador actúa como moderador, convocando a múltiples expertos para debatir soluciones complejas y emitir un veredicto unificado.
- [x] **Pizarra Compartida (Modo Agencia):** Espacio de memoria temporal para sinergia entre agentes.
- [x] **Sistema de Votación:** Resolución de conflictos mediante votos justificados de subagentes.
- [x] **Ampliación de Modelos:** Integración de modelos de OpenRouter (Nemotron, Qwen, MiniMax, StepFun, Trinity, Liquid, GLM, Dolphin Mistral, Hermes).
- [x] **Distinción Visual de Agentes:** Diseño mejorado para mostrar claramente las contribuciones de subagentes y la comunicación anidada entre ellos.
- [x] Integración exclusiva con **Serper.dev** para búsquedas web precisas y rápidas.
- [x] **Renderizado de Imágenes (Proxy):** Las imágenes de la web se renderizan en el chat eludiendo restricciones de CORS mediante un proxy interno en Next.js.
- [x] **Optimización de Rendimiento:** Componentes memoizados para garantizar una escritura fluida sin lag en dispositivos móviles.
- [x] **Gestión de Múltiples Chats:** UI para crear, seleccionar y eliminar diferentes sesiones de chat guardadas localmente (botón de eliminar visible en móviles).
- [x] **Integración en el Sidebar:** Utilizar el espacio reservado en el menú lateral para mostrar el historial de chats.
- [x] **Página de Bienvenida (Landing Page):** Nueva ruta raíz (`/`) que explica las características de la app y redirige al chat o a la configuración.
- [x] **Gestión Flexible de APIs:** Gemini API ya no es obligatoria. Los usuarios pueden optar por usar exclusivamente OpenRouter y conectar su cuenta de Google Cloud de forma opcional desde `/settings`.
- [x] **Modo Canvas y Artefactos:** Panel lateral para previsualizar código HTML generado de forma segura (sin DOMPurify para permitir scripts externos), con administrador de archivos por chat.
- [x] **Acciones Rápidas (Starter Prompts):** Tarjetas interactivas en chats vacíos para inyectar prompts estructurados y forzar formatos específicos (HTML, Markdown).
- [x] **Continuación Automática de Respuestas:** El sistema detecta cuando la IA se corta por límites de tokens y automáticamente le pide que continúe, uniendo las respuestas de forma transparente.
- [ ] **Herramientas (Function Calling):** Permitir que los agentes ejecuten código real, busquen en internet o lean archivos locales.

## Fase 3: Personalización y Escalabilidad (Futuro 🔮)
- [ ] **Integraciones Externas (API Keys):** Conectar el AI Hub con plataformas como Notion, GitHub o Trello mediante Personal Access Tokens. Esto permitirá a los agentes leer contexto externo y ejecutar acciones en el mundo real (ej. exportar resúmenes a Notion, revisar código y crear issues en GitHub).
- [ ] **Refinamiento de System Prompts:** Mejorar los prompts de sistema de los subagentes para hacerlos más estrictos, profesionales y eficientes.
- [ ] **Documentación Avanzada:** Creación de un `AGENTS_MANUAL.md` para documentar detalladamente cada agente, sus roles y herramientas.
- [ ] **Creador de Agentes:** Interfaz UI para que el usuario pueda crear sus propios subagentes personalizados con prompts específicos.
- [ ] **Exportación de Resultados:** Botones para exportar el código generado a archivos, o el texto a PDF/Markdown.
- [ ] **Autenticación de Usuarios:** Sistema de login para guardar espacios de trabajo personalizados.

## Fase 4: Ideas en Debate / Visión a Largo Plazo 💭
- [ ] **Integración de MCP (Model Context Protocol):** Convertir la app en una "App Store" de IA integrando servidores MCP de la comunidad (Glama, GitHub). Esto permitirá a los agentes leer repositorios locales/remotos, buscar en la web, conectarse a Notion/Slack y ejecutar consultas SQL.
  - **Arquitectura de Adaptación:** Extraer la lógica de los MCPs Open Source (stdio) y adaptarla a Vercel (Serverless/SSE) o Function Calling nativo.
  - **Curaduría VIP:** Seleccionar y probar los mejores MCPs para ofrecer un ecosistema robusto y seguro.
- [ ] **Sistema de "Skills" (Habilidades):** Módulos de conocimiento inyectables (archivos Markdown) para personalizar el comportamiento de los agentes sin gastar tokens innecesarios y manteniendo compatibilidad con modelos gratuitos.
- [ ] **API de Subagentes (Agents-as-a-Service):** Convertir la plataforma en un servicio API público (Developer API). La idea es permitir que otros desarrolladores integren nuestra orquestación de subagentes (y sus debates) en sus propias aplicaciones (Slack, Discord, CRMs, apps móviles, etc.) utilizando nuestra plataforma como motor.
- [ ] **Computer Use (Navegación Visual):** Capacidad para que la IA controle un navegador remoto "viendo" la pantalla y haciendo clics/escribiendo, permitiendo automatización web avanzada.
  - **Arquitectura e Infraestructura (Roadmap Técnico):**
    - **MVP Actual:** Aplicación "Local-First" alojada en Vercel (el navegador del usuario hace el trabajo pesado y guarda en IndexedDB).
    - **Evolución a Cloud:** Migración de la lógica de orquestación a contenedores (ej. Google Cloud Run, Render, Koyeb) o Background Jobs (Inngest/Trigger.dev) para evitar los límites de tiempo de ejecución (timeouts de 10-15s) de las funciones Serverless tradicionales.
  - **Estructura de Precios Propuesta (Cobro por Solicitudes y Tiempo de Ejecución, NO por tokens ya que el usuario provee sus API Keys):**
    - **Plan Free:** 150 solicitudes diarias, 2.5 minutos de ejecución máxima, 1 tarea concurrente. Ideal para pruebas y desarrollo.
    - **Plan Pro ($8/mes):** 2,000 solicitudes diarias, 5 minutos de ejecución máxima, 5 tareas concurrentes. Incluye Webhooks y acceso a funciones Beta.
    - **Plan Max ($15/mes):** 10,000 solicitudes diarias, 8 minutos de ejecución máxima, 20 tareas concurrentes. Incluye reintentos automáticos y soporte prioritario.
    - **Plan Empresarial (Negociable):** Solicitudes ilimitadas, servidor dedicado, soporte SLA e ingeniero asignado.

## Fase 5: Estrategia de Comunidad y Creadores de Contenido 🚀
- [ ] **Links Mágicos (Chats Compartidos):** Permitir a creadores de contenido (YouTubers, TikTokers, etc.) compartir enlaces que clonen su configuración, agentes e historial de chat para que sus seguidores los usen como plantillas.
- [ ] **Sección "Aprende de la Comunidad":** Pestaña dentro de la app para destacar y embeber tutoriales o videos creados por la comunidad.
- [ ] **Programa de Embajadores (Early Access):** Otorgar acceso anticipado a funciones Pre-Alpha/Beta a creadores verificados para que generen expectativa y contenido exclusivo.
- [ ] **Sistema de Afiliados/Recompensas:** Recompensar a los creadores que aporten a la app (ej. con créditos para usar modelos premium por traer usuarios).
- [ ] *Posiblemente se añadan más ideas y dinámicas basadas en este modelo de creadores de contenido para impulsar el crecimiento orgánico.*
