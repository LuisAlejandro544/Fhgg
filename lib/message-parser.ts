export function parseMessageText(rawText: string) {
  let thought = '';
  let cleanText = rawText;
  const calls: { agentId: string; prompt: string }[] = [];
  const tools: { name: string; filename?: string; content: string }[] = [];
  const searches: { engine?: string; query: string }[] = [];

  // Extract <think>
  // We use a regex that looks for </think> followed by a newline or end of string,
  // or we fallback to lastIndexOf if the model is streaming or formatting weirdly.
  const thinkMatch = rawText.match(/<think>([\s\S]*?)<\/think>(?:\n|$)/);
  
  if (thinkMatch) {
    thought = thinkMatch[1].trim();
    cleanText = rawText.replace(/<think>[\s\S]*?<\/think>(?:\n|$)/, '').trim();
  } else {
    // Fallback for streaming or when </think> is missing/malformed
    const thinkStartIndex = rawText.indexOf('<think>');
    if (thinkStartIndex !== -1) {
      const thinkEndIndex = rawText.lastIndexOf('</think>');
      if (thinkEndIndex !== -1 && thinkEndIndex > thinkStartIndex) {
        thought = rawText.substring(thinkStartIndex + 7, thinkEndIndex).trim();
        cleanText = rawText.substring(0, thinkStartIndex) + rawText.substring(thinkEndIndex + 8).trim();
      } else {
        // No closing tag found (streaming)
        thought = rawText.substring(thinkStartIndex + 7).trim();
        cleanText = rawText.substring(0, thinkStartIndex).trim();
      }
    }
  }

  // Extract [CALL:id|prompt]
  const callRegex = /\[CALL:([^|\]\n]+)\|([^\]]+?)(?:\]|$)/g;
  let match;
  while ((match = callRegex.exec(cleanText)) !== null) {
    calls.push({ agentId: match[1].trim(), prompt: match[2].trim() });
  }
  cleanText = cleanText.replace(/\[CALL:([^|\]\n]+)\|([^\]]+?)(?:\]|$)/g, '').trim();

  // Extract [TOOL:name|content] or [TOOL:name|filename|content]
  const toolRegex = /\[TOOL:([^|]+)\|([\s\S]*?)\]/g;
  let toolMatch;
  while ((toolMatch = toolRegex.exec(cleanText)) !== null) {
    const name = toolMatch[1].trim();
    let content = toolMatch[2].trim();
    let filename = undefined;

    if (name === 'pdf') {
      const firstPipeIndex = content.indexOf('|');
      if (firstPipeIndex !== -1 && firstPipeIndex < 100) {
        filename = content.substring(0, firstPipeIndex).trim();
        content = content.substring(firstPipeIndex + 1).trim();
      } else {
        filename = 'documento.pdf';
      }
    }

    tools.push({ name, filename, content });
  }
  cleanText = cleanText.replace(/\[TOOL:([^|]+)\|([\s\S]*?)\]/g, '').trim();

  // Extract [SEARCH:query]
  const searchRegex = /\[SEARCH:([^\]]+)\]/g;
  let searchMatch;
  while ((searchMatch = searchRegex.exec(cleanText)) !== null) {
    searches.push({ query: searchMatch[1].trim() });
  }
  cleanText = cleanText.replace(/\[SEARCH:([^\]]+)\]/g, '').trim();

  return { thought, cleanText, calls, tools, searches };
}
