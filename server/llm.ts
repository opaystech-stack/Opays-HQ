import type { OpenRouterConfig } from './config';

/**
 * Client minimal pour l'API OpenRouter (compatible OpenAI Chat Completions).
 * La clé API n'est jamais journalisée ni renvoyée au client.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Appelle le LLM et retourne le texte de la réponse de l'assistant.
 * Lève une erreur si la requête échoue ou si la réponse est vide.
 */
export async function chatCompletion(
  cfg: OpenRouterConfig,
  messages: ChatMessage[],
  options: { temperature?: number } = {},
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json',
      // En-têtes recommandés par OpenRouter pour l'attribution.
      'HTTP-Referer': 'https://hq.opays.io',
      'X-Title': 'Opays HQ',
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    // On ne logge pas la clé ; seulement le statut et un éventuel message d'erreur.
    let detail = '';
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body?.error?.message ?? '';
    } catch {
      /* ignore */
    }
    throw new Error(`OpenRouter a répondu ${res.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Réponse LLM vide');
  }
  return content;
}
