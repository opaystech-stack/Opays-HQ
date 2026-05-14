export type DashboardRole = 'CEO' | 'COO' | 'CTO' | 'SALES' | 'INVESTOR' | 'ENGINEER' | 'ADMIN';
export type ProfileType = 'ASSOCIATE' | 'EMPLOYEE';

export interface RbacProfile {
  id?: string | null;
  email?: string | null;
  role?: DashboardRole | string | null;
  type?: ProfileType | string | null;
  is_admin?: boolean | null;
  permissions?: Record<string, boolean> | null;
}

const DEFAULT_OPEN_ROUTES = new Set([
  '/dashboard',
  '/dashboard/profile',
]);

export const ALLOWED_ADMIN_EMAILS = [
  'lamsasfenelon@gmail.com',
  'ceo@opays.tech',
];

export const FENELON_EMAILS = new Set(ALLOWED_ADMIN_EMAILS);

export const FENELON_PROFILE_IDS = new Set<string>();

export const MODULE_IDS = [
  'ai',
  'projects',
  'tasks',
  'knowledge',
  'ideas',
  'calendar',
  'brand',
  'preview',
  'audit',
  'treasury',
  'equity',
  'leads',
  'studio',
  'coordination',
  'contracts',
  'documents',
  'hr',
  'labs',
  'workspace',
  'settings',
  'admin',
  'job-descriptions',
] as const;

// Règles par défaut basées sur les responsabilités.
export const DEFAULT_MODULE_RULES: Record<string, DashboardRole[]> = {
  leads: ['SALES'],
  studio: ['CEO', 'SALES', 'ADMIN'],
  coordination: ['CEO', 'COO', 'SALES', 'ADMIN'],
  labs: ['CEO', 'CTO', 'ADMIN'],
  workspace: ['CEO', 'CTO', 'ADMIN'],
  projects: ['CEO', 'CTO', 'ENGINEER', 'ADMIN'],
  tasks: ['CEO', 'ENGINEER', 'ADMIN'],
  settings: ['CEO', 'ADMIN'],
  admin: ['CEO', 'ADMIN'],
};

export function normalizePermissions(permissions: RbacProfile['permissions']) {
  return permissions && typeof permissions === 'object' ? permissions : {};
}

export function isRbacAdmin(profile: RbacProfile | null | undefined) {
  if (!profile) return false;

  const email = profile.email?.toLowerCase() || '';
  return FENELON_EMAILS.has(email) || profile.is_admin === true;
}

export function isFenelonProfile(profile: RbacProfile | null | undefined) {
  if (!profile) return false;

  const email = profile.email?.toLowerCase() || '';
  const id = profile.id?.toLowerCase() || '';
  return FENELON_EMAILS.has(email) || FENELON_PROFILE_IDS.has(id);
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

  const role = (profile.role || '') as DashboardRole;
  const isAdmin = isRbacAdmin(profile);
  const permissions = normalizePermissions(profile.permissions);

  // Fiches de poste: accès strictement réservé à Fenelon, même si un autre
  // profil porte le rôle CEO/Admin ou le flag is_admin.
  if (moduleId === 'job-descriptions') return isFenelonProfile(profile);

  // Fenelon et les administrateurs explicites gardent une couverture globale.
  if (isAdmin) return true;

  // Permission explicite: complément ou exception à la baseline.
  if (permissions[moduleId] === true) return true;
  if (permissions[moduleId] === false) return false;

  const allowedRoles = DEFAULT_MODULE_RULES[moduleId];
  if (allowedRoles && allowedRoles.includes(role)) return true;

  if (moduleId === 'hr' && profile.type === 'EMPLOYEE') return true;

  return false;
}

export function canGrantModulePermission(
  actor: RbacProfile | null | undefined,
  target: RbacProfile | null | undefined,
  moduleId: string
) {
  if (!actor || !target) return false;
  if (moduleId === 'job-descriptions') return false;

  return isFenelonProfile(actor) || isRbacAdmin(actor);
}

export function sanitizeGrantedPermissions(
  actor: RbacProfile | null | undefined,
  target: RbacProfile | null | undefined,
  nextPermissions: Record<string, boolean>
) {
  return Object.fromEntries(
    Object.entries(nextPermissions).filter(([moduleId]) =>
      canGrantModulePermission(actor, target, moduleId)
    )
  );
}

export function canAccessPath(profile: RbacProfile | null | undefined, pathname: string) {
  if (isDashboardOpenRoute(pathname)) return true;

  const moduleId = getModuleIdFromPathname(pathname);
  if (!moduleId) return true;

  return canAccessModule(profile, moduleId);
}

export const ROUTE_ACCESS_MAP = DEFAULT_MODULE_RULES;
