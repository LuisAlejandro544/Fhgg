'use server';

/**
 * Realiza una búsqueda web utilizando la API de Tavily AI.
 * Al usar 'use server', esta función se ejecuta en el backend (Node.js),
 * evitando los errores de CORS (Cross-Origin Resource Sharing) del navegador.
 */
export async function performWebSearch(query: string, keys?: { tavilyKey?: string }): Promise<string> {
  if (!keys?.tavilyKey) {
    return `SISTEMA: No se ha configurado la API Key de Tavily AI en las opciones.`;
  }

  console.log('[Búsqueda Web] Intentando Tavily AI API...');
  
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.tavilyKey}`
      },
      body: JSON.stringify({
        query: query,
        search_depth: "advanced",
        include_images: true,
        include_answer: true,
        exclude_domains: ["instagram.com", "facebook.com", "tiktok.com", "lemon8-app.com"]
      }),
      signal: AbortSignal.timeout(15000) // Tavily advanced search can take a bit longer
    });

    if (res.ok) {
      const data = await res.json();
      let resultText = '';

      if (data.answer) {
        resultText += `Respuesta de Tavily AI:\n${data.answer}\n\n`;
      }

      if (data.results && data.results.length > 0) {
        resultText += `Resultados detallados para "${query}" (Vía Tavily AI):\n\n` + 
          data.results.map((r: any, i: number) => `${i+1}. **${r.title}**\n   Contenido: ${r.content}\n   URL: ${r.url}`).join('\n\n');
      } else {
        resultText += `No se encontraron resultados de texto para "${query}" en la web.`;
      }

      if (data.images && data.images.length > 0) {
        resultText += `\n\nImágenes relacionadas:\n`;
        data.images.slice(0, 3).forEach((imgUrl: string, i: number) => {
          resultText += `![Imagen ${i+1}](${imgUrl})\n`;
        });
      }

      return resultText;
    } else {
      const errText = await res.text();
      console.warn('[Búsqueda Web] Error Tavily HTTP:', res.status, errText);
      return `SISTEMA: La búsqueda con Tavily AI falló (HTTP ${res.status}). Revisa tu API Key. Detalle: ${errText}`;
    }
  } catch (e) {
    console.warn('[Búsqueda Web] Falló Tavily AI:', e);
    return `SISTEMA: Error de red al conectar con Tavily AI.`;
  }
}

