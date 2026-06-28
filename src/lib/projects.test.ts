import { describe, it, expect } from 'vitest';
import { projectProgress, parseTechStack } from './projects';

describe('projectProgress', () => {
  it('mappe les statuts connus', () => {
    expect(projectProgress('planning')).toBe(10);
    expect(projectProgress('active')).toBe(50);
    expect(projectProgress('completed')).toBe(100);
    expect(projectProgress('cancelled')).toBe(0);
  });
  it('retourne 0 pour un statut inconnu', () => {
    expect(projectProgress('weird')).toBe(0);
  });
});

describe('parseTechStack', () => {
  it('parse un JSON valide', () => {
    expect(parseTechStack('["React","Express"]')).toEqual(['React', 'Express']);
  });
  it('tolère null / vide / JSON invalide', () => {
    expect(parseTechStack(null)).toEqual([]);
    expect(parseTechStack('')).toEqual([]);
    expect(parseTechStack('{pas du json')).toEqual([]);
  });
  it('ignore un JSON non-tableau', () => {
    expect(parseTechStack('{"a":1}')).toEqual([]);
  });
});
