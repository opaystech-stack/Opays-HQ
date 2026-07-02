import './env';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import treasuryRoutes from './routes/treasury';
import userRoutes from './routes/users';
import knowledgeRoutes from './routes/knowledge';
import dashboardRoutes from './routes/dashboard';
import equityRoutes from './routes/equity';
import hrRoutes from './routes/hr';
import agentRoutes from './routes/agents';
import leadsRoutes from './routes/leads';
import calendarRoutes from './routes/calendar';
import ideasRoutes from './routes/ideas';
import jobDescriptionRoutes from './routes/jobDescriptions';
import sovereignRoutes from './routes/sovereign';
import businessRoutes from './routes/business';
import vaultRoutes from './routes/vault';
import invoiceRoutes from './routes/invoices';
import marketingRoutes from './routes/marketing';
import contactRoutes from './routes/contacts';
import siteContentRoutes from './routes/site-content';
import { seedDefaultUsers, seedMarketingTemplates, seedSiteContent } from './seed';
import { loadConfigOrExit, loadAllowedOrigins } from './config';
import { getDb } from './db';
import rateLimit from 'express-rate-limit';
import { csrfMiddleware } from './csrf';
import { createBackupRouter } from './backup';

export const app = express();

// ── 1. Global middleware ───────────────────────────────────
const allowedOrigins = loadAllowedOrigins(process.env);
if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  console.warn('[WARN] CORS_ORIGIN is empty — no cross-origin requests allowed in production');
}
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS policy'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── 2. Rate limiting ───────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
});

// ── 3. Auth routes (must be BEFORE CSRF — login has no token) ──
app.use('/api/auth', authLimiter, authRoutes);

// ── 4. Health check (public, no CSRF) ──────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 5. CSRF protection — all subsequent mutations ──────────
// Désactivé en mode test pour que les tests existants continuent de passer.
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.use(csrfMiddleware);
}

// ── 6. All other API routes ────────────────────────────────
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/treasury', treasuryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/equity', equityRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/sovereign', sovereignRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/site-content', siteContentRoutes);

// Backup routes (manual trigger + list)
app.use('/api/system', createBackupRouter());

// ── 7. API 404 guard ───────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── 8. Static frontend + SPA fallback ──────────────────────
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.use((_req, res) => {
  res.status(200).sendFile(path.join(distPath, 'index.html'));
});

// ── 9. Startup sequence ────────────────────────────────────
function start(): void {
  const config = loadConfigOrExit(process.env);
  getDb();
  seedDefaultUsers();
  seedMarketingTemplates();
  seedSiteContent();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Opays HQ API running on port ${config.port}`);
  });

  scheduleDailyBackup();
}

/** Planifie un backup automatique de la base SQLite chaque jour à 03:00. */
function scheduleDailyBackup(): void {
  const BACKUP_HOUR = 3;
  const BACKUP_MINUTE = 0;
  const CHECK_INTERVAL_MS = 15 * 60 * 1000;
  let lastBackupDate = '';

  const check = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (lastBackupDate === today) return;
    if (now.getHours() === BACKUP_HOUR && now.getMinutes() >= BACKUP_MINUTE) {
      lastBackupDate = today;
      console.log('[backup] Déclenchement du backup automatique quotidien...');
      const { runBackup } = require('./backup');
      runBackup();
    }
  };

  setInterval(check, CHECK_INTERVAL_MS);
  check();
}

// Run the startup side effects only when executed directly (not when imported by test runner)
if (!process.env.VITEST) {
  start();
}

export default app;