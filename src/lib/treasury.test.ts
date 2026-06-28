import { describe, it, expect } from 'vitest';
import { summarizeTreasury } from './treasury';

describe('summarizeTreasury', () => {
  it('additionne revenus et dépenses et calcule le net', () => {
    const s = summarizeTreasury([
      { amount: 1000, type: 'income' },
      { amount: 250, type: 'expense' },
      { amount: 500, type: 'income' },
      { amount: 100, type: 'expense' },
    ]);
    expect(s.totalIncome).toBe(1500);
    expect(s.totalExpense).toBe(350);
    expect(s.net).toBe(1150);
  });

  it('ignore les transferts dans le net', () => {
    const s = summarizeTreasury([
      { amount: 1000, type: 'income' },
      { amount: 9999, type: 'transfer' },
    ]);
    expect(s.totalIncome).toBe(1000);
    expect(s.totalExpense).toBe(0);
    expect(s.net).toBe(1000);
  });

  it('retourne des zéros pour une liste vide', () => {
    expect(summarizeTreasury([])).toEqual({ totalIncome: 0, totalExpense: 0, net: 0 });
  });

  it('gère un net négatif', () => {
    const s = summarizeTreasury([
      { amount: 100, type: 'income' },
      { amount: 400, type: 'expense' },
    ]);
    expect(s.net).toBe(-300);
  });
});
