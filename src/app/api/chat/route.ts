import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const requestSchema = z.object({
  messages: z.array(z.any()).default([]),
  userProfile: z
    .object({
      id: z.string().optional(),
      full_name: z.string().optional(),
      role: z.string().optional(),
      type: z.string().optional(),
    })
    .passthrough()
    .optional(),
  modelId: z.string().optional(),
  role: z.string().optional(),
});

function buildSystemPrompt(userProfile?: { full_name?: string; role?: string; type?: string }, role?: string) {
  if (role === 'CREATIVE_AGENT') {
    return `Tu es l'Expert Branding d'Opays Tech. Ta mission est d'aider l'\u00e9quipe (notamment Zaina, responsable Comm) \u00e0 cr\u00e9er des contenus impactants qui refl\u00e8tent l'identit\u00e9 souveraine, tech et pragmatique d'Opays.
    
Les codes de la marque :
- Couleurs : Cyan, Pink, Dark Blue, Violet (Gradients futuristes).
- Typographie : Moderne, sans-serif, lisible.
- Ton : Direct, expert, inspirant, sans fioritures.
- Valeurs : Souverainet\u00e9 num\u00e9rique, efficacit\u00e9 commando, pragmatisme business.

Tu aides \u00e0 :
1. Structurer des Flyers (accroche, b\u00e9n\u00e9fices, CTA).
2. D\u00e9finir le plan de pr\u00e9sentations Canva.
3. R\u00e9diger des posts LinkedIn ou des emails clients percutants.
4. Cr\u00e9er des slogans ou des accroches marketing coh\u00e9rentes.

Sois cr\u00e9atif mais reste fid\u00e8le \u00e0 la culture "Commando" d'Opays.`;
  }

  return `Tu es Opays Help Ai OS, le syst\u00e8me nerveux de OPAYS HQ.
  
R\u00e8gles de comportement:
- R\u00e9ponds comme un directeur d'exploitation et un copilote strat\u00e9gique.
- Priorise la clart\u00e9 op\u00e9rationnelle, les chiffres, les d\u00e9cisions et les actions suivantes.
- Quand tu utilises un outil, explique bri\u00e8vement pourquoi et ce que le r\u00e9sultat change.
- Si les donn\u00e9es sont insuffisantes, dis-le explicitement et propose la prochaine v\u00e9rification.
- Ne fabrique jamais de chiffres.

Contexte utilisateur:
- Nom: ${userProfile?.full_name || 'Inconnu'}
- R\u00f4le: ${userProfile?.role || 'Inconnu'}
- Type: ${userProfile?.type || 'Inconnu'}

Objectif:
- Servir de Command Center pour une \u00e9quipe de 5 personnes.
- Relier les d\u00e9cisions aux tables tasks, activity_log et treasury_logs.
- G\u00e9n\u00e9rer des actions tra\u00e7ables plut\u00f4t que des r\u00e9ponses vagues.`;
}

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: 'OPENROUTER_API_KEY is missing' }, { status: 500 });
  }

  const body = requestSchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: 'Invalid chat payload' }, { status: 400 });
  }

  const { messages, userProfile, modelId, role } = body.data;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const selectedModel = modelId || 'deepseek/deepseek-chat';

  const result = await streamText({
    model: openrouter(selectedModel),
    system: buildSystemPrompt(userProfile, role),
    messages,
    temperature: 0.2,
    tools: {
      create_task: tool({
        description: "Crée une nouvelle tâche et consigne l'action dans activity_log.",
        parameters: z.object({
          title: z.string().min(3),
          description: z.string().optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
          assigned_to_name: z.string().optional(),
          project_id: z.string().uuid().optional(),
        }),
        execute: async (params) => {
          let assigned_to_id: string | null = null;

          if (params.assigned_to_name) {
            const { data: assignee } = await supabase
              .from('profiles')
              .select('id, full_name')
              .ilike('full_name', `%${params.assigned_to_name}%`)
              .limit(1)
              .maybeSingle();

            assigned_to_id = assignee?.id ?? null;
          }

          const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert({
              title: params.title,
              description: params.description,
              priority: params.priority,
              assigned_to: assigned_to_id,
              project_id: params.project_id ?? null,
              status: 'TODO',
              created_by: user.id,
            })
            .select('*')
            .single();

          if (taskError || !task) {
            return { error: taskError?.message || 'Task creation failed' };
          }

          await supabase.from('activity_log').insert({
            actor_id: user.id,
            action: 'CREATED',
            entity_type: 'TASK',
            entity_id: task.id,
            entity_title: task.title,
            details: {
              source: 'ai',
              priority: task.priority,
              assigned_to: assigned_to_id,
            },
          });

          return { success: true, task };
        },
      }),

      update_task_status: tool({
        description: 'Met à jour le statut d une tâche et écrit un événement dans activity_log.',
        parameters: z.object({
          task_id: z.string().uuid(),
          status: z.enum(['TODO', 'DOING', 'DONE']),
        }),
        execute: async ({ task_id, status }) => {
          const { data: task, error } = await supabase
            .from('tasks')
            .update({ status })
            .eq('id', task_id)
            .select('id, title, status')
            .single();

          if (error || !task) {
            return { error: error?.message || 'Task update failed' };
          }

          await supabase.from('activity_log').insert({
            actor_id: user.id,
            action: 'STATUS_CHANGED',
            entity_type: 'TASK',
            entity_id: task.id,
            entity_title: task.title,
            details: {
              source: 'ai',
              status,
            },
          });

          return { success: true, task };
        },
      }),

      get_activity_report: tool({
        description: 'Récupère les dernières activités de l entreprise avec le nom de l auteur quand possible.',
        parameters: z.object({
          limit: z.number().int().min(1).max(25).default(10),
        }),
        execute: async ({ limit }) => {
          const { data, error } = await supabase
            .from('activity_log')
            .select('created_at, action, entity_type, entity_title, actor_id, details')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) return { error: error.message };

          const actorIds = [...new Set((data || []).map((entry) => entry.actor_id).filter(Boolean))];
          const { data: actors } = actorIds.length
            ? await supabase.from('profiles').select('id, full_name, role').in('id', actorIds)
            : { data: [] };

          const actorMap = new Map((actors || []).map((actor) => [actor.id, actor]));

          return {
            activities: (data || []).map((entry) => ({
              ...entry,
              actor: actorMap.get(entry.actor_id) || null,
            })),
          };
        },
      }),

      search_knowledge: tool({
        description: 'Cherche des informations dans les articles de méthode et guides.',
        parameters: z.object({
          query: z.string().min(2),
        }),
        execute: async ({ query }) => {
          const { data, error } = await supabase
            .from('knowledge_articles')
            .select('title, content, category, target_role')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .limit(3);

          if (error) return { error: error.message };
          return { articles: data };
        },
      }),

      get_financial_snapshot: tool({
        description: 'Récupère un résumé de la trésorerie, des factures et du solde net.',
        parameters: z.object({}),
        execute: async () => {
          const { data: logs, error: logsError } = await supabase
            .from('treasury_logs')
            .select('type, amount, category, description, date')
            .order('date', { ascending: false })
            .limit(100);

          if (logsError) return { error: logsError.message };

          const { data: billing, error: billingError } = await supabase
            .from('project_billing')
            .select('amount_total, amount_paid, status')
            .eq('status', 'PENDING');

          if (billingError) return { error: billingError.message };

          const income = logs?.filter((log) => log.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
          const expenses = logs?.filter((log) => log.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;
          const pendingInvoices = billing?.reduce((acc, curr) => acc + Number(curr.amount_total || 0) - Number(curr.amount_paid || 0), 0) || 0;

          return {
            balance: income - expenses,
            total_income: income,
            total_expenses: expenses,
            pending_invoices_amount: pendingInvoices,
            recent_entries: logs?.slice(0, 5) || [],
          };
        },
      }),

      get_command_center_snapshot: tool({
        description: 'Retourne un état consolidé des tâches, activités et trésorerie pour le Command Center.',
        parameters: z.object({}),
        execute: async () => {
          const [
            { data: tasks },
            { data: activities },
            { data: logs },
          ] = await Promise.all([
            supabase.from('tasks').select('id, title, status, priority, due_date').order('created_at', { ascending: false }).limit(5),
            supabase.from('activity_log').select('created_at, action, entity_type, entity_title').order('created_at', { ascending: false }).limit(5),
            supabase.from('treasury_logs').select('type, amount, category, description').order('date', { ascending: false }).limit(5),
          ]);

          return {
            tasks,
            activities,
            treasury: logs,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
