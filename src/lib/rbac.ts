export type DashboardRole = 'CEO' | 'COO' | 'CTO' | 'SALES' | 'INVESTOR' | 'ENGINEER' | 'ADMIN';
export type ProfileType = 'ASSOCIATE' | 'EMPLOYEE';

export interface RbacProfile {
  role?: DashboardRole | string | null;
  type?: ProfileType | string | null;
  is_admin?: boolean | null;
  permissions?: Record<string, boolean> | null;
}

const DEFAULT_OPEN_ROUTES = new Set([
  '/dashboard',
  '/dashboard/ai',
  '/dashboard/projects',
  '/dashboard/tasks',
  '/dashboard/knowledge',
  '/dashboard/ideas',
  '/dashboard/calendar',
  '/dashboard/brand',
  '/dashboard/profile',
  '/dashboard/preview',
  '/dashboard/audit',
]);

const MODULE_RULES: Record<string, DashboardRole[]> = {
  treasury: ['CEO', 'COO', 'ADMIN'],
  equity: ['CEO', 'COO', 'CTO', 'SALES', 'ADMIN'],
  leads: ['CEO', 'COO', 'SALES', 'ADMIN'],
  studio: ['CEO', 'SALES', 'ADMIN'],
  coordination: ['CEO', 'SALES', 'ADMIN'],
  contracts: ['CEO', 'COO', 'ADMIN'],
  hr: ['CEO', 'COO', 'ADMIN', 'ENGINEER'],
  labs: ['CEO', 'CTO', 'ADMIN'],
  workspace: ['CEO', 'CTO', 'ADMIN'],
  settings: ['CEO', 'COO', 'CTO', 'ADMIN'],
  admin: ['CEO', 'ADMIN'],
  brand: ['CEO', 'SALES', 'ADMIN'],
  projects: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  tasks: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  knowledge: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  ideas: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  calendar: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  profile: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  preview: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
  audit: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
};

export function normalizePermissions(permissions: RbacProfile['permissions']) {
  return permissions && typeof permissions === 'object' ? permissions : {};
}

export function getModuleIdFromPathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] !== 'dashboard') return null;
  if (segments.length < 2) return null;

  const moduleId = segments[1];
  return moduleId;
}

export function isDashboardOpenRoute(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/login') return true;
  if (normalized === '/dashboard') return true;

  return [...DEFAULT_OPEN_ROUTES].some((route) => {
    if (route === '/dashboard') return false;
    return normalized === route || normalized.startsWith(`${route}/`);
  });
}

export function canAccessModule(profile: RbacProfile | null | undefined, moduleId: string) {
  if (!profile) return false;

  const role = (profile.role || '') as DashboardRole | string;
  const type = profile.type || '';
  const isAdmin = profile.is_admin === true || role === 'CEO' || role === 'ADMIN';
  const permissions = normalizePermissions(profile.permissions);

  if (isAdmin) return true;
  if (permissions[moduleId] === true) return true;
  if (permissions[moduleId] === false) return false;
  if (moduleId === 'hr' && type === 'EMPLOYEE') return true;

  const allowedRoles = MODULE_RULES[moduleId];
  if (!allowedRoles) return true;
  return allowedRoles.includes(role as DashboardRole);
}

export function canAccessPath(profile: RbacProfile | null | undefined, pathname: string) {
  if (isDashboardOpenRoute(pathname)) return true;

  const moduleId = getModuleIdFromPathname(pathname);
  if (!moduleId) return true;

  return canAccessModule(profile, moduleId);
}

export const ROUTE_ACCESS_MAP = MODULE_RULES;
