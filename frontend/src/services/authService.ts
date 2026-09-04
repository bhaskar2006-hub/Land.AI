// ============================================================================
// LAND•AI — Authentication Service
// Encapsulates Supabase Auth operations and strict profile & role validation.
// ============================================================================

import { supabase } from './supabase';
import { UserProfile, isValidUserRole } from '../types/auth';

export interface AuthResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * Fetch and strictly validate the user profile from the public.profiles table.
 */
export async function fetchUserProfile(userId: string): Promise<{
  profile: UserProfile | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, department, district, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[LAND•AI Auth] Profile query error:', error);
      return { profile: null, error: error.message };
    }

    if (!data) {
      return {
        profile: null,
        error: 'Your user profile is not configured. Please contact an administrator.'
      };
    }

    // Strict validation: role must be exactly ADMIN, REVENUE_OFFICER, or VIEWER
    if (!isValidUserRole(data.role)) {
      console.warn(`[LAND•AI Auth] User ${userId} has unallowed or invalid role: ${data.role}`);
      return {
        profile: null,
        error: 'Your account does not have a valid LAND•AI role.'
      };
    }

    return {
      profile: data as UserProfile
    };
  } catch (err: any) {
    console.error('[LAND•AI Auth] Unexpected profile resolution error:', err);
    return { profile: null, error: err?.message || 'Failed to resolve user profile.' };
  }
}

/**
 * Sign in with email and password via Supabase Auth,
 * then rigorously query and validate the user's role from public.profiles.
 */
export async function signInWithEmailPassword(
  email: string,
  pass: string
): Promise<AuthResult> {
  try {
    const cleanEmail = email.trim();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!data.user) {
      return { success: false, error: 'Authentication failed. Please verify credentials.' };
    }

    // Step 2: Query public.profiles using authenticated user ID
    const { profile, error: profileError } = await fetchUserProfile(data.user.id);

    // Profile missing or role invalid -> Sign out immediately!
    if (!profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: profileError || 'Your account does not have a valid LAND•AI role.'
      };
    }

    return {
      success: true,
      profile
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during sign-in.'
    };
  }
}

/**
 * Sign out user and invalidate Supabase session.
 */
export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[LAND•AI Auth] Error during sign-out:', err);
  }
}
