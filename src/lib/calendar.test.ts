import { describe, it, expect } from 'vitest';
import { groupEventsByDay } from './calendar';

describe('groupEventsByDay', () => {
  it('regroupe par jour et trie jours puis heures', () => {
    const groups = groupEventsByDay([
      { id: 'b', title: 'B', start_time: '2026-07-02T10:00:00.000Z' },
      { id: 'a1', title: 'A1', start_time: '2026-07-01T14:00:00.000Z' },
      { id: 'a2', title: 'A2', start_time: '2026-07-01T09:00:00.000Z' },
    ]);
    expect(groups.map((g) => g.date)).toEqual(['2026-07-01', '2026-07-02']);
    expect(groups[0].events.map((e) => e.id)).toEqual(['a2', 'a1']);
    expect(groups[1].events.map((e) => e.id)).toEqual(['b']);
  });

  it('gère une date invalide sans planter', () => {
    const groups = groupEventsByDay([{ id: 'x', title: 'X', start_time: 'pas-une-date' }]);
    expect(groups[0].date).toBe('invalid');
    expect(groups[0].label).toBe('Date inconnue');
  });

  it('retourne un tableau vide pour aucune entrée', () => {
    expect(groupEventsByDay([])).toEqual([]);
  });
});
