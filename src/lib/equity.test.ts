import { describe, it, expect } from 'vitest';
import { buildVestingSeries } from './equity';

describe('buildVestingSeries', () => {
  it('trie par date et cumule les parts acquises', () => {
    const series = buildVestingSeries([
      { shares_vested: 100, vesting_date: '2026-03-01' },
      { shares_vested: 50, vesting_date: '2026-01-01' },
      { shares_vested: 25, vesting_date: '2026-02-01' },
    ]);
    expect(series).toEqual([
      { date: '2026-01-01', vested: 50 },
      { date: '2026-02-01', vested: 75 },
      { date: '2026-03-01', vested: 175 },
    ]);
  });

  it('ne mute pas la liste d\'entrée', () => {
    const input = [
      { shares_vested: 10, vesting_date: '2026-02-01' },
      { shares_vested: 20, vesting_date: '2026-01-01' },
    ];
    const copy = [...input];
    buildVestingSeries(input);
    expect(input).toEqual(copy);
  });

  it('retourne une série vide pour une entrée vide', () => {
    expect(buildVestingSeries([])).toEqual([]);
  });
});
