// ============================================================================
// LAND•AI — Authentication & Authorization Types
// STRICT ROLES: ADMIN, REVENUE_OFFICER, VIEWER
// ============================================================================

export type UserRole = 'ADMIN' | 'REVENUE_OFFICER' | 'VIEWER';

export interface UserProfile {
  id: string;
  full_name?: string | null;
  email: string;
  role: UserRole;
  department?: string | null;
  district?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const VALID_USER_ROLES: readonly UserRole[] = [
  'ADMIN',
  'REVENUE_OFFICER',
  'VIEWER'
] as const;

export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && VALID_USER_ROLES.includes(role as UserRole);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'System Administrator',
  REVENUE_OFFICER: 'District Revenue Officer',
  VIEWER: 'Departmental Auditor / Viewer'
};

export interface AuthState {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signInWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}
