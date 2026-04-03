import { NextResponse } from 'next/server';
import { mcpRegistry } from '@/lib/mcp/registry';

// Ruta base para interactuar con los MCPs registrados.
// En el futuro, esto puede manejar conexiones SSE (Server-Sent Events)
// o actuar como un endpoint RPC para ejecutar herramientas extraídas de Glama.

export async function POST(req: Request) {
  try {
    const { toolName, args } = await req.json();
    
    const tool = mcpRegistry.getTool(toolName);
    if (!tool) {
      return NextResponse.json({ error: `Tool ${toolName} not found in MCP registry` }, { status: 404 });
    }

    const result = await tool.execute(args);
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // Devuelve la lista de herramientas MCP disponibles en nuestra "App Store" interna
  const tools = mcpRegistry.getAllTools().map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters
  }));
  
  return NextResponse.json({ tools });
}
