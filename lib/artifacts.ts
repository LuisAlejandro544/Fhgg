import { Message, Artifact } from '@/types/agent';

export function extractArtifacts(messages: Message[]): Artifact[] {
  const artifacts: Artifact[] = [];
  
  messages.forEach(msg => {
    // Remove <think> blocks to avoid extracting thought process code
    const textWithoutThink = msg.text.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Regex to match ```html ... ```
    const regex = /```(html)\s*\n([\s\S]*?)```/g;
    let match;
    let index = 0;
    
    while ((match = regex.exec(textWithoutThink)) !== null) {
      artifacts.push({
        id: `${msg.id}-${index}`,
        messageId: msg.id,
        title: `index_${artifacts.length + 1}.html`,
        language: match[1],
        content: match[2].trim()
      });
      index++;
    }
  });
  
  return artifacts;
}
