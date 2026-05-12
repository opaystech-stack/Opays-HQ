import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Config OpenRouter
const openrouter = openai({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages, userProfile } = await req.json();

  const result = await streamText({
    model: openrouter('deepseek/deepseek-chat'),
    system: `Tu es l'Intelligence de Bord de OPAYS HQ, un système d'exploitation d'entreprise premium. 
    Ton nom est "Antigravity OS".
    
    CONTEXTE UTILISATEUR:
    - Nom: ${userProfile?.full_name}
    - Rôle: ${userProfile?.role}
    - Type: ${userProfile?.type}
    
    TON TON:
    - Professionnel, précis, calme, et légèrement futuriste.
    - Pas de blabla inutile. Va droit au but.
    - Tu connais la structure de l'app (Dashboard, Leads, Projects, Workspace, Studio, Treasury).
    
    TES CAPACITÉS:
    - Tu guides l'utilisateur dans l'application.
    - Tu peux répondre à des questions sur la stratégie Opays Tech.
    - Tu peux manipuler les données (via des outils que nous allons ajouter).
    
    CONSIGNE: Si l'utilisateur demande de faire quelque chose que tu ne peux pas encore faire (ex: supprimer un projet), explique que cette capacité est en cours de déploiement par l'ingénierie.`,
    messages,
  });

  return result.toDataStreamResponse();
}
