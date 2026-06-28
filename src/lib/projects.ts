export type ProjectStatusKey = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';

const PROGRESS: Record<ProjectStatusKey, number> = {
  planning: 10,
  active: 50,
  paused: 40,
  completed: 100,
  cancelled: 0,
};

/** Pourcentage d'avancement dérivé du statut (pur, testable). */
export function projectProgress(status: string): number {
  return PROGRESS[status as ProjectStatusKey] ?? 0;
}

/** Parse le champ tech_stack (JSON sérialisé) en tableau de chaînes, tolérant aux erreurs. */
export function parseTechStack(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
