// Registro central de MCPs (Model Context Protocol) adaptados para Vercel
// Esta arquitectura permite integrar herramientas de la comunidad (Glama, GitHub)
// adaptándolas de stdio a Function Calling / SSE para nuestra app web.

export interface MCPTool {
  name: string;
  description: string;
  parameters: any; // JSON Schema de los parámetros
  execute: (args: any) => Promise<any>;
}

class MCPRegistry {
  private tools: Map<string, MCPTool> = new Map();

  register(tool: MCPTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  // Método para inyectar estas herramientas en el formato que espera Gemini/OpenRouter
  getToolsForAI() {
    return this.getAllTools().map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }
}

export const mcpRegistry = new MCPRegistry();
