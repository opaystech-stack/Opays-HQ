import type { TreasuryLog } from '../types/database';

export interface TreasurySummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
}

/**
 * Synthèse pure des écritures de trésorerie.
 * Le solde net = revenus − dépenses (les transferts n'affectent pas le net).
 */
export function summarizeTreasury(logs: Pick<TreasuryLog, 'amount' | 'type'>[]): TreasurySummary {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const log of logs) {
    if (log.type === 'income') totalIncome += log.amount;
    else if (log.type === 'expense') totalExpense += log.amount;
  }
  return { totalIncome, totalExpense, net: totalIncome - totalExpense };
}
