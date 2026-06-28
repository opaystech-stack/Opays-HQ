export interface EquityLogLike {
  shares_vested: number;
  vesting_date: string;
}

export interface VestingPoint {
  date: string;
  vested: number; // cumul des parts acquises à cette date
}

/**
 * Construit la série cumulée de vesting dans le temps, triée par date croissante.
 * Pure et testable.
 */
export function buildVestingSeries(logs: EquityLogLike[]): VestingPoint[] {
  const sorted = [...logs].sort((a, b) => a.vesting_date.localeCompare(b.vesting_date));
  let cumulative = 0;
  return sorted.map((log) => {
    cumulative += log.shares_vested;
    return { date: log.vesting_date, vested: cumulative };
  });
}
