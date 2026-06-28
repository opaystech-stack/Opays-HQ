export interface CalendarEventLike {
  id: string;
  title: string;
  start_time: string;
  [key: string]: unknown;
}

export interface EventDayGroup<T> {
  date: string; // clé AAAA-MM-JJ
  label: string; // libellé lisible
  events: T[];
}

/**
 * Regroupe les événements par jour (clé date locale), triés par jour croissant
 * puis par heure de début. Pur et testable.
 */
export function groupEventsByDay<T extends CalendarEventLike>(events: T[]): EventDayGroup<T>[] {
  const byDay = new Map<string, T[]>();
  for (const ev of events) {
    const d = new Date(ev.start_time);
    const key = Number.isNaN(d.getTime()) ? 'invalid' : d.toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(ev);
    byDay.set(key, arr);
  }
  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, evs]) => ({
      date,
      label:
        date === 'invalid'
          ? 'Date inconnue'
          : new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      events: evs.sort((x, y) => x.start_time.localeCompare(y.start_time)),
    }));
}
