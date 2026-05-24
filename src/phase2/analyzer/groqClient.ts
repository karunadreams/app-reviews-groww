import Groq from 'groq-sdk';
import { loadConfig } from '../../config';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const config = loadConfig();
    groqClient = new Groq({
      apiKey: config.groqApiKey,
    });
  }
  return groqClient;
}

export async function callGroqWithRetry(
  systemPrompt: string,
  userPrompt: string,
  retries = 3,
  delayMs = 2000
): Promise<string> {
  const client = getGroqClient();

  for (let i = 0; i < retries; i++) {
    try {
      const response = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      return response.choices[0]?.message?.content || '{}';
    } catch (error: any) {
      console.warn(`[Groq API] Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) {
        throw new Error(`Groq API failed after ${retries} attempts. Last error: ${error.message}`);
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
    }
  }
  return '{}';
}
