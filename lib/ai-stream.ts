import { GoogleGenAI } from '@google/genai';
import { MODELS } from '@/components/settings-provider';

export async function* generateUnifiedStream(modelId: string, contents: any[], config: any, openRouterKey: string) {
  const modelDef = MODELS.find(m => m.id === modelId);
  if (!modelDef) throw new Error("Modelo no encontrado");

  if (modelDef.provider === 'google') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const stream = await ai.models.generateContentStream({
        model: modelId,
        contents,
        config: {
          ...config,
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }]
        }
      });
      for await (const chunk of stream) {
        const finishReason = chunk.candidates?.[0]?.finishReason;
        yield { text: chunk.text || '', finishReason };
      }
    } catch (e) {
      console.error("GoogleGenAI Error:", e);
      throw new Error(`Error de red al conectar con Gemini: ${e instanceof Error ? e.message : 'Desconocido'}`);
    }
  } else if (modelDef.provider === 'openrouter') {
    if (!openRouterKey) throw new Error("Falta la API Key de OpenRouter. Configúrala en Opciones Avanzadas.");
    const messages = [];
    if (config.systemInstruction) {
      messages.push({ role: 'system', content: config.systemInstruction });
    }
    for (const c of contents) {
      messages.push({
        role: c.role === 'model' ? 'assistant' : 'user',
        content: c.parts[0].text
      });
    }

    let response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          temperature: config.temperature ?? 0.7,
          max_tokens: 8192,
          stream: true
        })
      });
    } catch (e) {
      console.error("OpenRouter Fetch Error:", e);
      throw new Error(`Error de red al conectar con OpenRouter: ${e instanceof Error ? e.message : 'Desconocido'}`);
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("No stream");

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') return;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices[0]?.delta?.content || '';
            const finishReason = data.choices[0]?.finish_reason;
            if (content || finishReason) {
              yield { text: content, finishReason };
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
}
