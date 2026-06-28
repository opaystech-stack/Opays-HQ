import { apiLogin, apiRegister, apiGetMe, apiLogout } from './api';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role_name: string | null;
  role_label: string | null;
  is_active: boolean;
}

// L'authentification repose sur un cookie de session HttpOnly posé par le backend.
// On ne stocke plus aucun jeton dans localStorage (protection contre le vol par XSS).

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await apiGetMe();
  if (error || !data) {
    return null;
  }
  return data.user;
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser } | { error: string }> {
  const { data, error } = await apiLogin(email, password);
  if (error || !data) return { error: error || 'Erreur de connexion' };
  // Le cookie de session est posé par le backend ; rien à stocker côté client.
  return { user: data.user };
}

export async function signUp(email: string, password: string, fullName?: string, roleName?: string): Promise<{ user: AuthUser } | { error: string }> {
  const { data, error } = await apiRegister(email, password, fullName, roleName);
  if (error || !data) return { error: error || "Erreur d'inscription" };
  return { user: data.user };
}

export async function signOut() {
  await apiLogout();
}
