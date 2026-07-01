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
import { seedDefaultUsers, seedMarketingTemplates } from './seed';
import { loadConfigOrExit } from './config';
import { getDb } from './db';

export const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
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

// Health check — formalized contract consumed by the platform health check.
// res.json sets Content-Type: application/json and status 200 by default.
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 404 guard — must run AFTER the API routers but BEFORE the static/SPA
// fallback so unmatched /api/* requests receive a JSON 404 and never the SPA
// entry document.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Serve static frontend in production — returns matched assets with 200.
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback — only reached for non-API paths that did not match a static
// asset; returns index.html with status 200.
app.use((_req, res) => {
  res.status(200).sendFile(path.join(distPath, 'index.html'));
});

// Startup sequence (design "Startup sequence"): validate configuration and make
// storage ready BEFORE binding the port. The server must only bind
// `0.0.0.0:3001` after JWT_SECRET validation passes and the database has been
// opened/initialized. Any failure aborts startup without binding.
function start(): void {
  // 1. Fail-fast configuration validation. On invalid JWT_SECRET this logs and
  //    calls process.exit(1), so the process never reaches app.listen.
  const config = loadConfigOrExit(process.env);

  // 2. Open/initialize the database (schema + role seeding). getDb() throws on
  //    storage failure, which propagates and aborts startup before binding.
  getDb();

  // 3. Seed default users now that storage is ready.
  seedDefaultUsers();

  // 4. Seed marketing templates.
  seedMarketingTemplates();

  // 5. Only now is it safe to bind the port and accept traffic.
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Opays HQ API running on port ${config.port}`);
  });
}

// Run the startup side effects (config validation, DB init, port bind) only when
// this module is executed directly (e.g. `tsx server/index.ts` in production).
// When imported by a test runner (Vitest sets `process.env.VITEST`) we skip
// `start()` so the configured `app` can be imported with supertest without
// binding a port or triggering `process.exit`.
if (!process.env.VITEST) {
  start();
}

export default app;
