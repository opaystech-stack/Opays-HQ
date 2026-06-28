import { describe, it, expect, afterEach, vi } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';

/**
 * Tests for database initialization (server/db.ts).
 *
 * getDb() memoizes the connection in a module-level `let db`, so each scenario
 * resets the module registry (vi.resetModules) and dynamically re-imports db.ts
 * after pointing DATA_DIR at a fresh location.
 *
 * Validates: Requirements 5.4, 5.5, 5.7
 */

const DB_FILE_NAME = 'opays-hq.db';
const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'opays-db-test-'));
  tempDirs.push(dir);
  return dir;
}

async function loadFreshDbModule() {
  vi.resetModules();
  return import('../db');
}

const originalDataDir = process.env.DATA_DIR;

afterEach(() => {
  // Restore env and clean up any spies between cases.
  if (originalDataDir === undefined) {
    delete process.env.DATA_DIR;
  } else {
    process.env.DATA_DIR = originalDataDir;
  }
  vi.restoreAllMocks();
});

afterEach(() => {
  // Remove all temp dirs created during the run.
  for (const dir of tempDirs.splice(0)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup; ignore errors (e.g., locked WAL files on Windows).
    }
  }
});

describe('database initialization', () => {
  describe('fresh data directory (Requirement 5.4)', () => {
    it('creates the database file and initializes schema + seed data', async () => {
      // Point at a fresh, EMPTY (but existing) temp dir with no db file yet.
      const dataDir = makeTempDir();
      process.env.DATA_DIR = dataDir;

      const dbPath = path.join(dataDir, DB_FILE_NAME);
      expect(fs.existsSync(dbPath)).toBe(false);

      const { getDb } = await loadFreshDbModule();
      const db = getDb();

      // The database file now exists on disk.
      expect(fs.existsSync(dbPath)).toBe(true);

      // Schema was initialized: core tables exist.
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((r: { name: string }) => r.name);
      for (const expected of [
        'roles',
        'users',
        'projects',
        'tasks',
        'task_comments',
        'agent_configs',
        'agent_conversations',
        'knowledge_articles',
        'treasury_logs',
        'equity_logs',
      ]) {
        expect(tables).toContain(expected);
      }

      // Seed data was inserted (7 default roles).
      const { c } = db.prepare('SELECT COUNT(*) AS c FROM roles').get() as { c: number };
      expect(c).toBe(7);

      db.close();
    });

    it('creates the data directory if it is absent', async () => {
      // Point at a NON-EXISTENT nested dir so getDb() must mkdir it.
      const parent = makeTempDir();
      const dataDir = path.join(parent, 'nested', 'data');
      process.env.DATA_DIR = dataDir;

      expect(fs.existsSync(dataDir)).toBe(false);

      const { getDb } = await loadFreshDbModule();
      const db = getDb();

      expect(fs.existsSync(dataDir)).toBe(true);
      expect(fs.existsSync(path.join(dataDir, DB_FILE_NAME))).toBe(true);

      db.close();
    });
  });

  describe('re-opening an existing database (Requirement 5.7)', () => {
    it('does not re-seed or overwrite existing rows', async () => {
      const dataDir = makeTempDir();
      process.env.DATA_DIR = dataDir;

      // First open: creates + seeds.
      const first = await loadFreshDbModule();
      const db1 = first.getDb();
      const { c: seededCount } = db1
        .prepare('SELECT COUNT(*) AS c FROM roles')
        .get() as { c: number };
      expect(seededCount).toBe(7);

      // Mutate an existing row to prove it is preserved on re-open.
      db1.prepare('UPDATE roles SET label = ? WHERE id = ?').run('Changed Label', 'role_admin');
      // Insert an extra row so the row-count guard would skip re-seeding.
      db1
        .prepare('INSERT INTO roles (id, name, label, level) VALUES (?, ?, ?, ?)')
        .run('role_custom', 'custom', 'Custom', 5);
      db1.close();

      // Second open against the SAME directory: must open in place, no re-seed.
      const second = await loadFreshDbModule();
      const db2 = second.getDb();

      const { c: reopenCount } = db2
        .prepare('SELECT COUNT(*) AS c FROM roles')
        .get() as { c: number };
      // 7 seeded + 1 custom = 8; re-seeding would not change count, but the
      // custom row and the edited label prove no overwrite/re-init occurred.
      expect(reopenCount).toBe(8);

      const adminLabel = db2
        .prepare('SELECT label FROM roles WHERE id = ?')
        .get('role_admin') as { label: string };
      expect(adminLabel.label).toBe('Changed Label');

      const custom = db2
        .prepare('SELECT id FROM roles WHERE id = ?')
        .get('role_custom') as { id: string } | undefined;
      expect(custom?.id).toBe('role_custom');

      db2.close();
    });
  });

  describe('unwritable/absent directory (Requirement 5.5)', () => {
    it('fails startup and logs a storage failure when the directory cannot be created', async () => {
      // Create a real FILE, then point DATA_DIR at a path *under* that file.
      // mkdirSync cannot create a directory beneath a regular file, so the
      // directory creation / db open fails and getDb() must throw.
      const base = makeTempDir();
      const blockingFile = path.join(base, 'not-a-dir');
      fs.writeFileSync(blockingFile, 'this is a file, not a directory');

      const dataDir = path.join(blockingFile, 'cannot', 'exist');
      process.env.DATA_DIR = dataDir;

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { getDb } = await loadFreshDbModule();

      expect(() => getDb()).toThrow(/storage initialization failed/i);
      expect(errorSpy).toHaveBeenCalled();

      // The storage-failure log identifies the offending path.
      const loggedMessage = errorSpy.mock.calls.map((args) => args.join(' ')).join('\n');
      expect(loggedMessage).toContain('Storage failure');
      expect(loggedMessage).toContain(DB_FILE_NAME);
    });
  });
});
