import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import {
  UserProfile,
  UserRole,
  AuthContextType,
  AuthState
} from '../types/auth';
import {
  fetchUserProfile,
  signInWithEmailPassword,
  signOutUser
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    error: null
  });

  const loadUserProfile = useCallback(async (userId: string, userEmail: string) => {
    const { profile, error } = await fetchUserProfile(userId);

    if (!profile) {
      console.warn('[LAND•AI Auth] Active session detected but profile invalid or missing. Forcing sign-out.');
      await signOutUser();
      setAuthState({
        user: null,
        profile: null,
        role: null,
        loading: false,
        error: error || 'Your account does not have a valid LAND•AI role.'
      });
      return null;
    }

    setAuthState({
      user: { id: userId, email: userEmail },
      profile,
      role: profile.role,
      loading: false,
      error: null
    });

    return profile;
  }, []);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('[LAND•AI Auth] Error fetching initial session:', sessionError);
        }

        if (session?.user && mounted) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            role: null,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('[LAND•AI Auth] Initialization error:', err);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            role: null,
            loading: false,
            error: null
          });
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            role: null,
            loading: false,
            error: null
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signIn = async (email: string, pass: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await signInWithEmailPassword(email, pass);

    if (result.success && result.profile) {
      setAuthState({
        user: { id: result.profile.id, email: result.profile.email },
        profile: result.profile,
        role: result.profile.role,
        loading: false,
        error: null
      });
      return { success: true };
    }

    setAuthState({
      user: null,
      profile: null,
      role: null,
      loading: false,
      error: result.error || 'Authentication failed'
    });

    return { success: false, error: result.error };
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    await signOutUser();
    setAuthState({
      user: null,
      profile: null,
      role: null,
      loading: false,
      error: null
    });
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!authState.user) return null;
    return await loadUserProfile(authState.user.id, authState.user.email);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signInWithPassword: signIn,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
