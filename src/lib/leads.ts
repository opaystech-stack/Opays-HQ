import type { Lead, LeadStatus, TaskPriority } from '../types/database';

export interface LeadsSummary {
  totalPipeline: number; // somme des valeurs estimées des leads encore actifs (ni won ni lost)
  inAudit: number;       // nombre de leads au statut 'audit'
  won: number;           // nombre de leads gagnés
  total: number;         // nombre total de leads
}

const ACTIVE_PIPELINE: LeadStatus[] = ['new', 'contacted', 'audit', 'proposal'];

/** Synthèse pure du « Revenue Control Center ». */
export function summarizeLeads(leads: Pick<Lead, 'estimated_value' | 'status'>[]): LeadsSummary {
  let totalPipeline = 0;
  let inAudit = 0;
  let won = 0;
  for (const l of leads) {
    if (ACTIVE_PIPELINE.includes(l.status)) totalPipeline += l.estimated_value ?? 0;
    if (l.status === 'audit') inAudit += 1;
    if (l.status === 'won') won += 1;
  }
  return { totalPipeline, inAudit, won, total: leads.length };
}

export interface LeadFilter {
  search?: string;
  status?: LeadStatus | 'all';
  priority?: TaskPriority | 'all';
  assigneeId?: string | 'all';
}

/** Filtre en mémoire : recherche texte (entreprise/contact) + statut/priorité/assigné. */
export function filterLeads(leads: Lead[], f: LeadFilter): Lead[] {
  const q = f.search?.trim().toLowerCase() ?? '';
  return leads.filter((l) => {
    if (q) {
      const hay = `${l.company_name} ${l.contact_name ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.status && f.status !== 'all' && l.status !== f.status) return false;
    if (f.priority && f.priority !== 'all' && l.priority !== f.priority) return false;
    if (f.assigneeId && f.assigneeId !== 'all' && l.assignee_id !== f.assigneeId) return false;
    return true;
  });
}
