import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Config OpenRouter
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages, userProfile, modelId } = await req.json();
  const supabase = await createServerSupabaseClient();

  // On utilise le modèle choisi par l'utilisateur ou DeepSeek par défaut
  const selectedModel = modelId || 'deepseek/deepseek-chat';

  const result = await streamText({
    model: openrouter(selectedModel),
    system: `Tu es Antigravity OS, l'IA de pilotage de OPAYS HQ.
    Utilisateur actuel: ${userProfile?.full_name} (${userProfile?.role}).
    
    IMPORTANT: Tu es actuellement dans le Command Center (Station de Travail). 
    Tes réponses doivent être structurées (Markdown, tableaux, listes).
    Tu es un expert en stratégie, rédaction et gestion de projet.`,
    messages,
    tools: {
      create_task: tool({
        description: 'Crée une nouvelle tâche dans le système Opays HQ',
        parameters: z.object({
          title: z.string(),
          description: z.string().optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
          assigned_to_name: z.string().optional(),
          due_date: z.string().optional(),
        }),
        execute: async (params: any) => {
          const { title, description, priority, assigned_to_name, due_date } = params;
          let assigned_to_id = null;
          if (assigned_to_name) {
            const { data: profile } = await supabase.from('profiles').select('id').ilike('full_name', `%${assigned_to_name}%`).single();
            assigned_to_id = profile?.id;
          }
          const { data, error } = await supabase.from('tasks').insert({
            title, description, priority, assigned_to: assigned_to_id, due_date: due_date || null, status: 'TODO'
          }).select().single();
          if (error) return { error: error.message };
          return { success: true, task: data };
        },
      }),
      get_team_info: tool({
        description: 'Récupère la liste des membres de l\'équipe',
        parameters: z.object({}),
        execute: async () => {
          const { data } = await supabase.from('profiles').select('full_name, role');
          return { team: data };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
