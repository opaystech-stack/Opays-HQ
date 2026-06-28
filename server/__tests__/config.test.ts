import { describe, it, expect } from 'vitest';
import {
  validateJwtSecret,
  MIN_JWT_SECRET_LENGTH,
} from '../config';

/**
 * Unit tests for the pure `validateJwtSecret` helper.
 *
 * Covers the validation rules from design Component 1 (Requirements 3.4, 3.6):
 * - undefined / empty / whitespace-only -> JWT_SECRET_MISSING
 * - length < 32 -> JWT_SECRET_TOO_SHORT (with reported length)
 * - length >= 32 -> { ok: true, value }
 * - the missing check takes precedence over the too-short check
 */
describe('validateJwtSecret', () => {
  describe('JWT_SECRET_MISSING', () => {
    it('reports missing for undefined', () => {
      const result = validateJwtSecret(undefined);
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_MISSING' },
      });
    });

    it('reports missing for an empty string', () => {
      const result = validateJwtSecret('');
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_MISSING' },
      });
    });

    it('reports missing for a whitespace-only string', () => {
      const result = validateJwtSecret('    ');
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_MISSING' },
      });
    });

    it('reports missing for mixed whitespace (spaces, tabs, newlines)', () => {
      const result = validateJwtSecret(' \t\n\r ');
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_MISSING' },
      });
    });
  });

  describe('JWT_SECRET_TOO_SHORT', () => {
    it('reports too short for a 31-character secret (just below the boundary)', () => {
      const raw = 'a'.repeat(MIN_JWT_SECRET_LENGTH - 1); // 31 chars
      const result = validateJwtSecret(raw);
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_TOO_SHORT', length: 31 },
      });
    });

    it('reports too short for a single non-whitespace character', () => {
      const result = validateJwtSecret('x');
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_TOO_SHORT', length: 1 },
      });
    });

    it('reports the raw length even when the value has surrounding whitespace', () => {
      // "  abc  " -> non-whitespace after trim, raw length 7 (< 32)
      const raw = '  abc  ';
      const result = validateJwtSecret(raw);
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_TOO_SHORT', length: raw.length },
      });
    });
  });

  describe('valid secrets', () => {
    it('accepts a secret exactly at the 32-character boundary', () => {
      const raw = 'a'.repeat(MIN_JWT_SECRET_LENGTH); // 32 chars
      const result = validateJwtSecret(raw);
      expect(result).toEqual({ ok: true, value: raw });
    });

    it('accepts a secret longer than the minimum', () => {
      const raw = 'a'.repeat(MIN_JWT_SECRET_LENGTH + 50);
      const result = validateJwtSecret(raw);
      expect(result).toEqual({ ok: true, value: raw });
    });

    it('returns the value unchanged (including surrounding whitespace) for a long secret', () => {
      // 2 leading spaces + 32 chars = raw length 34 (>= 32), non-whitespace content.
      const raw = '  ' + 'k'.repeat(MIN_JWT_SECRET_LENGTH);
      const result = validateJwtSecret(raw);
      expect(result).toEqual({ ok: true, value: raw });
    });
  });

  describe('missing check precedence over too-short check', () => {
    it('reports MISSING (not TOO_SHORT) for a short whitespace-only string', () => {
      const result = validateJwtSecret('   '); // length 3, all whitespace
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_MISSING' },
      });
    });

    it('reports MISSING (not TOO_SHORT) for a long whitespace-only string', () => {
      const raw = ' '.repeat(MIN_JWT_SECRET_LENGTH + 10); // length 42, all whitespace
      const result = validateJwtSecret(raw);
      // Even though raw.length >= 32, a whitespace-only value is reported as MISSING.
      expect(result).toEqual({
        ok: false,
        error: { kind: 'JWT_SECRET_MISSING' },
      });
    });
  });
});
