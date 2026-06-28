import { describe, it, expect } from 'vitest';
import type { Lead } from '../types/database';
import { summarizeLeads, filterLeads } from './leads';

function makeLead(o: Partial<Lead> & { id: string }): Lead {
  return {
    id: o.id,
    company_name: o.company_name ?? 'ACME',
    contact_name: o.contact_name ?? null,
    email: null,
    phone: null,
    estimated_value: o.estimated_value ?? 0,
    status: o.status ?? 'new',
    priority: o.priority ?? 'medium',
    assignee_id: o.assignee_id ?? null,
    assignee_name: o.assignee_name ?? null,
    notes: null,
    converted_project_id: o.converted_project_id ?? null,
    created_by: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...o,
  };
}

describe('summarizeLeads', () => {
  it('calcule pipeline actif, audit, gagnés et total', () => {
    const s = summarizeLeads([
      makeLead({ id: '1', status: 'new', estimated_value: 1000 }),
      makeLead({ id: '2', status: 'audit', estimated_value: 2000 }),
      makeLead({ id: '3', status: 'proposal', estimated_value: 3000 }),
      makeLead({ id: '4', status: 'won', estimated_value: 5000 }),
      makeLead({ id: '5', status: 'lost', estimated_value: 9000 }),
    ]);
    // Pipeline = new + audit + proposal = 1000 + 2000 + 3000 (won et lost exclus)
    expect(s.totalPipeline).toBe(6000);
    expect(s.inAudit).toBe(1);
    expect(s.won).toBe(1);
    expect(s.total).toBe(5);
  });

  it('retourne des zéros pour une liste vide', () => {
    expect(summarizeLeads([])).toEqual({ totalPipeline: 0, inAudit: 0, won: 0, total: 0 });
  });
});

describe('filterLeads', () => {
  const leads = [
    makeLead({ id: '1', company_name: 'Orange', contact_name: 'Alice', status: 'new', priority: 'high', assignee_id: 'u1' }),
    makeLead({ id: '2', company_name: 'Bouygues', contact_name: 'Bob', status: 'won', priority: 'low', assignee_id: 'u2' }),
    makeLead({ id: '3', company_name: 'Free', contact_name: 'Alice Martin', status: 'audit', priority: 'high', assignee_id: 'u1' }),
  ];

  it('recherche par entreprise/contact (insensible à la casse)', () => {
    expect(filterLeads(leads, { search: 'alice' }).map((l) => l.id)).toEqual(['1', '3']);
    expect(filterLeads(leads, { search: 'free' }).map((l) => l.id)).toEqual(['3']);
  });
  it('filtre par statut', () => {
    expect(filterLeads(leads, { status: 'won' }).map((l) => l.id)).toEqual(['2']);
  });
  it('filtre par priorité', () => {
    expect(filterLeads(leads, { priority: 'high' }).map((l) => l.id)).toEqual(['1', '3']);
  });
  it('filtre par assigné', () => {
    expect(filterLeads(leads, { assigneeId: 'u1' }).map((l) => l.id)).toEqual(['1', '3']);
  });
  it('combine recherche + filtres', () => {
    expect(filterLeads(leads, { search: 'alice', priority: 'high', assigneeId: 'u1' }).map((l) => l.id)).toEqual(['1', '3']);
  });
  it('« all » ne filtre rien', () => {
    expect(filterLeads(leads, { status: 'all', priority: 'all', assigneeId: 'all' })).toHaveLength(3);
  });
});
